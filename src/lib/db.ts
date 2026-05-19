import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isDev = process.env.NODE_ENV !== 'production'

// In production (Vercel), use DIRECT_URL for the Prisma Client connection
// to avoid PgBouncer type conversion issues. PgBouncer's transaction mode
// can cause "Error converting field" errors with Prisma's binary protocol.
// The pooler URL (DATABASE_URL) is still used by Prisma CLI for migrations.
function getDatasourceUrl(): string {
  // Prefer DIRECT_URL (direct connection, no pooler) for runtime queries
  if (process.env.DIRECT_URL) {
    return process.env.DIRECT_URL
  }
  // Fallback to DATABASE_URL with pgbouncer flag
  const url = process.env.DATABASE_URL || ''
  if (url.includes('pooler.supabase.com') && !url.includes('pgbouncer')) {
    const separator = url.includes('?') ? '&' : '?'
    return url + separator + 'pgbouncer=true&connection_limit=5'
  }
  return url
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ['warn', 'error'] : ['error'],
    datasourceUrl: getDatasourceUrl(),
  })

if (isDev) globalForPrisma.prisma = db
