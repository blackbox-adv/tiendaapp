import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// GET /api/admin/stats - Complete platform statistics
export async function GET(request: Request) {
  const auth = authenticateRequest(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (auth.user.role !== 'super_admin') return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    const totalUsers = await db.user.count({ where: { role: 'store_owner' } })
    const activeUsers = await db.user.count({ where: { role: 'store_owner', isActive: true } })
    const totalStores = await db.store.count()
    const activeStores = await db.store.count({ where: { isActive: true } })
    const totalProducts = await db.storeProduct.count({ where: { isActive: true } })
    const newUsersThisMonth = await db.user.count({ where: { role: 'store_owner', createdAt: { gte: startOfMonth } } })
    const newStoresThisMonth = await db.store.count({ where: { createdAt: { gte: startOfMonth } } })

    const subscriptions = await db.subscription.findMany({ where: { status: 'active' }, include: { plan: true } })
    const planDistribution: Record<string, number> = {}
    let mrr = 0
    for (const sub of subscriptions) {
      planDistribution[sub.plan.name] = (planDistribution[sub.plan.name] || 0) + 1
      if (sub.plan.type !== 'free') mrr += sub.plan.price
    }

    const completedPayments = await db.payment.findMany({ where: { status: 'completed', createdAt: { gte: startOfMonth } } })
    const monthlyRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const verifiedRevenue = completedPayments.filter(p => p.verifiedAt).reduce((sum, p) => sum + p.amount, 0)
    const pendingPayments = await db.payment.count({ where: { status: 'pending' } })

    const topStores = await db.store.findMany({
      where: { isActive: true }, orderBy: { visitCount: 'desc' }, take: 5,
      select: { id: true, name: true, slug: true, visitCount: true, _count: { select: { products: true } } },
    })

    const recentStores = await db.store.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        subscriptions: { where: { status: 'active' }, include: { plan: { select: { name: true, price: true } } }, take: 1 },
      },
      orderBy: { createdAt: 'desc' }, take: 5,
    })

    const expiringSubscriptions = await db.subscription.count({
      where: { status: 'active', nextBillingDate: { lte: threeDaysFromNow }, plan: { type: { not: 'free' } } },
    })
    const pastDueCount = await db.subscription.count({ where: { status: 'past_due' } })

    return NextResponse.json({
      totalUsers, activeUsers, totalStores, activeStores, totalProducts,
      newUsersThisMonth, newStoresThisMonth,
      planDistribution, mrr,
      monthlyRevenue, verifiedRevenue, pendingPayments,
      topStores, recentStores,
      expiringSubscriptions, pastDueCount,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
