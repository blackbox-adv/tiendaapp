import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// ── GET /api/admin/payments ──
// List all payments with optional status filter, paginated, ordered by newest first.
export async function GET(request: Request) {
  const auth = authenticateRequest(request)
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

    return apiSuccess({ payments, total, page, limit }, 200, request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener pagos'
    return apiError(message, 500, undefined, request)
  }
}

// ── PUT /api/admin/payments ──
// Verify / approve / reject a manual payment (Yape, transfer, etc.)
export async function PUT(request: Request) {
  const auth = authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user || auth.user.role !== 'super_admin') return apiError('Solo administradores', 403, undefined, request)

  try {
    const body = await request.json()
    const { paymentId, action, notes } = body as {
      paymentId: string
      action: 'approve' | 'reject'
      notes?: string
    }

    if (!paymentId || !action) {
      return apiError('paymentId y action son requeridos', 400, undefined, request)
    }

    if (action !== 'approve' && action !== 'reject') {
      return apiError('action debe ser "approve" o "reject"', 400, undefined, request)
    }

    // Fetch the payment with its plan info
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { plan: { select: { id: true, name: true, type: true } } },
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
        },
      })

      return apiSuccess({ success: true, message: 'Pago rechazado correctamente' }, 200, request)
    }

    // ── Approve action ──
    // 1. Update the payment
    await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        verifiedAt: new Date(),
        verifiedBy: auth.user.userId,
        notes: notes || null,
      },
    })

    // 2. Create or update the user's subscription to 'active' with the plan
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: payment.userId,
        storeId: payment.storeId,
        status: 'active',
      },
    })

    if (existingSubscription) {
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: payment.planId,
          startDate: new Date(),
          amountPaid: payment.amount,
          status: 'active',
        },
      })
    } else {
      await db.subscription.create({
        data: {
          userId: payment.userId,
          storeId: payment.storeId,
          planId: payment.planId,
          status: 'active',
          startDate: new Date(),
          amountPaid: payment.amount,
        },
      })
    }

    return apiSuccess(
      {
        success: true,
        message: `Pago aprobado — suscripción al plan "${payment.plan.name}" activada`,
        paymentId: payment.id,
      },
      200,
      request
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al verificar pago'
    return apiError(message, 500, undefined, request)
  }
}

// ── OPTIONS ──
export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}
