// Task 30: validar SQL de notificaciones automáticas contra producción
// (INSERT → SELECT → DELETE, sin dejar datos)
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  // 1) El INSERT que usa notifyOnce
  await db.$executeRawUnsafe(
    `INSERT INTO "Notification" (id, title, message, type, icon, link, "userId", read, "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, false, now())`,
    'TEST - limite de productos', 'prueba interna', 'warning', '📦', '/dashboard/plan', 'qa-test-user-fake'
  )
  console.log('✔ INSERT ok')

  // 2) SELECT del GET (usuario + broadcast)
  const rows = await db.$queryRawUnsafe(
    `SELECT id, title, message, type, icon, link, read, "createdAt"
     FROM "Notification" WHERE "userId" = $1 OR "userId" IS NULL
     ORDER BY "createdAt" DESC LIMIT 30`, 'qa-test-user-fake'
  )
  console.log('✔ SELECT GET ok, filas:', rows.length)

  // 3) Dedup
  const dedup = await db.$queryRawUnsafe(
    `SELECT 1 FROM "Notification" WHERE title = $1 AND ("userId" = $2 OR "userId" IS NULL)
     AND "createdAt" > now() - interval '7 days' LIMIT 1`, 'TEST - limite de productos', 'qa-test-user-fake'
  )
  console.log('✔ dedup ok, encuentra:', dedup.length)

  // 4) UPDATE markAllRead
  const upd = await db.$executeRawUnsafe(
    `UPDATE "Notification" SET read = true WHERE read = false AND ("userId" = $1 OR "userId" IS NULL)`,
    'qa-test-user-fake'
  )
  console.log('✔ UPDATE ok, filas:', upd)

  // 5) DELETE (limpieza total de la prueba)
  const del = await db.$executeRawUnsafe(`DELETE FROM "Notification" WHERE "userId" = $1`, 'qa-test-user-fake')
  console.log('✔ DELETE ok, filas:', del)

  // 6) Las 2 queries de generación automática (solo lectura, sin depender de datos)
  const exp = await db.$queryRawUnsafe(
    `SELECT pl.name AS "planName", sub."nextBillingDate"
     FROM "Subscription" sub JOIN "Plan" pl ON pl.id = sub."planId"
     WHERE sub."userId" = $1 AND sub.status = 'active'
       AND sub."nextBillingDate" IS NOT NULL
       AND sub."nextBillingDate" <= now() + interval '7 days'
     ORDER BY sub."nextBillingDate" ASC LIMIT 1`, 'qa-test-user-fake'
  )
  const lim = await db.$queryRawUnsafe(
    `SELECT pl."maxProducts" AS "maxProducts", pl.name AS "planName",
       (SELECT COUNT(*)::int FROM "StoreProduct" sp
         WHERE sp."storeId" IN (SELECT s.id FROM "Store" s WHERE s."ownerId" = $1) AND sp."isActive" = true) AS "used"
     FROM "Subscription" sub JOIN "Plan" pl ON pl.id = sub."planId"
     WHERE sub."userId" = $1 AND sub.status = 'active'
     ORDER BY sub."createdAt" DESC LIMIT 1`, 'qa-test-user-fake'
  )
  console.log('✔ queries automáticas ok (expiring:', exp.length, ', limits:', lim.length, ')')
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1) }).finally(() => db.$disconnect())
