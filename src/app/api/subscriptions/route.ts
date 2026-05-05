import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, createSubscriptionSchema, updateSubscriptionSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// GET /api/subscriptions - Admin only
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado', 403, undefined, request)
  }

  try {
    const subscriptions = await db.subscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
      orderBy: { startDate: 'desc' },
    })

    return apiSuccess(subscriptions, 200, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo suscripciones', 500, undefined, request)
  }
}

// POST /api/subscriptions - Auth required (users manage own, admin manages all)
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(createSubscriptionSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { userId, storeId, planId, status } = validation.data

    // Users can only manage their own subscriptions (unless admin)
    if (!requireRole(auth.user, ['super_admin']) && auth.user.userId !== userId) {
      return apiError('Acceso denegado. Solo puedes gestionar tus suscripciones.', 403, undefined, request)
    }

    // Verify the plan exists
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return apiError('Plan no encontrado', 404, undefined, request)
    }

    // Verify store ownership if storeId provided
    if (storeId) {
      const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } })
      if (!store) {
        return apiError('Tienda no encontrada', 404, undefined, request)
      }
      if (!requireRole(auth.user, ['super_admin']) && store.ownerId !== auth.user.userId) {
        return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request)
      }
    }

    const existing = await db.subscription.findFirst({
      where: { userId, storeId: storeId || undefined, status: 'active' },
    })

    // Calculate nextBillingDate: 30 days from now for paid plans
    const nextBillingDate = plan.type !== 'free'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null

    if (existing) {
      const updated = await db.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          status: status || 'active',
          startDate: new Date(),
          nextBillingDate,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true, slug: true } },
          plan: { select: { id: true, name: true, price: true } },
        },
      })
      return apiSuccess(updated, 200, request)
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        storeId: storeId || '',
        planId,
        status: status || 'active',
        startDate: new Date(),
        nextBillingDate,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    })

    return apiSuccess(subscription, 201, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error creando suscripcion', 500, undefined, request)
  }
}

// PUT /api/subscriptions - Auth required (admin can update any, user can cancel own)
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(updateSubscriptionSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { id, planId, status } = validation.data

    // Fetch subscription to check ownership
    const subscription = await db.subscription.findUnique({
      where: { id },
      include: { user: { select: { id: true } } },
    })

    if (!subscription) {
      return apiError('Suscripcion no encontrada', 404, undefined, request)
    }

    // Only admin or subscription owner can update
    if (!requireRole(auth.user, ['super_admin']) && subscription.userId !== auth.user.userId) {
      return apiError('Acceso denegado', 403, undefined, request)
    }

    // Non-admin users can only cancel their own subscription
    if (!requireRole(auth.user, ['super_admin']) && status && status !== 'cancelled') {
      return apiError('Solo puedes cancelar tu suscripcion. Contacta soporte para otros cambios.', 403, undefined, request)
    }

    const data: Record<string, unknown> = {}
    if (planId) data.planId = planId
    if (status) {
      data.status = status
      if (status === 'cancelled') data.endDate = new Date()
    }

    const updated = await db.subscription.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    })

    return apiSuccess(updated, 200, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando suscripcion', 500, undefined, request)
  }
}

// OPTIONS /api/subscriptions - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
