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

      const store = await db.store.findUnique({
        where: { slug },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              originalPrice: true,
              imageUrl: true,
              category: true,
              isActive: true,
              featured: true,
              rating: true,
              storeId: true,
              createdAt: true,
            },
          },
          owner: { select: { id: true, name: true } },  // FIXED: Removed email to prevent PII exposure
        },
      })

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
    const auth = authenticateRequest(request)
    if (auth.error) {
      return apiError(auth.error, auth.status, undefined, request)
    }
    if (!auth.user) return apiError('No autenticado', 401, undefined, request)

    // Admin gets all stores; owner gets only their own
    if (requireRole(auth.user, ['super_admin'])) {
      // Use raw SQL to avoid Prisma type conversion issues with Supabase
      const sql = db.$queryRawUnsafe.bind(db)
      type StoreRow = {
        id: string; name: string; slug: string; description: string; logo: string
        primaryColor: string; secondaryColor: string; whatsappNumber: string | null
        template: string; category: string; isActive: boolean; visitCount: number
        createdAt: string; ownerId: string
        ownerName: string; ownerEmail: string; productCount: number
        planId: string | null; planName: string | null; planPrice: string | null
        subStatus: string | null
        hasShipping: boolean; hasSecurePayment: boolean; hasReturns: boolean
      }
      const rows: StoreRow[] = await sql(
        `SELECT s.id, s.name, s.slug, s.description, s.logo,
                s."primaryColor", s."secondaryColor", s."whatsappNumber",
                s.template, s.category, s."isActive", s."visitCount"::int,
                s."createdAt"::text, s."ownerId",
                s."hasShipping", s."hasSecurePayment", s."hasReturns",
                u.name as "ownerName", u.email as "ownerEmail",
                COUNT(p.id)::int as "productCount",
                sub_plan."planId", sub_plan."planName",
                sub_plan."planPrice", sub_plan."subStatus"
         FROM "Store" s
         JOIN "User" u ON s."ownerId" = u.id
         LEFT JOIN LATERAL (
           SELECT sub.id, sub."planId", pl.name as "planName",
                  pl.price::text as "planPrice", sub.status::text as "subStatus"
           FROM "Subscription" sub
           JOIN "Plan" pl ON sub."planId" = pl.id
           WHERE sub."storeId" = s.id
           ORDER BY sub."createdAt" DESC LIMIT 1
         ) sub_plan ON true
         LEFT JOIN "StoreProduct" p ON p."storeId" = s.id AND p."isActive" = true
         GROUP BY s.id, s.name, s.slug, s.description, s.logo,
                  s."primaryColor", s."secondaryColor", s."whatsappNumber",
                  s.template, s.category, s."isActive", s."visitCount",
                  s."createdAt", s."ownerId", u.name, u.email,
                  sub_plan."planId", sub_plan."planName",
                  sub_plan."planPrice", sub_plan."subStatus"
         ORDER BY s."createdAt" DESC`
      )

      const stores = rows.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        logo: r.logo,
        primaryColor: r.primaryColor,
        secondaryColor: r.secondaryColor,
        whatsappNumber: r.whatsappNumber,
        template: r.template,
        category: r.category,
        isActive: r.isActive,
        visitCount: r.visitCount,
        createdAt: r.createdAt,
        ownerId: r.ownerId,
        hasShipping: r.hasShipping,
        hasSecurePayment: r.hasSecurePayment,
        hasReturns: r.hasReturns,
        owner: { id: r.ownerId, name: r.ownerName, email: r.ownerEmail },
        _count: { products: r.productCount },
        subscriptions: r.planId ? [{
          status: r.subStatus || 'active',
          plan: { id: r.planId, name: r.planName || 'Free', price: parseFloat(r.planPrice || '0') },
        }] : [],
      }))

      return apiSuccess(serializeDecimals(stores), 200, request)
    }

    // Regular owner: return their own stores
    const myStores = await db.store.findMany({
      where: { ownerId: auth.user.userId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true } },
        subscriptions: { include: { plan: { select: { id: true, name: true, price: true } } } },
      },
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
  const auth = authenticateRequest(request)
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

    // Check store limit per plan (owner gets 1 store on free, up to 3 on premium)
    const existingStores = await db.store.count({
      where: { ownerId: auth.user.userId },
    })

    // Check user's plan for store limit
    const userSubs = await db.subscription.findMany({
      where: { userId: auth.user.userId, status: 'active' },
      include: { plan: true },
      orderBy: { startDate: 'desc' },
      take: 1,
    })

    let maxStores = 1 // Default: 1 store
    if (userSubs.length > 0 && userSubs[0].plan) {
      const planType = userSubs[0].plan.type
      if (planType === 'premium') maxStores = 3
      else if (planType === 'pro') maxStores = 1
    }

    if (existingStores >= maxStores) {
      return apiError(
        `Has alcanzado el limite de ${maxStores} tienda(s). Actualiza tu plan para mas.`,
        403,
        undefined,
        request
      )
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

    const store = await db.store.create({
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
      include: { owner: { select: { id: true, name: true, email: true } } },
    })

    return apiSuccess(serializeDecimals(store), 201, request)
  } catch (error: unknown) {
    console.error('[STORES] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error creando tienda', 500, undefined, request)
  }
}

// PUT /api/stores - Update store (auth required + ownership check)
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
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

    const store = await db.store.update({
      where: { id },
      data,
      include: { owner: { select: { id: true, name: true, email: true } } },
    })

    return apiSuccess(serializeDecimals(store), 200, request)
  } catch (error: unknown) {
    console.error('[STORES] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando tienda', 500, undefined, request)
  }
}

// OPTIONS /api/stores - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
