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
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const now = new Date()
    let expiredCount = 0
    let pastDueCount = 0

    // 1. Find active subscriptions past their nextBillingDate
    const allSubs = await db.subscription.findMany({
      include: { user: true, store: true, plan: true },
    })
    const activeSubscriptions = allSubs.filter(s => s.status === 'active' && s.nextBillingDate && s.nextBillingDate <= now)

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

    const pastDueSubscriptions = allSubs.filter(
      s => s.status === 'past_due' && s.nextBillingDate && s.nextBillingDate <= sevenDaysAgo && s.plan.type !== 'free'
    )

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
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (auth.user.role !== 'super_admin') return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })

  try {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const allSubs = await db.subscription.findMany({ include: { plan: true } })
    const activeCount = allSubs.filter(s => s.status === 'active').length
    const expiringSoon = allSubs.filter(
      s => s.status === 'active' && s.nextBillingDate && s.nextBillingDate <= threeDaysFromNow && s.nextBillingDate >= now && s.plan.type !== 'free'
    ).length
    const pastDue = allSubs.filter(s => s.status === 'past_due').map(s => s.id)
    const pastDueSubscriptions = await db.subscription.findMany({
      where: { id: { in: pastDue } },
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
