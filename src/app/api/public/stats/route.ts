import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { apiSuccess, apiError, handleCorsPreflight } from '@/lib/api-response'
import { DEMO_STORE_SLUGS } from '@/lib/demo-stores'

export const dynamic = 'force-dynamic'

// GET /api/public/stats — métricas públicas mínimas (sin datos sensibles, sin auth).
// Alimenta la prueba social honesta de la landing: contador de tiendas activas
// creadas por usuarios reales, EXCLUYENDO las tiendas demo de la plataforma.
// Si la consulta falla devolvemos error para que la UI simplemente oculte el badge.
export async function GET(request: NextRequest) {
  try {
    const activeRealStores = await db.store.count({
      where: { isActive: true, slug: { notIn: [...DEMO_STORE_SLUGS] } },
    })
    return apiSuccess({ activeRealStores }, 200, request)
  } catch {
    return apiError('Error obteniendo estadísticas', 500, undefined, request)
  }
}

// OPTIONS /api/public/stats — CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
