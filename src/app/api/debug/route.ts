import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    database_url: process.env.DATABASE_URL ? 'SET (' + (process.env.DATABASE_URL as string).substring(0, 20) + '...)' : 'MISSING',
    next_public_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
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

  return NextResponse.json(diagnostics, { status: 200 });
}
