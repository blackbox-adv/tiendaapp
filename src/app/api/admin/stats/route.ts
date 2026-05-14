import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

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

    // Use $queryRawUnsafe to completely bypass Prisma's query engine and avoid type conversion issues
    // with string status fields in PostgreSQL
    const sql = db.$queryRawUnsafe.bind(db)

    type CountR = { c: number }
    const [totalUsersRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "User" WHERE role = $1', ['store_owner'])
    const [activeUsersRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "User" WHERE role = $1 AND "isActive" = true', ['store_owner'])
    const [totalStoresRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "Store"')
    const [activeStoresRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "Store" WHERE "isActive" = true')
    const [totalProductsRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "StoreProduct" WHERE "isActive" = true')
    const [newUsersRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "User" WHERE role = $1 AND "createdAt" >= $2', ['store_owner', startOfMonth])
    const [newStoresRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "Store" WHERE "createdAt" >= $1', [startOfMonth])

    // Subscriptions with plan info - cast all to text to avoid Prisma conversion
    type SubR = { id: string; status: string; planName: string; planType: string; planPrice: string; nextBillingDate: string | null }
    const subs: SubR[] = await sql(
      `SELECT s.id, s.status::text, p.name as "planName", p.type as "planType", p.price::text as "planPrice", s."nextBillingDate"::text as "nextBillingDate"
       FROM "Subscription" s JOIN "Plan" p ON s."planId" = p.id`
    )

    const planDistribution: Record<string, number> = {}
    let mrr = 0
    for (const sub of subs) {
      planDistribution[sub.planName] = (planDistribution[sub.planName] || 0) + 1
      if (sub.planType !== 'free' && sub.status === 'active') mrr += parseFloat(sub.planPrice)
    }

    // Payments
    type PayR = { amount: string; verifiedAt: string | null }
    const completedPays: PayR[] = await sql(
      'SELECT amount::text, "verifiedAt"::text FROM "Payment" WHERE status = $1 AND "createdAt" >= $2',
      ['completed', startOfMonth]
    )
    const monthlyRevenue = completedPays.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const verifiedRevenue = completedPays.filter(p => p.verifiedAt).reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const [pendingRow]: CountR[] = await sql('SELECT COUNT(*)::int as c FROM "Payment" WHERE status = $1', ['pending'])

    const expiringSubscriptions = subs.filter(
      s => s.status === 'active' && s.nextBillingDate && new Date(s.nextBillingDate) <= threeDaysFromNow && s.planType !== 'free'
    ).length
    const pastDueCount = subs.filter(s => s.status === 'past_due').length

    // Top stores
    type TopR = { id: string; name: string; slug: string; visitCount: number; pc: number }
    const topStoreRows: TopR[] = await sql(
      `SELECT s.id, s.name, s.slug, s."visitCount"::int, COUNT(p.id)::int as pc
        FROM "Store" s LEFT JOIN "StoreProduct" p ON p."storeId" = s.id AND p."isActive" = true
        WHERE s."isActive" = true
        GROUP BY s.id, s.name, s.slug, s."visitCount"
        ORDER BY s."visitCount" DESC LIMIT 5`
    )
    const topStores = topStoreRows.map(r => ({
      id: r.id, name: r.name, slug: r.slug,
      visitCount: r.visitCount,
      _count: { products: r.pc },
    }))

    // Recent stores
    type RecentR = { id: string; name: string; slug: string; createdAt: string; ownerName: string; ownerEmail: string; pn: string; pp: string }
    const recentRows: RecentR[] = await sql(
      `SELECT s.id, s.name, s.slug, s."createdAt"::text,
        u.name as "ownerName", u.email as "ownerEmail",
        COALESCE(sub_plan.pn, 'Free') as pn, COALESCE(sub_plan.pp, '0') as pp
        FROM "Store" s
        JOIN "User" u ON s."ownerId" = u.id
        LEFT JOIN LATERAL (
          SELECT p.name as pn, p.price::text as pp
          FROM "Subscription" sub JOIN "Plan" p ON sub."planId" = p.id
          WHERE sub."storeId" = s.id
          ORDER BY sub."createdAt" DESC LIMIT 1
        ) sub_plan ON true
        ORDER BY s."createdAt" DESC LIMIT 5`
    )
    const recentStores = recentRows.map(r => ({
      id: r.id, name: r.name, slug: r.slug, createdAt: r.createdAt,
      owner: { name: r.ownerName, email: r.ownerEmail },
      subscriptions: [{ plan: { name: r.pn, price: parseFloat(r.pp) } }],
    }))

    return NextResponse.json({
      totalUsers: totalUsersRow?.c ?? 0,
      activeUsers: activeUsersRow?.c ?? 0,
      totalStores: totalStoresRow?.c ?? 0,
      activeStores: activeStoresRow?.c ?? 0,
      totalProducts: totalProductsRow?.c ?? 0,
      newUsersThisMonth: newUsersRow?.c ?? 0,
      newStoresThisMonth: newStoresRow?.c ?? 0,
      planDistribution, mrr,
      monthlyRevenue, verifiedRevenue,
      pendingPayments: pendingRow?.c ?? 0,
      topStores, recentStores,
      expiringSubscriptions, pastDueCount,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching stats'
    console.error('[ADMIN STATS]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
