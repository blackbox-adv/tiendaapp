import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// POST /api/payments/create-intent - Create a payment intent
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { planId, storeId, paymentMethod } = body

    if (!planId) {
      return NextResponse.json({ error: 'planId es requerido' }, { status: 400 })
    }

    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    let targetStoreId = storeId
    if (!targetStoreId) {
      const userStores = await db.store.findMany({
        where: { ownerId: auth.user.userId },
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

    return NextResponse.json({
      success: true,
      paymentIntent,
      message: `Pago preparado: S/${plan.price.toFixed(2)} por plan ${plan.name}`,
    })
  } catch {
    return NextResponse.json({ error: 'Error creando pago' }, { status: 500 })
  }
}

// GET /api/payments/plans - List available plans with pricing
export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { type: { not: 'free' } },
      orderBy: { price: 'asc' },
    })

    return NextResponse.json({
      plans,
      currency: 'PEN',
      currencySymbol: 'S/',
      countryCode: 'PE',
      paymentMethods: ['visa', 'mastercard', 'american_express', 'diners_club'],
      gateway: 'culqi',
    })
  } catch {
    return NextResponse.json({ error: 'Error obteniendo planes de pago' }, { status: 500 })
  }
}

// PUT /api/payments/webhook - Webhook endpoint for Culqi/Niubiz
// SECURITY: Requires WEBHOOK_SECRET for signature verification
export async function PUT(request: NextRequest) {
  // ── 1. Verify webhook signature ──
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[PAYMENTS] WEBHOOK_SECRET not configured. Rejecting webhook.')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const signature = request.headers.get('x-webhook-signature') || request.headers.get('x-culqi-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  // Simple HMAC verification (adapt per gateway docs)
  const crypto = await import('crypto')
  const rawBody = await request.text()
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSig) {
    console.warn('[PAYMENTS] Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // ── 2. Process verified webhook ──
  try {
    const body = JSON.parse(rawBody)
    const { userId, planId, storeId, status, externalRef } = body

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 })
    }

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
            storeId: storeId || null,
            planId,
            status: 'active',
            startDate: new Date(),
          },
        })
      }

      // Log the webhook event
      await db.payment.create({
        data: {
          amount: 0,
          status: 'completed',
          externalRef: externalRef || `webhook_${Date.now()}`,
          subscriptionId: existing?.id || '',
          userId,
          storeId: storeId || '',
          planId,
        },
      })

      return NextResponse.json({ success: true, message: 'Suscripcion activada' })
    }

    return NextResponse.json({ success: false, message: 'Pago no completado' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}
