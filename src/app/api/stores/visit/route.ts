import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// Simple in-memory rate limiter per IP+slug to prevent visit count inflation
const visitLimiter = new Map<string, { count: number; resetAt: number }>()

function isVisitRateLimited(ip: string, slug: string): boolean {
  const key = `visit:${ip}:${slug}`
  const now = Date.now()
  const entry = visitLimiter.get(key)
  // Allow max 1 visit per IP+slug per 5 minutes
  if (!entry || now > entry.resetAt) {
    visitLimiter.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 })
    return false
  }
  entry.count++
  return entry.count > 3 // Max 3 increments per 5 min window (allows retry)
}

// Cleanup stale entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of visitLimiter) {
      if (now > entry.resetAt) visitLimiter.delete(key)
    }
  }, 5 * 60 * 1000)
}

// POST /api/stores/visit - Increment visit count for a store by slug
// Public endpoint — no auth required (rate-limited by IP)
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

    // IP-based rate limiting (server-side, not client-controlled)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    if (isVisitRateLimited(ip, slug)) {
      return apiSuccess({ counted: false, visitCount: undefined }, 200, request)
    }

    const store = await db.store.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    })

    if (!store || !store.isActive) {
      return apiError('Tienda no encontrada', 404, undefined, request)
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
