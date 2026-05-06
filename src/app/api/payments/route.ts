import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, paymentIntentSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/payments/create-intent - Create a payment intent
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(paymentIntentSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { planId, storeId, paymentMethod } = validation.data

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
        return apiError('Acceso denegado', 403, undefined, request)
      }
    }

    let targetStoreId = storeId
    if (!targetStoreId) {
      const userStores = await db.store.findMany({
        where: { ownerId: auth.user.userId },
        select: { id: true },
      })
      if (userStores.length > 0) {
        targetStoreId = userStores[0].id
      }
    }

    const paymentIntent = {
      amount: Math.round(plan.price * 100),
      currency: 'PEN',
      description: `Plan ${plan.name} - TiendApp`,
      metadata: {
        userId: auth.user.userId,
        planId: plan.id,
        planName: plan.name,
        storeId: targetStoreId || null,
        email: auth.user.email,
      },
    }

    return apiSuccess({
      success: true,
      paymentIntent,
      message: `Pago preparado: S/${plan.price.toFixed(2)} por plan ${plan.name}`,
    }, 200, request)
  } catch {
    return apiError('Error creando pago', 500, undefined, request)
  }
}

// GET /api/payments/plans - List available plans with pricing
export async function GET(request: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: { type: { not: 'free' } },
      orderBy: { price: 'asc' },
    })

    return apiSuccess(
      {
        plans,
        currency: 'PEN',
        currencySymbol: 'S/',
        countryCode: 'PE',
        paymentMethods: ['visa', 'mastercard', 'american_express', 'diners_club'],
        gateway: 'culqi',
      },
      200,
      request
    )
  } catch {
    return apiError('Error obteniendo planes de pago', 500, undefined, request)
  }
}

// PUT /api/payments/webhook - Webhook endpoint for Culqi/Niubiz
export async function PUT(request: NextRequest) {
  // ── 1. Verify webhook signature ──
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[PAYMENTS] WEBHOOK_SECRET not configured. Rejecting webhook.')
    return apiError('Webhook not configured', 503, undefined, request)
  }

  const signature =
    request.headers.get('x-webhook-signature') || request.headers.get('x-culqi-signature')
  if (!signature) {
    return apiError('Missing signature', 401, undefined, request)
  }

  const crypto = await import('crypto')
  const rawBody = await request.text()
  const expectedSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

  try {
    const sigBuffer = Buffer.from(signature, 'utf-8')
    const expectedBuffer = Buffer.from(expectedSig, 'utf-8')
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      console.warn('[PAYMENTS] Invalid webhook signature')
      return apiError('Invalid signature', 401, undefined, request)
    }
  } catch {
    console.warn('[PAYMENTS] Signature comparison error')
    return apiError('Invalid signature', 401, undefined, request)
  }

  // ── 2. Validate body ──
  try {
    const body = JSON.parse(rawBody)
    const { webhookSchema } = await import('@/lib/validations')
    const validation = webhookSchema.safeParse(body)
    if (!validation.success) {
      return apiError('Datos de webhook invalidos', 400, undefined, request)
    }

    const { userId, planId, storeId, status, externalRef, amount } = validation.data

    if (status === 'succeeded' || status === 'paid') {
      const existing = await db.subscription.findFirst({
        where: { userId, status: 'active' },
      })

      if (existing) {
        await db.subscription.update({
          where: { id: existing.id },
          data: { planId, startDate: new Date(), status: 'active' },
        })
      } else {
        await db.subscription.create({
          data: {
            userId,
            storeId: storeId || '',
            planId,
            status: 'active',
            startDate: new Date(),
          },
        })
      }

      // Log the payment event
      await db.payment.create({
        data: {
          amount: amount || 0,
          status: 'completed',
          externalRef: externalRef || `webhook_${Date.now()}`,
          subscriptionId: existing?.id || '',
          userId,
          storeId: storeId || '',
          planId,
        },
      })

      return apiSuccess({ success: true, message: 'Suscripcion activada' }, 200, request)
    }

    return apiSuccess({ success: false, message: 'Pago no completado' }, 400, request)
  } catch {
    return apiError('Error procesando webhook', 500, undefined, request)
  }
}

// OPTIONS /api/payments - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
