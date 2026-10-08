// QA: notificacion al super_admin cuando una tienda envia comprobante de pago
// 1) login QA -> POST /api/payments/submit (plan pro, voucher)
// 2) verifica Notification para super_admin con nombre de la tienda
// 3) cleanup: payment + subscription past_due + notificaciones de prueba
// uso: DATABASE_URL='...' node --dns-result-order=ipv4first scripts/qa-payment-notify.mjs
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const BASE = 'https://kyllari.com'
const QA_EMAIL = 'qa.recorrido.2026@tiendapp-test.com'
const QA_PASS = 'QaRecorrido2026!'

let failures = 0
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'} — ${l}`); if (!c) failures++ }

async function main() {
  const login = await (await fetch(`${BASE}/api/auth`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: QA_EMAIL, password: QA_PASS }),
  })).json()
  const token = login.token || login.user?.token
  ok(!!token, 'login QA obtiene JWT')

  const proPlan = await db.plan.findFirst({ where: { type: 'pro' }, select: { id: true, name: true, price: true } })
  if (!proPlan) throw new Error('plan pro no encontrado')

  // Enviar comprobante
  const voucher = `QA${Date.now()}`
  const res = await fetch(`${BASE}/api/payments/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ planId: proPlan.id, externalRef: voucher, paymentMethod: 'yape' }),
  })
  const data = await res.json()
  ok(res.status === 201, `submit comprobante -> 201 (status ${res.status}, msg ${data?.message || data?.error})`)

  const qa = await db.user.findUnique({ where: { email: QA_EMAIL }, select: { id: true, stores: { select: { id: true, name: true } } } })
  if (!qa || qa.stores.length === 0) throw new Error('QA user/store no encontrado')
  const storeName = qa.stores[0].name

  // Notificacion creada para cada super_admin
  const admins = await db.user.findMany({ where: { role: 'super_admin' }, select: { id: true } })
  ok(admins.length > 0, `hay ${admins.length} super_admin(s)`)
  for (const a of admins) {
    const n = await db.notification.findFirst({
      where: { userId: a.id, title: { contains: 'pago por verificar' }, message: { contains: voucher } },
    })
    ok(!!n, `notificacion creada para admin ${a.id.slice(0, 8)}... (comprobante ${voucher})`)
  }

  // Cleanup
  const delPay = await db.payment.deleteMany({ where: { userId: qa.id, externalRef: voucher } })
  const delSub = await db.subscription.deleteMany({ where: { userId: qa.id, storeId: qa.stores[0].id, status: 'past_due' } })
  const delNotif = await db.notification.deleteMany({ where: { message: { contains: voucher } } })
  console.log(`cleanup: ${delPay.count} payment, ${delSub.count} subscription, ${delNotif.count} notifications eliminados`)

  console.log(failures === 0 ? '\nQA TODO PASS' : `\nQA CON ${failures} FALLOS`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
