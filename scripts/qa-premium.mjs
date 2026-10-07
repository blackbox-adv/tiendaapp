// QA setup/teardown: suscripción premium temporal para el usuario QA
// uso: node qa-premium.mjs up | down
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const QA_EMAIL = 'qa.recorrido.2026@tiendapp-test.com'
const PREMIUM_PLAN_ID = 'cms0qpek50002r4xlm100hlfe'

async function main() {
  const mode = process.argv[2] || 'up'
  const qa = await db.user.findUnique({
    where: { email: QA_EMAIL },
    select: { id: true, stores: { select: { id: true } } },
  })
  if (!qa || qa.stores.length === 0) throw new Error('QA user/store no encontrado')

  if (mode === 'up') {
    const sub = await db.subscription.create({
      data: {
        userId: qa.id,
        storeId: qa.stores[0].id,
        planId: PREMIUM_PLAN_ID,
        status: 'active',
        billingCycle: 'monthly',
        amountPaid: 0,
      },
    })
    console.log('QA premium ON:', sub.id)
  } else {
    const deleted = await db.subscription.deleteMany({
      where: { userId: qa.id, planId: PREMIUM_PLAN_ID, status: 'active' },
    })
    console.log('QA premium OFF:', deleted.count, 'subs eliminadas')
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
