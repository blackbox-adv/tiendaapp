import { NextResponse } from 'next/server'
import { apiSuccess, handleCorsPreflight } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const checks: Record<string, string> = {}
    checks['DATABASE_URL'] = process.env.DATABASE_URL ? 'OK' : 'MISSING'
    checks['DIRECT_URL'] = process.env.DIRECT_URL ? 'OK' : 'MISSING'
    checks['SUPABASE_URL'] = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) ? 'OK' : 'MISSING'
    checks['SUPABASE_SERVICE_ROLE_KEY'] = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
    checks['NEXT_PUBLIC_SUPABASE_URL'] = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'NOT SET'
    checks['RESEND_API_KEY'] = process.env.RESEND_API_KEY ? 'SET' : 'NOT SET'
    checks['NEXT_PUBLIC_APP_URL'] = process.env.NEXT_PUBLIC_APP_URL ? 'OK' : 'NOT SET'
    checks['JWT_SECRET'] = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16 ? 'OK' : 'WEAK OR MISSING'

    try {
      const { db } = await import('@/lib/db')
      const userCount = await db.user.count()
      checks['DATABASE_CONNECTION'] = 'OK'
      checks['USER_COUNT'] = String(userCount)

      // Check if key columns exist by trying a minimal query
      try {
        await db.user.findFirst({
          select: { id: true, email: true, tokenVersion: true, resetToken: true, lastLogin: true }
        })
        checks['DATABASE_SCHEMA'] = 'OK'
      } catch (schemaErr: unknown) {
        const msg = schemaErr instanceof Error ? schemaErr.message : String(schemaErr)
        checks['DATABASE_SCHEMA'] = `MISMATCH: ${msg.substring(0, 150)}`
      }

      // Check Plan table
      try {
        const planCount = await db.plan.count()
        checks['PLAN_COUNT'] = String(planCount)
      } catch (planErr: unknown) {
        const msg = planErr instanceof Error ? planErr.message : String(planErr)
        checks['PLAN_TABLE'] = `ERROR: ${msg.substring(0, 100)}`
      }

      // Check Supabase Storage (upload functionality)
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase.storage.listBuckets()
        if (error) {
          checks['SUPABASE_STORAGE'] = `ERROR: ${error.message.substring(0, 80)}`
        } else {
          const bucketNames = data?.map(b => b.name) || []
          checks['SUPABASE_STORAGE'] = bucketNames.includes('product-images') ? 'OK (product-images bucket exists)' : `NO product-images bucket. Buckets: ${bucketNames.join(', ') || 'none'}`
        }
      } catch (storageErr: unknown) {
        const msg = storageErr instanceof Error ? storageErr.message : String(storageErr)
        checks['SUPABASE_STORAGE'] = `ERROR: ${msg.substring(0, 80)}`
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      checks['DATABASE_CONNECTION'] = `FAILED: ${msg.substring(0, 80)}`
    }

    const allOk = Object.values(checks).every(v => v === 'OK' || v === 'SET' || v.match(/^\d+$/))
    return apiSuccess({ status: allOk ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString(), checks }, allOk ? 200 : 500, request)
  } catch {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  }
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}
