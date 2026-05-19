import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { serializeDecimals } from '@/lib/utils'

// GET /api/admin/stats - Complete platform statistics
export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (auth.user.role !== 'super_admin') return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Use Prisma ORM methods to avoid PgBouncer prepared statement issues
    const [
      totalUsers,
      activeUsers,
      totalStores,
      activeStores,
      totalProducts,
      newUsersThisMonth,
      newStoresThisMonth,
      allSubsWithPlan,
      completedPaymentsMonth,
      pendingPaymentsCount,
      topStoreRows,
      recentStoreRows,
    ] = await Promise.all([
      // User counts
      db.user.count({ where: { role: 'store_owner' } }),
      db.user.count({ where: { role: 'store_owner', isActive: true } }),
      // Store counts
      db.store.count(),
      db.store.count({ where: { isActive: true } }),
      // Product count
      db.storeProduct.count({ where: { isActive: true } }),
      // New this month
      db.user.count({ where: { role: 'store_owner', createdAt: { gte: startOfMonth } } }),
      db.store.count({ where: { createdAt: { gte: startOfMonth } } }),
      // All subscriptions with plan info
      db.subscription.findMany({
        include: { plan: { select: { id: true, name: true, type: true, price: true } } },
      }),
      // Completed payments this month
      db.payment.findMany({
        where: { status: 'completed', createdAt: { gte: startOfMonth } },
        select: { amount: true, verifiedAt: true },
      }),
      // Pending payments count
      db.payment.count({ where: { status: 'pending' } }),
      // Top stores by visit count
      db.store.findMany({
        where: { isActive: true },
        select: {
          id: true, name: true, slug: true, visitCount: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: { visitCount: 'desc' },
        take: 5,
      }),
      // Recent stores
      db.store.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, name: true, slug: true, createdAt: true,
          owner: { select: { name: true, email: true } },
          subscriptions: {
            include: { plan: { select: { name: true, price: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ])

    // Calculate plan distribution and MRR
    const planDistribution: Record<string, number> = {}
    let mrr = 0
    for (const sub of allSubsWithPlan) {
      planDistribution[sub.plan.name] = (planDistribution[sub.plan.name] || 0) + 1
      if (sub.plan.type !== 'free' && sub.status === 'active') {
        mrr += Number(sub.plan.price)
      }
    }

    // Revenue calculations
    const monthlyRevenue = completedPaymentsMonth.reduce((sum, p) => sum + Number(p.amount), 0)
    const verifiedRevenue = completedPaymentsMonth.filter(p => p.verifiedAt).reduce((sum, p) => sum + Number(p.amount), 0)

    // Expiring and past due counts
    const expiringSubscriptions = allSubsWithPlan.filter(
      s => s.status === 'active' && s.nextBillingDate && new Date(s.nextBillingDate) <= threeDaysFromNow && s.plan.type !== 'free'
    ).length
    const pastDueCount = allSubsWithPlan.filter(s => s.status === 'past_due').length

    // Format top stores
    const topStores = topStoreRows.map(s => ({
      id: s.id, name: s.name, slug: s.slug,
      visitCount: s.visitCount,
      _count: { products: s._count.products },
    }))

    // Format recent stores
    const recentStores = recentStoreRows.map(s => ({
      id: s.id, name: s.name, slug: s.slug, createdAt: s.createdAt,
      owner: { name: s.owner.name, email: s.owner.email },
      subscriptions: s.subscriptions.map(sub => ({
        plan: { name: sub.plan.name, price: Number(sub.plan.price) },
      })),
    }))

    return NextResponse.json(serializeDecimals({
      totalUsers,
      activeUsers,
      totalStores,
      activeStores,
      totalProducts,
      newUsersThisMonth,
      newStoresThisMonth,
      planDistribution,
      mrr,
      monthlyRevenue,
      verifiedRevenue,
      pendingPayments: pendingPaymentsCount,
      topStores,
      recentStores,
      expiringSubscriptions,
      pastDueCount,
    }))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching stats'
    console.error('[ADMIN STATS]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
