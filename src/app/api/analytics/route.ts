import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { serializeDecimals } from '@/lib/utils'

// GET /api/analytics - Store analytics for the dashboard
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request)
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request)
    }

    // Verify store ownership
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })
    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permisos para esta tienda', 403, undefined, request)
    }

    // Get store stats
    const [
      productCount,
      activeProductCount,
      featuredProductCount,
      outOfStockCount,
      orderStats,
      recentOrders,
    ] = await Promise.all([
      // Total products
      db.storeProduct.count({ where: { storeId } }),
      // Active products
      db.storeProduct.count({ where: { storeId, isActive: true } }),
      // Featured products
      db.storeProduct.count({ where: { storeId, featured: true } }),
      // Out of stock products (use raw SQL since Prisma client may not have stock field yet)
      db.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM "StoreProduct" WHERE "storeId" = $1 AND stock = 0`, storeId) as Promise<Array<{cnt: number}>>,
      // Order stats
      db.storeOrder.aggregate({
        where: { storeId },
        _count: true,
        _sum: { totalAmount: true },
      }),
      // Recent orders (last 7 days)
      db.storeOrder.findMany({
        where: {
          storeId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          customerName: true,
          totalAmount: true,
          createdAt: true,
          items: true,
        },
      }),
    ])

    // Get order counts by status
    const ordersByStatus = await db.storeOrder.groupBy({
      by: ['status'],
      where: { storeId },
      _count: true,
    })

    // Get store visit count
    const storeData = await db.store.findUnique({
      where: { id: storeId },
      select: { visitCount: true },
    })

    // Get category distribution
    const categoryDistribution = await db.storeProduct.groupBy({
      by: ['category'],
      where: { storeId, isActive: true },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
    })

    return apiSuccess(serializeDecimals({
      products: {
        total: productCount,
        active: activeProductCount,
        featured: featuredProductCount,
        outOfStock: (outOfStockCount as Array<{cnt: number}>)?.[0]?.cnt || 0,
        inactive: productCount - activeProductCount,
      },
      orders: {
        total: orderStats._count,
        totalRevenue: orderStats._sum.totalAmount || 0,
        byStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count
          return acc
        }, {} as Record<string, number>),
        recent: recentOrders,
      },
      visits: {
        total: storeData?.visitCount || 0,
      },
      categories: categoryDistribution.map((c) => ({
        name: c.category || 'Sin categoría',
        count: c._count,
      })),
    }), 200, request)
  } catch (error) {
    console.error('[ANALYTICS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo analíticas', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return apiError('Method not allowed', 405, undefined, request)
}
