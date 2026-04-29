import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// POST /api/billing/check - Check and expire past-due subscriptions
// Called by cron job daily. Requires admin auth.
export async function POST(request: Request) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const now = new Date()
    let expiredCount = 0
    let pastDueCount = 0

    // 1. Find active subscriptions past their nextBillingDate
    const activeSubscriptions = await db.subscription.findMany({
      where: { status: 'active', nextBillingDate: { lte: now } },
      include: { user: true, store: true, plan: true },
    })

    for (const sub of activeSubscriptions) {
      await db.subscription.update({ where: { id: sub.id }, data: { status: 'past_due' } })
      await db.payment.create({
        data: {
          amount: sub.plan.price, currency: 'PEN', status: 'pending',
          notes: `Facturación automática - ${sub.plan.name} - Vencida`,
          subscriptionId: sub.id, userId: sub.userId, storeId: sub.storeId, planId: sub.planId,
        },
      })
      pastDueCount++
    }

    // 2. Subscriptions past_due for 7+ days → expire and downgrade to Free
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const freePlan = await db.plan.findUnique({ where: { type: 'free' } })
    if (!freePlan) return NextResponse.json({ error: 'Plan Free no encontrado' }, { status: 500 })

    const pastDueSubscriptions = await db.subscription.findMany({
      where: { status: 'past_due', nextBillingDate: { lte: sevenDaysAgo } },
      include: { plan: { where: { type: { not: 'free' } } } },
    })

    for (const sub of pastDueSubscriptions) {
      await db.subscription.update({
        where: { id: sub.id }, data: { status: 'expired', endDate: now },
      })
      await db.subscription.create({
        data: {
          userId: sub.userId, storeId: sub.storeId, planId: freePlan.id,
          status: 'active', startDate: now, billingCycle: 'monthly', amountPaid: 0,
        },
      })
      await db.payment.create({
        data: {
          amount: sub.plan.price, currency: 'PEN', status: 'failed',
          notes: 'Suscripción expirada por falta de pago (7 días). Degradado a Free.',
          subscriptionId: sub.id, userId: sub.userId, storeId: sub.storeId, planId: sub.planId,
        },
      })
      expiredCount++
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
  if (auth.user.role !== 'super_admin') return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })

  try {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeCount = await db.subscription.count({ where: { status: 'active' } })
    const expiringSoon = await db.subscription.count({
      where: { status: 'active', nextBillingDate: { lte: threeDaysFromNow, gte: now }, plan: { type: { not: 'free' } } },
    })
    const pastDue = await db.subscription.findMany({
      where: { status: 'past_due' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
      orderBy: { nextBillingDate: 'asc' },
    })
    const expiredCount = await db.subscription.count({ where: { status: 'expired' } })
    const pendingPayments = await db.payment.count({ where: { status: 'pending' } })
    const completedPayments = await db.payment.findMany({ where: { status: 'completed', createdAt: { gte: startOfMonth } } })
    const monthlyRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const monthlyRevenueVerified = completedPayments.filter(p => p.verifiedAt).reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      activeCount, expiringSoon, pastDueCount: pastDue.length, pastDueSubscriptions: pastDue,
      expiredCount, pendingPayments, monthlyRevenue, monthlyRevenueVerified,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching billing status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
