// QA: buscar tienda real no-premium (para probar gating del chat)
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const rows = await db.$queryRawUnsafe(`
    SELECT s.slug, s.name, pl.type as plan
    FROM "Store" s
    LEFT JOIN "Subscription" sub ON sub."storeId" = s.id AND sub.status = 'active'
    LEFT JOIN "Plan" pl ON pl.id = sub."planId"
    WHERE s."isActive" = true AND s."isDemo" = false
    LIMIT 8
  `)
  console.log(JSON.stringify(rows, null, 1))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
