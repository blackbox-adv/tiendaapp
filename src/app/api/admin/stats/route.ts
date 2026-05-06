import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { Prisma } from '@prisma/client'

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

    // Use raw SQL for all queries involving string status fields to avoid Prisma type conversion issues
    type CountRow = { count: string }
    const cnt = (sql: Prisma.Sql) => db.$queryRaw<CountRow[]>(sql).then(r => Number(r[0]?.count ?? 0))

    const totalUsers = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "User" WHERE role = 'store_owner'`)
    const activeUsers = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "User" WHERE role = 'store_owner' AND "isActive" = true`)
    const totalStores = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "Store"`)
    const activeStores = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "Store" WHERE "isActive" = true`)
    const totalProducts = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "StoreProduct" WHERE "isActive" = true`)
    const newUsersThisMonth = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "User" WHERE role = 'store_owner' AND "createdAt" >= ${startOfMonth}`)
    const newStoresThisMonth = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "Store" WHERE "createdAt" >= ${startOfMonth}`)

    // Subscriptions with plan info
    type SubRow = { id: string; status: string; planName: string; planType: string; planPrice: string; nextBillingDate: string | null }
    const subs = await db.$queryRaw<SubRow[]>(
      Prisma.sql`SELECT s.id, s.status, p.name as "planName", p.type as "planType", p.price::text as "planPrice", s."nextBillingDate"::text as "nextBillingDate"
       FROM "Subscription" s JOIN "Plan" p ON s."planId" = p.id`
    )

    const planDistribution: Record<string, number> = {}
    let mrr = 0
    for (const sub of subs) {
      planDistribution[sub.planName] = (planDistribution[sub.planName] || 0) + 1
      if (sub.planType !== 'free' && sub.status === 'active') mrr += parseFloat(sub.planPrice)
    }

    // Payments
    type PayRow = { amount: string; verifiedAt: string | null }
    const completedPayments = await db.$queryRaw<PayRow[]>(
      Prisma.sql`SELECT amount::text, "verifiedAt"::text FROM "Payment" WHERE status = 'completed' AND "createdAt" >= ${startOfMonth}`
    )
    const monthlyRevenue = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const verifiedRevenue = completedPayments.filter(p => p.verifiedAt).reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const pendingPayments = await cnt(Prisma.sql`SELECT COUNT(*)::text as count FROM "Payment" WHERE status = 'pending'`)

    const expiringSubscriptions = subs.filter(
      s => s.status === 'active' && s.nextBillingDate && new Date(s.nextBillingDate) <= threeDaysFromNow && s.planType !== 'free'
    ).length
    const pastDueCount = subs.filter(s => s.status === 'past_due').length

    // Top stores and recent stores use ORM (boolean fields are fine)
    const topStores = await db.store.findMany({
      where: { isActive: true }, orderBy: { visitCount: 'desc' }, take: 5,
      select: { id: true, name: true, slug: true, visitCount: true, _count: { select: { products: true } } },
    })

    const recentStores = await db.store.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        subscriptions: { include: { plan: { select: { name: true, price: true } } }, take: 1 },
      },
      orderBy: { createdAt: 'desc' }, take: 5,
    })

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
    console.error('[ADMIN STATS]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
