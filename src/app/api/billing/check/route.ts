import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { sendSubscriptionEmail } from '@/lib/email'
import { decimalToNumber, serializeDecimals } from '@/lib/utils'
import { NextRequest } from 'next/server'

// POST /api/billing/check - Check and expire past-due subscriptions
// Called by cron job daily. Requires admin auth.
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)
  if (auth.user.role !== 'super_admin') {
    return apiError('Solo administradores', 403, undefined, request)
  }

  try {
    const now = new Date()
    let expiredCount = 0
    let pastDueCount = 0

    // Use targeted queries instead of loading ALL subscriptions
    // 1. Find active subscriptions past their nextBillingDate
    const activeSubscriptions = await db.subscription.findMany({
      where: {
        status: 'active',
        nextBillingDate: { lte: now },
        plan: { type: { not: 'free' } },
      },
      include: { user: true, store: true, plan: true },
    })

    for (const sub of activeSubscriptions) {
      try {
        await db.$transaction([
          db.subscription.update({
            where: { id: sub.id },
            data: { status: 'past_due' },
          }),
          db.payment.create({
            data: {
              amount: decimalToNumber(sub.plan.price),
              currency: 'PEN',
              status: 'pending',
              notes: `Facturación automática - ${sub.plan.name} - Vencida`,
              subscriptionId: sub.id,
              userId: sub.userId,
              storeId: sub.storeId,
              planId: sub.planId,
            },
          }),
        ])
        pastDueCount++

        if (sub.user) {
          sendSubscriptionEmail(sub.user.name, sub.user.email, sub.plan.name, Number(sub.plan.price), 'downgraded').catch(() => {})
        }
      } catch (txError) {
        console.error(`[BILLING] Transaction failed for subscription ${sub.id}:`, txError)
      }
    }

    // 2. Subscriptions past_due for 7+ days → expire and downgrade to Free
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const freePlan = await db.plan.findUnique({ where: { type: 'free' } })
    if (!freePlan) return apiError('Plan Free no encontrado', 500, undefined, request)

    const pastDueSubscriptions = await db.subscription.findMany({
      where: {
        status: 'past_due',
        nextBillingDate: { lte: sevenDaysAgo },
        plan: { type: { not: 'free' } },
      },
      include: { user: true, store: true, plan: true },
    })

    for (const sub of pastDueSubscriptions) {
      try {
        await db.$transaction([
          db.subscription.update({
            where: { id: sub.id },
            data: { status: 'expired', endDate: now },
          }),
          db.subscription.create({
            data: {
              userId: sub.userId,
              storeId: sub.storeId,
              planId: freePlan.id,
              status: 'active',
              startDate: now,
              billingCycle: 'monthly',
              amountPaid: 0,
            },
          }),
          db.payment.create({
            data: {
              amount: decimalToNumber(sub.plan.price),
              currency: 'PEN',
              status: 'failed',
              notes: 'Suscripción expirada por falta de pago (7 días). Degradado a Free.',
              subscriptionId: sub.id,
              userId: sub.userId,
              storeId: sub.storeId,
              planId: sub.planId,
            },
          }),
        ])
        expiredCount++

        if (sub.user) {
          sendSubscriptionEmail(sub.user.name, sub.user.email, 'Free', 0, 'downgraded').catch(() => {})
        }
      } catch (txError) {
        console.error(`[BILLING] Transaction failed for expired subscription ${sub.id}:`, txError)
      }
    }

    return apiSuccess({
      success: true, checkedAt: now.toISOString(),
      pastDueCount, expiredCount,
      message: `Verificación: ${pastDueCount} vencidas, ${expiredCount} expiradas y degradadas a Free`,
    }, 200, request)
  } catch {
    return apiError('Error checking subscriptions', 500, undefined, request)
  }
}

// GET /api/billing/check - Get billing status summary (admin)
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)
  if (auth.user.role !== 'super_admin') return apiError('Solo administradores', 403, undefined, request)

  try {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [activeCount, expiringSoon, pastDueList, expiredCount, pendingPayments, completedPayments] = await Promise.all([
      db.subscription.count({ where: { status: 'active' } }),
      db.subscription.count({
        where: {
          status: 'active',
          nextBillingDate: { lte: threeDaysFromNow, gte: now },
          plan: { type: { not: 'free' } },
        },
      }),
      db.subscription.findMany({
        where: { status: 'past_due' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true, slug: true } },
          plan: { select: { id: true, name: true, price: true } },
        },
        orderBy: { nextBillingDate: 'asc' },
      }),
      db.subscription.count({ where: { status: 'expired' } }),
      db.payment.count({ where: { status: 'pending' } }),
      db.payment.findMany({ where: { status: 'completed', createdAt: { gte: startOfMonth } } }),
    ])

    const monthlyRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const monthlyRevenueVerified = completedPayments.filter(p => p.verifiedAt).reduce((sum, p) => sum + Number(p.amount), 0)

    return apiSuccess(serializeDecimals({
      activeCount, expiringSoon, pastDueCount: pastDueList.length, pastDueSubscriptions: pastDueList,
      expiredCount, pendingPayments, monthlyRevenue, monthlyRevenueVerified,
    }), 200, request)
  } catch {
    return apiError('Error fetching billing status', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
