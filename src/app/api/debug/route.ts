import { NextRequest } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

// GET /api/debug - ADMIN ONLY - Blocked in production
export async function GET(request: NextRequest) {
  // Block in production
  if (process.env.NODE_ENV === 'production') {
    return apiError('Debug endpoint disabled in production', 403, undefined, request)
  }

  // Require admin auth
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)
  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado', 403, undefined, request)
  }

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    database_url: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    next_public_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    resend_api_key: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
    jwt_secret: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    webhook_secret: process.env.WEBHOOK_SECRET ? 'SET' : 'NOT SET',
  };

  // Test Prisma connection
  try {
    const { db } = await import('@/lib/db');
    const userCount = await db.user.count();
    diagnostics.database_connection = 'OK';
    diagnostics.user_count = userCount;
  } catch (error: unknown) {
    diagnostics.database_connection = 'FAILED';
    diagnostics.database_error = error instanceof Error ? error.message : String(error);
  }

  // Auth system check (custom JWT)
  try {
    const auth = await import('@/lib/auth');
    const exports = Object.keys(auth);
    diagnostics.auth_system = 'custom_jwt';
    diagnostics.auth_exports = exports;
  } catch (error: unknown) {
    diagnostics.auth_config = 'FAILED';
    diagnostics.auth_error = error instanceof Error ? error.message : String(error);
  }

  return apiSuccess(diagnostics, 200, request)
}
