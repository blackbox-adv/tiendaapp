import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── Simple in-memory rate limiter (per IP) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(request: NextRequest, prefix: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return `${prefix}:${ip}`
}

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count++
  return entry.count > maxRequests
}

// ── Cleanup stale entries every 5 minutes ──
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }, 5 * 60 * 1000)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit: Login endpoint (max 10 requests per minute per IP)
  if (pathname === '/api/auth' && request.method === 'POST') {
    const key = getRateLimitKey(request, 'login')
    if (isRateLimited(key, 10, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }
  }

  // Rate limit: Register endpoint (max 5 requests per minute per IP)
  if (pathname === '/api/users' && request.method === 'POST') {
    const key = getRateLimitKey(request, 'register')
    if (isRateLimited(key, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Demasiados registros. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }
  }

  // Rate limit: Payment webhook (max 30 requests per minute per IP)
  if (pathname === '/api/payments' && request.method === 'PUT') {
    const key = getRateLimitKey(request, 'webhook')
    if (isRateLimited(key, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/auth',
    '/api/users',
    '/api/payments',
  ],
}
