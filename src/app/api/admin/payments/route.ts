import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { validateBody, adminPaymentActionSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { sendSubscriptionEmail, sendPaymentRejectedEmail } from '@/lib/email'
import { serializeDecimals, decimalToNumber } from '@/lib/utils'

// ── GET /api/admin/payments ──
// List all payments with optional status filter, paginated, ordered by newest first.
export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user || auth.user.role !== 'super_admin') return apiError('Solo administradores', 403, undefined, request)

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          plan: { select: { id: true, name: true, price: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.payment.count({ where }),
    ])

    return apiSuccess(serializeDecimals({ payments, total, page, limit }), 200, request)
  } catch (error: unknown) {
    console.error('[ADMIN/PAYMENTS] GET error:', error instanceof Error ? error.message : 'Error al obtener pagos')
    return apiError('Error al obtener pagos', 500, undefined, request)
  }
}

// ── PUT /api/admin/payments ──
// Verify / approve / reject a manual payment (Yape, transfer, etc.)
export async function PUT(request: Request) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user || auth.user.role !== 'super_admin') return apiError('Solo administradores', 403, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(adminPaymentActionSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { paymentId, action, notes } = validation.data

    // Fetch the payment with its plan info
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { plan: { select: { id: true, name: true, type: true, price: true } } },
    })

    if (!payment) {
      return apiError('Pago no encontrado', 404, undefined, request)
    }

    if (payment.status !== 'pending') {
      return apiError(`Este pago ya fue procesado (estado: ${payment.status})`, 409, undefined, request)
    }

    if (action === 'reject') {
      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'rejected',
          notes: notes || 'Pago rechazado por el administrador',
          verifiedAt: new Date(),
          verifiedBy: auth.user.userId,
        },
      })

      // Send rejection email
      const user = await db.user.findUnique({
        where: { id: payment.userId },
        select: { name: true, email: true },
      })
      if (user) {
        sendPaymentRejectedEmail(user.name, user.email, payment.plan.name, notes).catch(() => {})
      }

      return apiSuccess({ success: true, message: 'Pago rechazado correctamente' }, 200, request)
    }

    // ── Approve action ──
    // FIXED: Wrap in transaction to ensure atomicity
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: payment.userId,
        storeId: payment.storeId,
        status: 'active',
      },
    })

    // Calculate nextBillingDate: 30 days from now for paid plans
    const nextBillingDate = payment.plan.type !== 'free'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null

    try {
      await db.$transaction(async (tx) => {
        // 1. Update the payment
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: 'completed',
            verifiedAt: new Date(),
            verifiedBy: auth.user.userId,
            notes: notes || null,
          },
        })

        // 2. Create or update the user's subscription to 'active' with the plan
        if (existingSubscription) {
          await tx.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              planId: payment.planId,
              startDate: new Date(),
              amountPaid: decimalToNumber(payment.amount),
              status: 'active',
              nextBillingDate,
            },
          })
        } else {
          await tx.subscription.create({
            data: {
              userId: payment.userId,
              storeId: payment.storeId,
              planId: payment.planId,
              status: 'active',
              startDate: new Date(),
              amountPaid: decimalToNumber(payment.amount),
              nextBillingDate,
            },
          })
        }
      })
    } catch (txError) {
      console.error('[ADMIN/PAYMENTS] Transaction failed:', txError)
      return apiError('Error al procesar el pago. Intenta de nuevo.', 500, undefined, request)
    }

    // 3. Send subscription activation email (non-blocking)
    const user = await db.user.findUnique({
      where: { id: payment.userId },
      select: { name: true, email: true },
    })
    if (user) {
      sendSubscriptionEmail(user.name, user.email, payment.plan.name, Number(payment.plan.price), 'activated').catch(() => {})
    }

    return apiSuccess(
      serializeDecimals({
        success: true,
        message: `Pago aprobado — suscripción al plan "${payment.plan.name}" activada`,
        paymentId: payment.id,
      }),
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[ADMIN/PAYMENTS] PUT error:', error instanceof Error ? error.message : 'Error al verificar pago')
    return apiError('Error al verificar pago', 500, undefined, request)
  }
}

// ── OPTIONS ──
export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}
