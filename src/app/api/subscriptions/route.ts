import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, createSubscriptionSchema, updateSubscriptionSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { sendSubscriptionEmail } from '@/lib/email'
import { serializeDecimals, decimalToNumber } from '@/lib/utils'

// GET /api/subscriptions - Admin only
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado', 403, undefined, request)
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true, slug: true } },
          plan: { select: { id: true, name: true, price: true, type: true } },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      db.subscription.count(),
    ])

    return apiSuccess(serializeDecimals({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }), 200, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo suscripciones', 500, undefined, request)
  }
}

// POST /api/subscriptions - Auth required
// Users can ONLY create free plan subscriptions.
// Paid plan subscriptions are created ONLY via admin approval or webhook.
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
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

    const { userId, storeId, planId } = validation.data

    // Users can only manage their own subscriptions (unless admin)
    if (!requireRole(auth.user, ['super_admin']) && auth.user.userId !== userId) {
      return apiError('Acceso denegado. Solo puedes gestionar tus suscripciones.', 403, undefined, request)
    }

    // Verify the plan exists
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return apiError('Plan no encontrado', 404, undefined, request)
    }

    // CRITICAL FIX: Non-admin users CANNOT activate paid plans directly.
    // Paid plans must go through the payment flow (admin approval or webhook).
    if (plan.type !== 'free' && !requireRole(auth.user, ['super_admin'])) {
      return apiError(
        'No puedes activar un plan de pago directamente. Realiza el pago a través del flujo de suscripción.',
        403,
        undefined,
        request
      )
    }

    // Verify store ownership if storeId provided
    if (storeId) {
      const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } })
      if (!store) {
        return apiError('Tienda no encontrada', 404, undefined, request)
      }
      if (!requireRole(auth.user, ['super_admin']) && store.ownerId !== auth.user.userId) {
        return apiError('Acceso denegado. No eres dueño de esta tienda.', 403, undefined, request)
      }
    }

    const existing = await db.subscription.findFirst({
      where: { userId, storeId: storeId || undefined, status: 'active' },
    })

    // Calculate nextBillingDate based on billing cycle for paid plans
    const nextBillingDate = plan.type !== 'free'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      : null

    if (existing) {
      const updated = await db.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          status: 'active',
          startDate: new Date(),
          nextBillingDate,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true, slug: true } },
          plan: { select: { id: true, name: true, price: true, type: true } },
        },
      })

      // Send email notification for free plan downgrade
      if (plan.type === 'free' && existing.planId !== planId) {
        const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
        if (user) {
          sendSubscriptionEmail(user.name, user.email, plan.name, decimalToNumber(plan.price), 'downgraded').catch(() => {})
        }
      }

      return apiSuccess(serializeDecimals(updated), 200, request)
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        storeId: storeId || '',
        planId,
        status: 'active',
        startDate: new Date(),
        nextBillingDate,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true, type: true } },
      },
    })

    return apiSuccess(serializeDecimals(subscription), 201, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error creando suscripción', 500, undefined, request)
  }
}

// PUT /api/subscriptions - Auth required (admin can update any, user can cancel own)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
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
      include: { user: { select: { id: true, name: true, email: true } }, plan: { select: { id: true, name: true, price: true, type: true } } },
    })

    if (!subscription) {
      return apiError('Suscripción no encontrada', 404, undefined, request)
    }

    // Only admin or subscription owner can update
    if (!requireRole(auth.user, ['super_admin']) && subscription.userId !== auth.user.userId) {
      return apiError('Acceso denegado', 403, undefined, request)
    }

    // Non-admin users can only cancel their own subscription
    if (!requireRole(auth.user, ['super_admin']) && status && status !== 'cancelled') {
      return apiError('Solo puedes cancelar tu suscripción. Contacta soporte para otros cambios.', 403, undefined, request)
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
        plan: { select: { id: true, name: true, price: true, type: true } },
      },
    })

    // Send cancellation email
    if (status === 'cancelled' && subscription.user) {
      sendSubscriptionEmail(
        subscription.user.name,
        subscription.user.email,
        subscription.plan.name,
        decimalToNumber(subscription.plan.price),
        'cancelled'
      ).catch(() => {})
    }

    return apiSuccess(serializeDecimals(updated), 200, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando suscripción', 500, undefined, request)
  }
}

// OPTIONS /api/subscriptions - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
