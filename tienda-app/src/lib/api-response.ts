import { NextResponse } from 'next/server'

// ── CORS Configuration ──
const ALLOWED_ORIGINS = [
  'https://tiendapp.pe',
  'https://www.tiendapp.pe',
  'https://tienda.blackboxperu.com',
  'https://blackboxperu.com',
  'https://www.blackboxperu.com',
  'http://localhost:3000',
]

// Allow preview URLs during development
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push(
    'https://preview-*.space.chatglm.site',
    'https://*.space.z.ai',
  )
}

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get('origin') || ''
  const isAllowed = ALLOWED_ORIGINS.some(
    (allowed) =>
      allowed === origin ||
      allowed.includes('*') ||
      origin.startsWith(allowed.replace('*', ''))
  )

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Webhook-Signature, X-Culqi-Signature',
    'Access-Control-Max-Age': '86400',
  }

  if (isAllowed) {
    headers['Access-Control-Allow-Origin'] = origin
  } else if (process.env.NODE_ENV !== 'production') {
    headers['Access-Control-Allow-Origin'] = origin || '*'
  }

  return headers
}

// ── Unified Error Response ──
export interface ApiError {
  error: string
  code: string
  details?: unknown
}

const ERROR_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  503: 'SERVICE_UNAVAILABLE',
}

export function apiError(
  message: string,
  status: number = 500,
  details?: unknown,
  request?: Request
): NextResponse {
  const body: ApiError = {
    error: message,
    code: ERROR_CODES[status] || 'UNKNOWN_ERROR',
  }
  if (details && process.env.NODE_ENV !== 'production') {
    body.details = details
  }

  return NextResponse.json(body, {
    status,
    headers: corsHeaders(request),
  })
}

// ── Unified Success Response ──
export function apiSuccess(
  data: unknown,
  status: number = 200,
  request?: Request
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(request),
  })
}

// ── CORS Preflight Handler ──
export function handleCorsPreflight(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  })
}
