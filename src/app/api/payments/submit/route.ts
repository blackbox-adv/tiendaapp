import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { validateBody, paymentSubmitSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { sendPaymentSubmittedEmail } from '@/lib/email'
import { serializeDecimals, decimalToNumber } from '@/lib/utils'

// POST /api/payments/submit — Submit manual payment (Yape/Transfer voucher)
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(paymentSubmitSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { planId, storeId, externalRef, paymentMethod } = validation.data

    // Get the plan
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return apiError('Plan no encontrado', 404, undefined, request)
    }

    // Determine store
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
    if (!targetStoreId) {
      return apiError('Necesitas tener una tienda para pagar un plan', 400, undefined, request)
    }

    // Verify store ownership (unless admin)
    if (auth.user.role !== 'super_admin') {
      const store = await db.store.findUnique({ where: { id: targetStoreId }, select: { ownerId: true } })
      if (!store) return apiError('Tienda no encontrada', 404, undefined, request)
      if (store.ownerId !== auth.user.userId) return apiError('Acceso denegado', 403, undefined, request)
    }

    // Check if there's already a pending payment for this user+plan+store
    const existingPending = await db.payment.findFirst({
      where: {
        userId: auth.user.userId,
        planId,
        storeId: targetStoreId,
        status: 'pending',
      },
    })

    if (existingPending) {
      // Update the existing pending payment with the new voucher number
      await db.payment.update({
        where: { id: existingPending.id },
        data: {
          externalRef: externalRef,
          paymentMethod: paymentMethod || 'yape',
          createdAt: new Date(), // Refresh timestamp
        },
      })

      return apiSuccess(serializeDecimals({
        success: true,
        message: 'Pago registrado! Verificaremos tu comprobante pronto.',
        paymentId: existingPending.id,
      }), 200, request)
    }

    // Create a placeholder subscription (inactive) if none exists
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: auth.user.userId,
        storeId: targetStoreId,
        status: 'active',
      },
    })

    let subscriptionId = existingSubscription?.id

    if (!subscriptionId) {
      // Check for a pending one
      const pendingSub = await db.subscription.findFirst({
        where: {
          userId: auth.user.userId,
          storeId: targetStoreId,
          status: 'past_due',
        },
      })
      subscriptionId = pendingSub?.id
    }

    if (!subscriptionId) {
      // Create a new subscription in past_due state (will be activated on admin approval)
      const newSub = await db.subscription.create({
        data: {
          userId: auth.user.userId,
          storeId: targetStoreId,
          planId,
          status: 'past_due',
          startDate: new Date(),
          amountPaid: decimalToNumber(plan.price),
        },
      })
      subscriptionId = newSub.id
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        amount: decimalToNumber(plan.price),
        status: 'pending',
        paymentMethod: paymentMethod || 'yape',
        externalRef: externalRef,
        userId: auth.user.userId,
        storeId: targetStoreId,
        planId,
        subscriptionId,
      },
    })

    // Send payment submitted confirmation email (non-blocking)
    const user = await db.user.findUnique({ where: { id: auth.user.userId }, select: { name: true, email: true } })
    if (user) {
      sendPaymentSubmittedEmail(user.name, user.email, plan.name, Number(plan.price), externalRef).catch(() => {})
    }

    return apiSuccess(serializeDecimals({
      success: true,
      message: 'Pago registrado! Verificaremos tu comprobante pronto.',
      paymentId: payment.id,
    }), 201, request)
  } catch (error: unknown) {
    console.error('[PAYMENTS/SUBMIT] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error al registrar el pago', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
