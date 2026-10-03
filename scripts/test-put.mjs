// Test aislado del SQL que ejecuta PUT /api/store-products (mismas queries)
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const id = 'prod-4ngZ5FQaxiWB9kpVvm0ewdXk'
  // 1. ownership check igual que el handler
  try {
    const own = await db.$queryRawUnsafe(`
      SELECT p.id, s."ownerId"
      FROM "StoreProduct" p
      JOIN "Store" s ON s.id = p."storeId"
      WHERE p.id = $1
    `, id)
    console.log('ownership OK:', JSON.stringify(own))
  } catch (e) {
    console.log('OWNERSHIP ERROR:', e.message.slice(0, 300))
  }

  // 2. update igual que el handler
  try {
    const r = await db.$executeRawUnsafe(`
      UPDATE "StoreProduct" SET "name" = $1, "updatedAt" = NOW() WHERE id = $2
    `, 'QA Auricular Pro', id)
    console.log('UPDATE OK, rowCount:', r)
  } catch (e) {
    console.log('UPDATE ERROR:', e.message.slice(0, 300))
  }
}

main().finally(() => db.$disconnect())
