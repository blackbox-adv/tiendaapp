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

    // Use raw SQL without parameters for PgBouncer compatibility
    const sql = db.$queryRawUnsafe.bind(db)
    const fmtDate = (d: Date) => `'${d.toISOString()}'`

    type CountR = { c: number }

    const [activeCountRow, expiringSoonRow, expiredCountRow, pendingPaymentsRow, completedPaymentsRows, pastDueRows] = await Promise.all([
      sql(`SELECT COUNT(*)::int as c FROM "Subscription" WHERE status = 'active'`) as Promise<CountR[]>,
      sql(`SELECT COUNT(*)::int as c FROM "Subscription" sub JOIN "Plan" p ON sub."planId" = p.id WHERE sub.status = 'active' AND sub."nextBillingDate" >= ${fmtDate(now)} AND sub."nextBillingDate" <= ${fmtDate(threeDaysFromNow)} AND p.type != 'free'`) as Promise<CountR[]>,
      sql(`SELECT COUNT(*)::int as c FROM "Subscription" WHERE status = 'expired'`) as Promise<CountR[]>,
      sql(`SELECT COUNT(*)::int as c FROM "Payment" WHERE status = 'pending'`) as Promise<CountR[]>,
      sql(`SELECT amount::text, "verifiedAt"::text FROM "Payment" WHERE status = 'completed' AND "createdAt" >= ${fmtDate(startOfMonth)}`) as Promise<Array<{ amount: string; verifiedAt: string | null }>>,
      sql(`SELECT sub.id, sub.status::text, sub."nextBillingDate"::text, u.id as "userId", u.name as "userName", u.email as "userEmail", s.id as "storeId", s.name as "storeName", s.slug as "storeSlug", p.id as "planId", p.name as "planName", p.price::text as "planPrice" FROM "Subscription" sub JOIN "User" u ON sub."userId" = u.id JOIN "Store" s ON sub."storeId" = s.id JOIN "Plan" p ON sub."planId" = p.id WHERE sub.status = 'past_due' ORDER BY sub."nextBillingDate" ASC`) as Promise<Array<{ id: string; status: string; nextBillingDate: string | null; userId: string; userName: string; userEmail: string; storeId: string; storeName: string; storeSlug: string; planId: string; planName: string; planPrice: string }>>,
    ])

    const activeCount = Number(activeCountRow[0]?.c ?? 0)
    const expiringSoon = Number(expiringSoonRow[0]?.c ?? 0)
    const expiredCount = Number(expiredCountRow[0]?.c ?? 0)
    const pendingPayments = Number(pendingPaymentsRow[0]?.c ?? 0)

    const monthlyRevenue = completedPaymentsRows.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const monthlyRevenueVerified = completedPaymentsRows.filter(p => p.verifiedAt).reduce((sum, p) => sum + parseFloat(p.amount), 0)

    const pastDueList = pastDueRows.map(r => ({
      id: r.id,
      status: r.status,
      nextBillingDate: r.nextBillingDate,
      user: { id: r.userId, name: r.userName, email: r.userEmail },
      store: { id: r.storeId, name: r.storeName, slug: r.storeSlug },
      plan: { id: r.planId, name: r.planName, price: parseFloat(r.planPrice) },
    }))

    return apiSuccess(serializeDecimals({
      activeCount, expiringSoon, pastDueCount: pastDueList.length, pastDueSubscriptions: pastDueList,
      expiredCount, pendingPayments, monthlyRevenue, monthlyRevenueVerified,
    }), 200, request)
  } catch (error: unknown) {
    console.error('[BILLING CHECK] GET error:', error instanceof Error ? error.message : String(error))
    console.error('[BILLING CHECK] stack:', error instanceof Error ? error.stack : 'no stack')
    return apiError('Error fetching billing status', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
