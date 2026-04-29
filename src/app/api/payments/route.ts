import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// POST /api/payments/create-intent - Create a payment intent
// This endpoint prepares a payment for Culqi/Niubiz integration
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { planId, storeId, paymentMethod } = body

    if (!planId) {
      return NextResponse.json({ error: 'planId es requerido' }, { status: 400 })
    }

    // Validate plan exists
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    // Get or create store
    let targetStoreId = storeId
    if (!targetStoreId) {
      const userStores = await db.store.findMany({
        where: { ownerId: auth.user.userId },
      })
      if (userStores.length > 0) {
        targetStoreId = userStores[0].id
      }
    }

    // Prepare payment intent (for Culqi integration)
    const paymentIntent = {
      amount: Math.round(plan.price * 100), // Amount in cents
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

    // In production, this would call:
    // Culqi: POST https://api.culqi.com/v2/charges
    // Niubiz: POST https://api.niubiz.com.pe/api.authorization/v3/authorization/ecomm
    
    return NextResponse.json({
      success: true,
      paymentIntent,
      message: `Pago preparado: S/${plan.price.toFixed(2)} por plan ${plan.name}`,
      // In production, return the charge_id or token from the gateway
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creando pago'
    return NextResponse.json({ error: message }, { status: 500 })
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
      // These are the payment gateways that will be integrated:
      gateway: 'culqi', // or 'niubiz'
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching payment plans'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/payments/webhook - Webhook endpoint for Culqi/Niubiz
// This receives payment confirmations from the payment gateway
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planId, storeId, status, externalRef } = body

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 })
    }

    if (status === 'succeeded' || status === 'paid') {
      // Activate the subscription
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

      return NextResponse.json({ success: true, message: 'Suscripción activada' })
    }

    return NextResponse.json({ success: false, message: 'Pago no completado' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error procesando webhook'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
