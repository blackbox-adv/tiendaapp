// Cleanup QA task 41: quitar sizeGuide/shipping de la tienda QA + eliminar subs premium
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const QA_STORE_ID = 'cmuswebj90002js04xa62ffx1'
const QA_EMAIL = 'qa.recorrido.2026@tiendapp-test.com'
const PREMIUM_PLAN_ID = 'cms0qpek50002r4xlm100hlfe'

async function main() {
  const st = await db.store.update({
    where: { id: QA_STORE_ID },
    data: { shippingOptions: [], sizeGuide: {} },
    select: { slug: true, shippingOptions: true, sizeGuide: true },
  })
  console.log('tienda QA limpiada:', JSON.stringify(st))

  const qa = await db.user.findUnique({ where: { email: QA_EMAIL }, select: { id: true } })
  const subs = await db.subscription.deleteMany({
    where: { userId: qa.id, planId: PREMIUM_PLAN_ID, status: 'active' },
  })
  console.log('subs premium eliminadas:', subs.count)

  const check = await db.$queryRawUnsafe(`
    SELECT pl.type FROM "Subscription" sub JOIN "Plan" pl ON pl.id = sub."planId"
    WHERE sub."userId" = $1 AND sub.status = 'active'
  `, qa.id)
  console.log('plan activo tras limpieza:', JSON.stringify(check))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
