// QA cleanup: revertir premium, eliminar empleado de prueba y mensajes QA
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const QA_EMAIL = 'qa.recorrido.2026@tiendapp-test.com'
const QA_STORE_ID = 'cmuswebj90002js04xa62ffx1'
const PREMIUM_PLAN_ID = 'cms0qpek50002r4xlm100hlfe'
const EMP_EMAIL = 'qa.empleado.2026@tiendapp-test.com'

async function main() {
  // 1) Suscripción premium temporal -> fuera
  const qaUser = await db.user.findUnique({ where: { email: QA_EMAIL }, select: { id: true } })
  if (!qaUser) throw new Error('QA user no encontrado')
  const subs = await db.subscription.deleteMany({
    where: { userId: qaUser.id, planId: PREMIUM_PLAN_ID },
  })
  console.log('subs premium eliminadas:', subs.count)

  // 2) Empleado de prueba: member + user
  const empUser = await db.user.findUnique({ where: { email: EMP_EMAIL }, select: { id: true } })
  if (empUser) {
    const m = await db.storeMember.deleteMany({ where: { userId: empUser.id } })
    await db.user.delete({ where: { id: empUser.id } })
    console.log('empleado QA eliminado: member', m.count, '+ user')
  } else {
    console.log('empleado QA: ya no existe')
  }

  // 3) Mensajes de chat de prueba
  const msgs = await db.chatMessage.deleteMany({ where: { storeId: QA_STORE_ID } })
  console.log('mensajes QA eliminados:', msgs.count)

  // 4) Confirmar estado final del QA store: sin plan
  const check = await db.$queryRawUnsafe(`
    SELECT pl.type FROM "Subscription" sub JOIN "Plan" pl ON pl.id = sub."planId"
    WHERE sub."userId" = (SELECT id FROM "User" WHERE email = $1) AND sub.status = 'active'
  `, QA_EMAIL)
  console.log('plan QA activo tras limpieza:', JSON.stringify(check))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
