// ============================================================
// GET /api/landings?storeId=... — Lista las landings de MI tienda
// (auth + ownership). Lectura simple para el panel del vendedor.
// ============================================================
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { serializeDecimals } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId') || ''

    if (!/^[a-zA-Z0-9_-]+$/.test(storeId)) {
      return apiError('storeId invalido', 400, undefined, request)
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, ownerId: true },
    })
    if (!store) return apiError('Tienda no encontrada', 404, undefined, request)
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permiso sobre esta tienda', 403, undefined, request)
    }

    const landings = await db.landingPage.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, headline: true, published: true,
        views: true, price: true, offerPrice: true, photos: true, createdAt: true,
      },
    })

    return apiSuccess(serializeDecimals(landings), 200, request)
  } catch (error: unknown) {
    console.error('[LANDINGS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error listando landings', 500, undefined, request)
  }
}
