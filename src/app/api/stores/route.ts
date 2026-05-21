import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, createStoreSchema, updateStoreSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { sanitizeBasic, sanitizeHtml } from '@/lib/sanitize'
import { serializeDecimals } from '@/lib/utils'

// GET /api/stores - Public (store browsing by slug) or admin-only (list all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      // Sanitize slug: only allow alphanumeric and hyphens
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return apiError('Slug invalido', 400, undefined, request)
      }

      // Use raw SQL for slug lookup to avoid PgBouncer timeout with Prisma include.
      // The include (products + owner) can hang indefinitely through PgBouncer.
      const storeRows = await db.$queryRawUnsafe(`
        SELECT s.*, 
          COALESCE(json_agg(
            json_build_object(
              'id', p.id, 'name', p.name, 'description', p.description,
              'price', p.price, 'originalPrice', p."originalPrice",
              'imageUrl', p."imageUrl", 'category', p.category,
              'isActive', p."isActive", 'featured', p.featured,
              'rating', p.rating, 'storeId', p."storeId", 'createdAt', p."createdAt"
            )
          ) FILTER (WHERE p.id IS NOT NULL AND p."isActive" = true), '[]') as products,
          json_build_object('id', u.id, 'name', u.name) as owner
        FROM "Store" s
        LEFT JOIN "Product" p ON p."storeId" = s.id AND p."isActive" = true
        LEFT JOIN "User" u ON u.id = s."ownerId"
        WHERE s.slug = $1
        GROUP BY s.id, u.id, u.name
        LIMIT 1
      `, slug)

      const store = Array.isArray(storeRows) && storeRows.length > 0 ? storeRows[0] : null

      if (!store) {
        return apiError('Tienda no encontrada', 404, undefined, request)
      }

      // Increment visit count (fire-and-forget, don't block response)
      db.store
        .update({
          where: { id: store.id },
          data: { visitCount: { increment: 1 } },
        })
        .catch(() => {})

      return apiSuccess(serializeDecimals(store), 200, request)
    }

    // Auth check (required for any store listing)
    const auth = await authenticateRequest(request)
    if (auth.error) {
      return apiError(auth.error, auth.status, undefined, request)
    }
    if (!auth.user) return apiError('No autenticado', 401, undefined, request)

    // Admin gets all stores — redirect to dedicated admin endpoint
    // which uses raw SQL to avoid PgBouncer timeout with Prisma include
    if (requireRole(auth.user, ['super_admin'])) {
      // Use the same raw SQL pattern as /api/admin/stores to avoid PgBouncer issues
      const stores = await db.$queryRawUnsafe(`
        SELECT s.id, s.name, s.slug, s.description, s.logo, s."primaryColor", s."secondaryColor",
          s."whatsappNumber", s.template, s.category, s."isActive", s."visitCount",
          s."createdAt", s."ownerId", s."bannerUrl",
          s."hasShipping", s."hasSecurePayment", s."hasReturns",
          u.name as "ownerName", u.email as "ownerEmail",
          COALESCE(product_count.cnt, 0) as "productCount",
          COALESCE(sub_data.plan_id, '') as "planId",
          COALESCE(sub_data.plan_name, 'Free') as "planName",
          COALESCE(sub_data.plan_price, 0) as "planPrice"
        FROM "Store" s
        LEFT JOIN "User" u ON u.id = s."ownerId"
        LEFT JOIN LATERAL (
          SELECT COUNT(*) as cnt FROM "Product" p WHERE p."storeId" = s.id AND p."isActive" = true
        ) product_count ON true
        LEFT JOIN LATERAL (
          SELECT sub.plan_id, pl.name as plan_name, pl.price as plan_price
          FROM "Subscription" sub
          JOIN "Plan" pl ON pl.id = sub.plan_id
          WHERE sub.user_id = s."ownerId" AND sub.status = 'active'
          ORDER BY sub."createdAt" DESC LIMIT 1
        ) sub_data ON true
        ORDER BY s."createdAt" DESC
      `)

      const mappedStores = (Array.isArray(stores) ? stores : []).map((s: Record<string, unknown>) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        logo: s.logo,
        primaryColor: s.primaryColor,
        secondaryColor: s.secondaryColor,
        whatsappNumber: s.whatsappNumber,
        template: s.template,
        category: s.category,
        isActive: s.isActive,
        visitCount: Number(s.visitCount) || 0,
        createdAt: s.createdAt,
        ownerId: s.ownerId,
        bannerUrl: s.bannerUrl,
        hasShipping: s.hasShipping,
        hasSecurePayment: s.hasSecurePayment,
        hasReturns: s.hasReturns,
        owner: { id: s.ownerId, name: s.ownerName, email: s.ownerEmail },
        _count: { products: Number(s.productCount) || 0 },
        subscriptions: [{
          status: 'active',
          plan: { id: s.planId || '', name: s.planName || 'Free', price: Number(s.planPrice) || 0 },
        }],
      }))

      return apiSuccess(serializeDecimals(mappedStores), 200, request)
    }

    // Regular owner: return their own stores
    // Use simple query without includes to avoid PgBouncer timeout.
    // Prisma include with nested relations (subscriptions → plan) can hang indefinitely
    // through PgBouncer, causing Vercel function timeout before catch fallback runs.
    const myStores = await db.store.findMany({
      where: { ownerId: auth.user.userId },
      orderBy: { createdAt: 'desc' },
    })

    return apiSuccess(serializeDecimals(myStores), 200, request)
  } catch (error: unknown) {
    console.error('[STORES] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo tiendas', 500, undefined, request)
  }
}

// POST /api/stores - Create store (auth required)
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()

    // Remove ownerId from body - users cannot set this
    const { ownerId: _removedOwnerId, ...cleanBody } = body
    delete (cleanBody as Record<string, unknown>).ownerId

    const validation = validateBody(createStoreSchema, cleanBody)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { name, description, category, logo, primaryColor, secondaryColor, whatsappNumber, template } =
      validation.data

    // CRITICAL FIX: Use transaction to prevent race condition on store limit check
    const store = await db.$transaction(async (tx) => {
      // Check store limit per plan (owner gets 1 store on free, up to 3 on premium)
      const existingStores = await tx.store.count({
        where: { ownerId: auth.user.userId },
      })

      // Check user's plan for store limit — use raw SQL to avoid PgBouncer include timeout
      let maxStores = 1 // Default: 1 store
      try {
        const planResult = await tx.$queryRawUnsafe(`
          SELECT pl.type, pl.name FROM "Subscription" sub
          JOIN "Plan" pl ON pl.id = sub.plan_id
          WHERE sub.user_id = $1 AND sub.status = 'active'
          ORDER BY sub."createdAt" DESC LIMIT 1
        `, auth.user.userId) as Array<Record<string, unknown>>
        if (Array.isArray(planResult) && planResult.length > 0) {
          const planType = planResult[0].type as string
          if (planType === 'premium') maxStores = 3
          else if (planType === 'pro') maxStores = 1
        }
      } catch { /* use default */ }

      if (existingStores >= maxStores) {
        throw new Error('STORE_LIMIT')
      }

      // Sanitize user-generated content
      const sanitizedName = sanitizeBasic(name)
      const sanitizedDescription = sanitizeHtml(description || '')
      const sanitizedCategory = sanitizeBasic(category || 'general')

      // Generate unique slug from sanitized name
      const baseSlug = sanitizedName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 60)

      const slug = `${baseSlug}-${Date.now().toString(36)}`

      // Create without include to avoid PgBouncer timeout
      return tx.store.create({
        data: {
          ownerId: auth.user.userId,
          name: sanitizedName,
          slug,
          description: sanitizedDescription,
          logo: logo || '',
          primaryColor: primaryColor || '#7C3AED',
          secondaryColor: secondaryColor || '#10B981',
          whatsappNumber: whatsappNumber || '',
          template: template || 'moderna',
          category: sanitizedCategory,
        },
      })
    }).catch((err) => {
      if (err instanceof Error && err.message === 'STORE_LIMIT') {
        return 'STORE_LIMIT'
      }
      console.error('[STORES] Transaction error:', err)
      return null
    })

    if (store === 'STORE_LIMIT') {
      return apiError(
        `Has alcanzado el limite de 1 tienda(s). Actualiza tu plan para mas.`,
        403,
        undefined,
        request
      )
    }

    if (store === null) {
      return apiError('Error creando tienda', 500, undefined, request)
    }

    return apiSuccess(serializeDecimals(store), 201, request)
  } catch (error: unknown) {
    console.error('[STORES] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error creando tienda', 500, undefined, request)
  }
}

// PUT /api/stores - Update store (auth required + ownership check)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(updateStoreSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { id, ...data } = validation.data

    // Prevent changing ownership via this endpoint
    delete (data as Record<string, unknown>).ownerId

    // Sanitize user-generated content
    if (data.name) data.name = sanitizeBasic(data.name)
    if (data.description) data.description = sanitizeHtml(data.description)
    if (data.category) data.category = sanitizeBasic(data.category)

    // Check ownership (unless admin)
    if (!requireRole(auth.user, ['super_admin'])) {
      const store = await db.store.findUnique({ where: { id } })
      if (!store) {
        return apiError('Tienda no encontrada', 404, undefined, request)
      }
      if (store.ownerId !== auth.user.userId) {
        return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request)
      }
    }

    // Perform the update
    await db.store.update({
      where: { id },
      data,
    })

    // Return updated store — use simple query to avoid PgBouncer timeout with Prisma include.
    // The include (owner + subscriptions → plan) can hang indefinitely through PgBouncer,
    // causing Vercel function timeout before the catch fallback runs.
    // We fetch the store data without relations since the client already knows the owner.
    const updatedStore = await db.store.findUnique({ where: { id } })

    if (!updatedStore) {
      return apiError('Tienda no encontrada tras actualizar', 404, undefined, request)
    }

    return apiSuccess(serializeDecimals(updatedStore), 200, request)
  } catch (error: unknown) {
    console.error('[STORES] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando tienda', 500, undefined, request)
  }
}

// DELETE /api/stores - Delete store (admin only)
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores pueden eliminar tiendas.', 403, undefined, request)
  }

  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('id')

    if (!storeId) {
      return apiError('ID de tienda requerido', 400, undefined, request)
    }

    // Check store exists — use raw SQL to avoid PgBouncer include timeout
    const storeResult = await db.$queryRawUnsafe(`
      SELECT s.id, s.name, 
        (SELECT COUNT(*) FROM "Product" p WHERE p."storeId" = s.id) as "productCount"
      FROM "Store" s WHERE s.id = $1
    `, storeId) as Array<Record<string, unknown>>

    if (!Array.isArray(storeResult) || storeResult.length === 0) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }

    const storeInfo = storeResult[0]

    // Delete the store - cascade will handle products, subscriptions, payments
    await db.store.delete({
      where: { id: storeId },
    })

    return apiSuccess(
      {
        message: `Tienda "${storeInfo.name}" eliminada correctamente`,
        deletedStoreId: storeId,
        deletedProducts: Number(storeInfo.productCount) || 0,
      },
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[STORES] DELETE error:', error instanceof Error ? error.message : String(error))
    return apiError('Error eliminando tienda', 500, undefined, request)
  }
}

// OPTIONS /api/stores - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
