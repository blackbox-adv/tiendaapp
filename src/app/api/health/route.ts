import { NextResponse } from 'next/server'

// GET /api/health - Check database and env vars status
export async function GET() {
  const checks: Record<string, string> = {}

  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || ''
  checks['DATABASE_URL'] = dbUrl.startsWith('postgresql://') ? 'OK' : `MISSING OR INVALID (starts with: "${dbUrl.substring(0, 15)}...")`

  // Check DIRECT_URL
  const directUrl = process.env.DIRECT_URL || ''
  checks['DIRECT_URL'] = directUrl.startsWith('postgresql://') ? 'OK' : 'NOT SET'

  // Check SUPABASE_URL
  checks['SUPABASE_URL'] = process.env.SUPABASE_URL ? 'OK' : 'MISSING'

  // Check RESEND_API_KEY
  checks['RESEND_API_KEY'] = process.env.RESEND_API_KEY?.startsWith('re_') ? 'OK' : 'MISSING'

  // Check NEXT_PUBLIC_APP_URL
  checks['NEXT_PUBLIC_APP_URL'] = process.env.NEXT_PUBLIC_APP_URL ? `SET (${process.env.NEXT_PUBLIC_APP_URL})` : 'NOT SET'

  // Check JWT_SECRET
  checks['JWT_SECRET'] = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16 ? 'OK' : 'MISSING OR WEAK'

  // Test database connection
  try {
    const { db } = await import('@/lib/db')
    await db.user.count()
    checks['DATABASE_CONNECTION'] = 'OK'
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    checks['DATABASE_CONNECTION'] = `FAILED: ${msg.substring(0, 100)}`
  }

  const allOk = Object.values(checks).every(v => v === 'OK')

  return NextResponse.json({
    status: allOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: allOk ? 200 : 500 })
}
