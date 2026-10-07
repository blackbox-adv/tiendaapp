// QA: estado del usuario de prueba y planes disponibles
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const qa = await db.user.findUnique({
    where: { email: 'qa.recorrido.2026@tiendapp-test.com' },
    select: { id: true, email: true, role: true, isActive: true, stores: { select: { id: true, slug: true, name: true, isActive: true } } },
  })
  console.log('QA user:', JSON.stringify(qa, null, 2))

  const plans = await db.plan.findMany({ select: { id: true, type: true, name: true, price: true } })
  console.log('Planes:', JSON.stringify(plans))

  const subs = qa ? await db.subscription.findMany({
    where: { userId: qa.id },
    select: { id: true, status: true, planId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  }) : []
  console.log('Subs QA:', JSON.stringify(subs))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
