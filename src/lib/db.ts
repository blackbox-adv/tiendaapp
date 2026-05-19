import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isDev = process.env.NODE_ENV !== 'production'

function getDatabaseUrl(): string {
  // Prefer DIRECT_URL for Prisma operations (avoids PgBouncer issues with prepared statements)
  // PgBouncer transaction mode doesn't support Prisma's prepared statements for writes
  const directUrl = process.env.DIRECT_URL
  if (directUrl) return directUrl
  
  // Fallback to DATABASE_URL with pgbouncer flag
  const url = process.env.DATABASE_URL || ''
  if (url.includes('pooler.supabase.com') && !url.includes('pgbouncer')) {
    const separator = url.includes('?') ? '&' : '?'
    return url + separator + 'pgbouncer=true'
  }
  return url
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ['warn', 'error'] : ['error'],
    datasourceUrl: getDatabaseUrl(),
  })

if (isDev) globalForPrisma.prisma = db
