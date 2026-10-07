// Agrega columna sizeGuide a Store (idempotente, instantáneo, no toca datos)
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const sqls = [
  `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "sizeGuide" JSONB NOT NULL DEFAULT '{}'::jsonb`,
]

async function main() {
  for (const sql of sqls) {
    await db.$executeRawUnsafe(sql)
    console.log('OK:', sql.slice(0, 60))
  }
  const check = await db.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default FROM information_schema.columns
    WHERE table_name = 'Store' AND column_name = 'sizeGuide'
  `)
  console.log('verificación:', JSON.stringify(check))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
