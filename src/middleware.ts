import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { corsHeaders } from '@/lib/api-response'

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

// ── Security Headers ──
const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// Content Security Policy
// NOTE: Next.js App Router requires 'unsafe-inline' for script-src because it uses
// inline scripts for RSC (React Server Components) flight data (self.__next_f.push).
// Without 'unsafe-inline', React cannot hydrate and the page appears blank.
// A nonce-based CSP is the ideal long-term solution, but requires per-request nonce
// generation and passing it to all <Script> components via Next.js headers().
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.tile.openstreetmap.org https://lh3.googleusercontent.com",
  "connect-src 'self' https://wa.me https://api.culqi.com https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

function getSecurityHeaders(): Record<string, string> {
  return {
    ...securityHeaders,
    'Content-Security-Policy': CSP_POLICY,
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // ── Security Headers for ALL responses ──
  const response = NextResponse.next()

  // Apply security headers to page routes (not API)
  if (!pathname.startsWith('/api/')) {
    const secHeaders = getSecurityHeaders()
    for (const [key, value] of Object.entries(secHeaders)) {
      response.headers.set(key, value)
    }
  }

  // API-specific headers
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
  }

  // Handle CORS preflight for ALL API routes
  if (method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(request),
    })
  }

  // Rate limit: Login endpoint (max 10 requests per minute per IP)
  if (pathname === '/api/auth' && method === 'POST') {
    const key = getRateLimitKey(request, 'login')
    if (isRateLimited(key, 10, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 1 minuto.', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders(request) }
      )
    }
  }

  // Rate limit: Register endpoint (max 5 requests per minute per IP)
  if (pathname === '/api/users' && method === 'POST') {
    const key = getRateLimitKey(request, 'register')
    if (isRateLimited(key, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Demasiados registros. Intenta de nuevo en 1 minuto.', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders(request) }
      )
    }
  }

  // Rate limit: Payment webhook (max 30 requests per minute per IP)
  if (pathname === '/api/payments' && method === 'PUT') {
    const key = getRateLimitKey(request, 'webhook')
    if (isRateLimited(key, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders(request) }
      )
    }
  }

  // Rate limit: WhatsApp endpoint (max 20 requests per minute per IP)
  if (pathname === '/api/whatsapp' && method === 'POST') {
    const key = getRateLimitKey(request, 'whatsapp')
    if (isRateLimited(key, 20, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders(request) }
      )
    }
  }

  // Rate limit: Payment submission (max 5 requests per minute per IP)
  if (pathname === '/api/payments/submit' && method === 'POST') {
    const key = getRateLimitKey(request, 'payment-submit')
    if (isRateLimited(key, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos de pago. Intenta de nuevo en 1 minuto.', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders(request) }
      )
    }
  }

  // Rate limit: Upload endpoint (max 10 requests per minute per IP)
  if (pathname === '/api/upload' && method === 'POST') {
    const key = getRateLimitKey(request, 'upload')
    if (isRateLimited(key, 10, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Demasiadas subidas. Intenta de nuevo en 1 minuto.', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders(request) }
      )
    }
  }

  // Rate limit: Seed endpoint (max 3 requests per hour per IP)
  if (pathname === '/api/seed' && method === 'POST') {
    const key = getRateLimitKey(request, 'seed')
    if (isRateLimited(key, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Limite de seed alcanzado. Espera 1 hora.', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders(request) }
      )
    }
  }

  // Rate limit: Store visit endpoint (max 5 per minute per IP)
  if (pathname === '/api/stores/visit' && method === 'POST') {
    const key = getRateLimitKey(request, 'visit')
    if (isRateLimited(key, 5, 60 * 1000)) {
      return NextResponse.json({ error: 'Demasiadas solicitudes.', code: 'RATE_LIMITED' }, { status: 429, headers: corsHeaders(request) })
    }
  }
  // Rate limit: Password reset (max 3 per hour per IP)
  if (pathname === '/api/auth' && method === 'PUT') {
    const key = getRateLimitKey(request, 'reset')
    if (isRateLimited(key, 3, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Demasiados intentos de reseteo.', code: 'RATE_LIMITED' }, { status: 429, headers: corsHeaders(request) })
    }
  }

  return response
}

export const config = {
  matcher: [
    // API routes
    '/api/auth',
    '/api/users',
    '/api/payments',
    '/api/payments/submit',
    '/api/whatsapp',
    '/api/seed',
    '/api/stores','/api/stores/visit','/api/store-products','/api/health',
    '/api/settings',
    '/api/subscriptions',
    '/api/download-zip',
    '/api/plans',
    '/api/upload',
    '/api/admin/payments',
    // Page routes (for security headers)
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
