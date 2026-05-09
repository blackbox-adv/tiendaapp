import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { sendSubscriptionEmail } from '@/lib/email'
import { decimalToNumber } from '@/lib/utils'

// POST /api/billing/check - Check and expire past-due subscriptions
// Called by cron job daily. Requires admin auth.
export async function POST(request: Request) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const now = new Date()
    let expiredCount = 0
    let pastDueCount = 0

    // FIXED: Use targeted queries instead of loading ALL subscriptions
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
      // FIXED: Wrap each subscription's operations in a transaction
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

        // Send past_due notification email
        if (sub.user) {
          sendSubscriptionEmail(sub.user.name, sub.user.email, sub.plan.name, Number(sub.plan.price), 'downgraded').catch(() => {})
        }
      } catch (txError) {
        console.error(`[BILLING] Transaction failed for subscription ${sub.id}:`, txError)
        // Continue processing other subscriptions
      }
    }

    // 2. Subscriptions past_due for 7+ days → expire and downgrade to Free
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const freePlan = await db.plan.findUnique({ where: { type: 'free' } })
    if (!freePlan) return NextResponse.json({ error: 'Plan Free no encontrado' }, { status: 500 })

    const pastDueSubscriptions = await db.subscription.findMany({
      where: {
        status: 'past_due',
        nextBillingDate: { lte: sevenDaysAgo },
        plan: { type: { not: 'free' } },
      },
      include: { user: true, store: true, plan: true },
    })

    for (const sub of pastDueSubscriptions) {
      // FIXED: Wrap all operations in a transaction
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

        // Send downgrade email
        if (sub.user) {
          sendSubscriptionEmail(sub.user.name, sub.user.email, 'Free', 0, 'downgraded').catch(() => {})
        }
      } catch (txError) {
        console.error(`[BILLING] Transaction failed for expired subscription ${sub.id}:`, txError)
        // Continue processing other subscriptions
      }
    }

    return NextResponse.json({
      success: true, checkedAt: now.toISOString(),
      pastDueCount, expiredCount,
      message: `Verificación: ${pastDueCount} vencidas, ${expiredCount} expiradas y degradadas a Free`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error checking subscriptions'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /api/billing/check - Get billing status summary (admin)
export async function GET(request: Request) {
  const auth = authenticateRequest(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (auth.user.role !== 'super_admin') return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })

  try {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // FIXED: Use targeted queries instead of loading all subscriptions
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

    return NextResponse.json({
      activeCount, expiringSoon, pastDueCount: pastDueList.length, pastDueSubscriptions: pastDueList,
      expiredCount, pendingPayments, monthlyRevenue, monthlyRevenueVerified,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching billing status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
