import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    nextauth_secret: process.env.NEXTAUTH_SECRET ? 'SET (' + process.env.NEXTAUTH_SECRET.substring(0, 4) + '...)' : 'MISSING',
    nextauth_url: process.env.NEXTAUTH_URL || 'NOT SET',
    database_url: process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 20) + '...)' : 'MISSING',
    next_public_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
  };

  // Test Prisma connection
  try {
    const { db } = await import('@/lib/db');
    const userCount = await db.user.count();
    diagnostics.database_connection = 'OK';
    diagnostics.user_count = userCount;
  } catch (error: any) {
    diagnostics.database_connection = 'FAILED';
    diagnostics.database_error = error.message;
  }

  // Test NextAuth
  try {
    const { authOptions } = await import('@/lib/auth');
    diagnostics.nextauth_providers = authOptions.providers.map((p: any) => p.name || p.id);
    diagnostics.nextauth_strategy = authOptions.session?.strategy;
  } catch (error: any) {
    diagnostics.nextauth_config = 'FAILED';
    diagnostics.nextauth_error = error.message;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
