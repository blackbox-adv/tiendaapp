import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { apiSuccess, apiError, handleCorsPreflight } from '@/lib/api-response'
import { authenticateRequest } from '@/lib/auth'

// GET /api/setup-db/security
// Applies Supabase Security Advisor fixes:
//   1. Enables RLS on Notification (deny all for anon/authenticated)
//   2. Converts v_store_summary and v_payment_history to SECURITY INVOKER
//
// Idempotent: safe to re-run.
// Requires admin auth (only the platform owner should trigger this).
export async function GET(request: NextRequest) {
  // Auth guard — admin only
  const auth = await authenticateRequest(request)
  if (auth.error || !auth.user) {
    return apiError('No autorizado', 401, undefined, request)
  }
  if (auth.user.role !== 'admin' && auth.user.role !== 'super_admin') {
    return apiError('Requiere permisos de administrador', 403, undefined, request)
  }

  const results: Array<{ step: string; success: boolean; detail?: string }> = []

  // ───────────────────────────────────────────────────────────
  // 1. Enable RLS on Notification
  // ───────────────────────────────────────────────────────────
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;`)
    results.push({ step: 'enable_rls_notification', success: true })
  } catch (err) {
    results.push({
      step: 'enable_rls_notification',
      success: false,
      detail: err instanceof Error ? err.message.substring(0, 200) : String(err),
    })
  }

  // ───────────────────────────────────────────────────────────
  // 2. Drop existing Notification policies (idempotent)
  // ───────────────────────────────────────────────────────────
  const policiesToDrop = [
    'notification_select_own_or_broadcast',
    'notification_update_own',
    'notification_delete_own',
    'notification_insert_own',
    'notification_deny_all',
    'notification_deny_anon_select',
    'notification_deny_anon_insert',
    'notification_deny_anon_update',
    'notification_deny_anon_delete',
  ]
  for (const policyName of policiesToDrop) {
    try {
      await db.$executeRawUnsafe(
        `DROP POLICY IF EXISTS "${policyName}" ON "Notification";`
      )
      results.push({ step: `drop_policy_${policyName}`, success: true })
    } catch (err) {
      results.push({
        step: `drop_policy_${policyName}`,
        success: false,
        detail: err instanceof Error ? err.message.substring(0, 100) : String(err),
      })
    }
  }

  // ───────────────────────────────────────────────────────────
  // 3. Create DENY policies for anon/authenticated
  // (service_role bypasses RLS so Prisma keeps working)
  // ───────────────────────────────────────────────────────────
  const denyPolicies = [
    {
      name: 'notification_deny_anon_select',
      sql: `CREATE POLICY "notification_deny_anon_select" ON "Notification"
            FOR SELECT TO anon, authenticated USING (false);`,
    },
    {
      name: 'notification_deny_anon_insert',
      sql: `CREATE POLICY "notification_deny_anon_insert" ON "Notification"
            FOR INSERT TO anon, authenticated WITH CHECK (false);`,
    },
    {
      name: 'notification_deny_anon_update',
      sql: `CREATE POLICY "notification_deny_anon_update" ON "Notification"
            FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);`,
    },
    {
      name: 'notification_deny_anon_delete',
      sql: `CREATE POLICY "notification_deny_anon_delete" ON "Notification"
            FOR DELETE TO anon, authenticated USING (false);`,
    },
  ]
  for (const p of denyPolicies) {
    try {
      await db.$executeRawUnsafe(p.sql)
      results.push({ step: `create_policy_${p.name}`, success: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // 42710 = policy already exists, harmless
      if (msg.includes('42710') || msg.includes('already exists')) {
        results.push({ step: `create_policy_${p.name}`, success: true, detail: 'already_exists' })
      } else {
        results.push({
          step: `create_policy_${p.name}`,
          success: false,
          detail: msg.substring(0, 200),
        })
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // 4. Convert v_store_summary to SECURITY INVOKER
  // ───────────────────────────────────────────────────────────
  try {
    await db.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_views
          WHERE schemaname = 'public' AND viewname = 'v_store_summary'
        ) THEN
          ALTER VIEW public.v_store_summary SECURITY INVOKER;
        END IF;
      END $$;
    `)
    results.push({ step: 'view_v_store_summary_security_invoker', success: true })
  } catch (err) {
    results.push({
      step: 'view_v_store_summary_security_invoker',
      success: false,
      detail: err instanceof Error ? err.message.substring(0, 200) : String(err),
    })
  }

  // ───────────────────────────────────────────────────────────
  // 5. Convert v_payment_history to SECURITY INVOKER
  // ───────────────────────────────────────────────────────────
  try {
    await db.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_views
          WHERE schemaname = 'public' AND viewname = 'v_payment_history'
        ) THEN
          ALTER VIEW public.v_payment_history SECURITY INVOKER;
        END IF;
      END $$;
    `)
    results.push({ step: 'view_v_payment_history_security_invoker', success: true })
  } catch (err) {
    results.push({
      step: 'view_v_payment_history_security_invoker',
      success: false,
      detail: err instanceof Error ? err.message.substring(0, 200) : String(err),
    })
  }

  // ───────────────────────────────────────────────────────────
  // 6. Verify — read back current state
  // ───────────────────────────────────────────────────────────
  try {
    const rlsStatus = await db.$queryRawUnsafe(`
      SELECT relname, relrowsecurity AS rls_enabled, relforcerowsecurity AS rls_forced
      FROM pg_class
      WHERE relname = 'Notification';
    `) as Array<{ relname: string; rls_enabled: boolean; rls_forced: boolean }>
    results.push({
      step: 'verify_notification_rls',
      success: true,
      detail: JSON.stringify(rlsStatus[0] || {}),
    })
  } catch (err) {
    results.push({
      step: 'verify_notification_rls',
      success: false,
      detail: err instanceof Error ? err.message.substring(0, 200) : String(err),
    })
  }

  const failed = results.filter((r) => !r.success)
  return apiSuccess(
    {
      message: failed.length === 0
        ? 'Security fixes applied successfully'
        : `Applied with ${failed.length} errors (see results)`,
      totalSteps: results.length,
      failedSteps: failed.length,
      results,
    },
    200,
    request
  )
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
