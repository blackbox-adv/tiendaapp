import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isDev = process.env.NODE_ENV !== 'production'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || ''
  // Supabase transaction pooler REQUIRES ?pgbouncer=true for Prisma
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
