import { NextResponse } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const auth = await authenticateRequest(request)
      if (auth.error || !auth.user) {
        return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
      }
      if (!requireRole(auth.user, ['super_admin'])) {
        return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
      }
    }
    const checks: Record<string, string> = {}
    checks['DATABASE_URL'] = process.env.DATABASE_URL ? 'OK' : 'MISSING'
    checks['SUPABASE_URL'] = process.env.SUPABASE_URL ? 'OK' : 'MISSING'
    checks['RESEND_API_KEY'] = process.env.RESEND_API_KEY ? 'SET' : 'NOT SET'
    checks['NEXT_PUBLIC_APP_URL'] = process.env.NEXT_PUBLIC_APP_URL ? 'OK' : 'NOT SET'
    checks['JWT_SECRET'] = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16 ? 'OK' : 'WEAK OR MISSING'
    try {
      const { db } = await import('@/lib/db')
      await db.user.count()
      checks['DATABASE_CONNECTION'] = 'OK'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      checks['DATABASE_CONNECTION'] = `FAILED: ${msg.substring(0, 50)}`
    }
    const allOk = Object.values(checks).every(v => v === 'OK' || v === 'SET')
    return apiSuccess({ status: allOk ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString(), checks }, allOk ? 200 : 500, request)
  } catch {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  }
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}
