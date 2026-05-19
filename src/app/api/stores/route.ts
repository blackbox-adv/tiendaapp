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
    const auth = await authenticateRequest(request)
    if (auth.error) {
      return apiError(auth.error, auth.status, undefined, request)
    }
    if (!auth.user) return apiError('No autenticado', 401, undefined, request)

    // Admin gets all stores; owner gets only their own
    if (requireRole(auth.user, ['super_admin'])) {
      const allStores = await db.store.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { products: { where: { isActive: true } } } },
          subscriptions: {
            include: { plan: { select: { id: true, name: true, price: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const stores = allStores.map(s => ({
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
        visitCount: s.visitCount,
        createdAt: s.createdAt,
        ownerId: s.ownerId,
        hasShipping: s.hasShipping,
        hasSecurePayment: s.hasSecurePayment,
        hasReturns: s.hasReturns,
        owner: { id: s.owner.id, name: s.owner.name, email: s.owner.email },
        _count: { products: s._count.products },
        subscriptions: s.subscriptions.map(sub => ({
          status: sub.status,
          plan: { id: sub.plan.id, name: sub.plan.name, price: Number(sub.plan.price) },
        })),
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

      // Check user's plan for store limit
      const userSubs = await tx.subscription.findMany({
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
        include: { owner: { select: { id: true, name: true, email: true } } },
      })
    }).catch((err) => {
      if (err instanceof Error && err.message === 'STORE_LIMIT') {
        return 'STORE_LIMIT'
      }
      console.error('[STORES] Transaction error:', err)
      return null
    })

    if (store === 'STORE_LIMIT') {
      // Re-check for the limit message
      const userSubs = await db.subscription.findMany({
        where: { userId: auth.user.userId, status: 'active' },
        include: { plan: true },
        orderBy: { startDate: 'desc' },
        take: 1,
      })
      let maxStores = 1
      if (userSubs.length > 0 && userSubs[0].plan) {
        const planType = userSubs[0].plan.type
        if (planType === 'premium') maxStores = 3
        else if (planType === 'pro') maxStores = 1
      }
      return apiError(
        `Has alcanzado el limite de ${maxStores} tienda(s). Actualiza tu plan para mas.`,
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

    const store = await db.store.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        subscriptions: { include: { plan: { select: { id: true, name: true, price: true } } } },
      },
    })

    return apiSuccess(serializeDecimals(store), 200, request)
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

    // Check store exists
    const store = await db.store.findUnique({
      where: { id: storeId },
      include: {
        _count: { select: { products: true, subscriptions: true } },
      },
    })

    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }

    // Delete the store - cascade will handle products, subscriptions, payments
    await db.store.delete({
      where: { id: storeId },
    })

    return apiSuccess(
      {
        message: `Tienda "${store.name}" eliminada correctamente`,
        deletedStoreId: storeId,
        deletedProducts: store._count.products,
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
