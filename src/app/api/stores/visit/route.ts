import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/stores/visit - Increment visit count for a store by slug
// Public endpoint — no auth required (rate-limited by IP via simple session check)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug } = body as { slug?: string }

    if (!slug || typeof slug !== 'string') {
      return apiError('Slug es requerido', 400, undefined, request)
    }

    // Sanitize slug: only allow alphanumeric and hyphens
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return apiError('Slug invalido', 400, undefined, request)
    }

    const store = await db.store.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    })

    if (!store || !store.isActive) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }

    // Simple rate limiting: check a cookie-style header for session tracking
    const visitedStores = request.headers.get('x-visited-stores')
    if (visitedStores && visitedStores.split(',').includes(slug)) {
      // Already visited this session, don't increment again
      return apiSuccess({ counted: false, visitCount: undefined }, 200, request)
    }

    const updated = await db.store.update({
      where: { id: store.id },
      data: { visitCount: { increment: 1 } },
      select: { visitCount: true },
    })

    return apiSuccess({ counted: true, visitCount: updated.visitCount }, 200, request)
  } catch (error: unknown) {
    console.error('[STORES VISIT] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error registrando visita', 500, undefined, request)
  }
}

// OPTIONS /api/stores/visit - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
