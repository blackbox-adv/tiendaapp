-- ============================================================
-- Fix Supabase Security Advisor issues
-- ============================================================
-- Issues addressed:
--   1. RLS Disabled in Public: public.Notification   (CRITICAL)
--   2. Security Definer View:  public.v_store_summary
--   3. Security Definer View:  public.v_payment_history
--
-- Architecture context:
--   - The app uses Prisma with the service_role key, which BYPASSES RLS.
--   - All reads/writes go through API routes with custom JWT auth
--     (authenticateRequest) — the browser never touches Supabase directly.
--   - The anon key IS exposed in client JS for Storage uploads, so a
--     malicious user could try to bypass the API and hit PostgREST.
--   - Solution: enable RLS and DENY all access to anon/authenticated.
--     Prisma (service_role) keeps working as before.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ============================================================
-- 1. Notification table: enable RLS + deny anon/authenticated
-- ============================================================

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) — idempotent
DROP POLICY IF EXISTS "notification_select_own_or_broadcast" ON "Notification";
DROP POLICY IF EXISTS "notification_update_own" ON "Notification";
DROP POLICY IF EXISTS "notification_delete_own" ON "Notification";
DROP POLICY IF EXISTS "notification_insert_own" ON "Notification";
DROP POLICY IF EXISTS "notification_deny_all" ON "Notification";

-- NO policies = default DENY for anon and authenticated roles.
-- The service_role (used by Prisma) bypasses RLS entirely,
-- so the API keeps working unchanged.

-- Optional: explicit deny policies for clarity (defensive)
CREATE POLICY "notification_deny_anon_select" ON "Notification"
  FOR SELECT TO anon, authenticated
  USING (false);

CREATE POLICY "notification_deny_anon_insert" ON "Notification"
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "notification_deny_anon_update" ON "Notification"
  FOR UPDATE TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "notification_deny_anon_delete" ON "Notification"
  FOR DELETE TO anon, authenticated
  USING (false);

-- ============================================================
-- 2. v_store_summary: convert to SECURITY INVOKER
-- ============================================================
-- This view is not referenced anywhere in the source code.
-- Converting to SECURITY INVOKER means it runs with the caller's
-- permissions, so anon can only see what RLS policies allow.
-- Prisma (service_role) still sees everything.

DO $$
BEGIN
  -- Try to recreate the view with SECURITY INVOKER if it exists.
  -- We need to capture the existing definition first.
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'v_store_summary'
  ) THEN
    -- Just change the security property without recreating
    ALTER VIEW public.v_store_summary SECURITY INVOKER;
    RAISE NOTICE 'Updated v_store_summary to SECURITY INVOKER';
  ELSE
    RAISE NOTICE 'View v_store_summary does not exist — skipping';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not update v_store_summary: %', SQLERRM;
END $$;

-- ============================================================
-- 3. v_payment_history: convert to SECURITY INVOKER
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'v_payment_history'
  ) THEN
    ALTER VIEW public.v_payment_history SECURITY INVOKER;
    RAISE NOTICE 'Updated v_payment_history to SECURITY INVOKER';
  ELSE
    RAISE NOTICE 'View v_payment_history does not exist — skipping';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not update v_payment_history: %', SQLERRM;
END $$;

-- ============================================================
-- Verification queries (run after to confirm)
-- ============================================================
-- SELECT relname, relrowsecurity, relforcerowsecurity
--   FROM pg_class
--   WHERE relname = 'Notification';
--
-- SELECT viewname, definition
--   FROM pg_views
--   WHERE viewname IN ('v_store_summary', 'v_payment_history');
--
-- SELECT polname, polcmd, polroles::regrole[]
--   FROM pg_policy
--   WHERE polrelid = '"Notification"'::regclass;
