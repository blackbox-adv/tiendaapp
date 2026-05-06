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

    // Use $queryRawUnsafe with template strings to completely bypass Prisma's query engine
    // This avoids the type conversion bug with string fields in PostgreSQL
    const q = (sql: string, values?: any[]) => db.$queryRawUnsafe(sql, ...(values || []))

    const [totalUsersRow] = await q('SELECT COUNT(*)::int as c FROM "User" WHERE role = \'store_owner\'')
    const [activeUsersRow] = await q('SELECT COUNT(*)::int as c FROM "User" WHERE role = \'store_owner\' AND "isActive" = true')
    const [totalStoresRow] = await q('SELECT COUNT(*)::int as c FROM "Store"')
    const [activeStoresRow] = await q('SELECT COUNT(*)::int as c FROM "Store" WHERE "isActive" = true')
    const [totalProductsRow] = await q('SELECT COUNT(*)::int as c FROM "StoreProduct" WHERE "isActive" = true')
    const [newUsersRow] = await q('SELECT COUNT(*)::int as c FROM "User" WHERE role = \'store_owner\' AND "createdAt" >= $1', [startOfMonth])
    const [newStoresRow] = await q('SELECT COUNT(*)::int as c FROM "Store" WHERE "createdAt" >= $1', [startOfMonth])

    // Subscriptions with plan info
    const subs = await q(
      `SELECT s.id, s.status::text, p.name as "planName", p.type as "planType", p.price::float as "planPrice", s."nextBillingDate"::text as "nextBillingDate"
       FROM "Subscription" s JOIN "Plan" p ON s."planId" = p.id`
    ) as Array<{id: string; status: string; planName: string; planType: string; planPrice: number; nextBillingDate: string | null}>

    const planDistribution: Record<string, number> = {}
    let mrr = 0
    for (const sub of subs) {
      planDistribution[sub.planName] = (planDistribution[sub.planName] || 0) + 1
      if (sub.planType !== 'free' && sub.status === 'active') mrr += sub.planPrice
    }

    // Payments
    const completedPays = await q(
      'SELECT amount::float, "verifiedAt"::text FROM "Payment" WHERE status = \'completed\' AND "createdAt" >= $1',
      [startOfMonth]
    ) as Array<{amount: number; verifiedAt: string | null}>
    const monthlyRevenue = completedPays.reduce((sum, p) => sum + p.amount, 0)
    const verifiedRevenue = completedPays.filter(p => p.verifiedAt).reduce((sum, p) => sum + p.amount, 0)
    const [pendingRow] = await q('SELECT COUNT(*)::int as c FROM "Payment" WHERE status = \'pending\'')

    const expiringSubscriptions = subs.filter(
      s => s.status === 'active' && s.nextBillingDate && new Date(s.nextBillingDate) <= threeDaysFromNow && s.planType !== 'free'
    ).length
    const pastDueCount = subs.filter(s => s.status === 'past_due').length

    // Top stores
    const topStoreRows = await q(
      `SELECT s.id, s.name, s.slug, s."visitCount"::int, COUNT(p.id)::int as pc
        FROM "Store" s LEFT JOIN "StoreProduct" p ON p."storeId" = s.id AND p."isActive" = true
        WHERE s."isActive" = true
        GROUP BY s.id, s.name, s.slug, s."visitCount"
        ORDER BY s."visitCount" DESC LIMIT 5`
    ) as Array<{id: string; name: string; slug: string; visitCount: number; pc: number}>
    const topStores = topStoreRows.map(r => ({
      id: r.id, name: r.name, slug: r.slug,
      visitCount: r.visitCount,
      _count: { products: r.pc },
    }))

    // Recent stores
    const recentRows = await q(
      `SELECT s.id, s.name, s.slug, s."createdAt"::text,
        u.name as "ownerName", u.email as "ownerEmail",
        COALESCE(sub_plan.pn, 'Free') as pn, COALESCE(sub_plan.pp, 0)::float as pp
        FROM "Store" s
        JOIN "User" u ON s."ownerId" = u.id
        LEFT JOIN LATERAL (
          SELECT p.name as pn, p.price as pp
          FROM "Subscription" sub JOIN "Plan" p ON sub."planId" = p.id
          WHERE sub."storeId" = s.id
          ORDER BY sub."createdAt" DESC LIMIT 1
        ) sub_plan ON true
        ORDER BY s."createdAt" DESC LIMIT 5`
    ) as Array<{id: string; name: string; slug: string; createdAt: string; ownerName: string; ownerEmail: string; pn: string; pp: number}>
    const recentStores = recentRows.map(r => ({
      id: r.id, name: r.name, slug: r.slug, createdAt: r.createdAt,
      owner: { name: r.ownerName, email: r.ownerEmail },
      subscriptions: [{ plan: { name: r.pn, price: r.pp } }],
    }))

    return NextResponse.json({
      totalUsers: (totalUsersRow as any)?.c ?? 0,
      activeUsers: (activeUsersRow as any)?.c ?? 0,
      totalStores: (totalStoresRow as any)?.c ?? 0,
      activeStores: (activeStoresRow as any)?.c ?? 0,
      totalProducts: (totalProductsRow as any)?.c ?? 0,
      newUsersThisMonth: (newUsersRow as any)?.c ?? 0,
      newStoresThisMonth: (newStoresRow as any)?.c ?? 0,
      planDistribution, mrr,
      monthlyRevenue, verifiedRevenue,
      pendingPayments: (pendingRow as any)?.c ?? 0,
      topStores, recentStores,
      expiringSubscriptions, pastDueCount,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching stats'
    console.error('[ADMIN STATS]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

