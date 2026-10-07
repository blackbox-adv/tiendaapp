// QA del gating payFirst (envío se paga primero = Pro/Premium)
// 1) FREE: PUT con payFirst:true -> se recorta; GET público no lo sirve
// 2) PREMIUM (sub temporal directa en BD): PUT conserva payFirst; GET público lo sirve
// 3) Cleanup: opciones sin payFirst + sub eliminada
// uso: DATABASE_URL='...' node --dns-result-order=ipv4first scripts/qa-payfirst-gate.mjs
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const BASE = 'https://kyllari.com'
const SLUG = 'qa-recorrido-test'
const QA_EMAIL = 'qa.recorrido.2026@tiendapp-test.com'
const QA_PASS = 'QaRecorrido2026!'
const PREMIUM_PLAN_ID = 'cms0qpek50002r4xlm100hlfe'

let failures = 0
const ok = (cond, label) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${label}`)
  if (!cond) failures++
}

async function main() {
  // 1. Login -> JWT
  const loginRes = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: QA_EMAIL, password: QA_PASS }),
  })
  const login = await loginRes.json()
  const token = login.token || login.user?.token
  ok(!!token, 'login QA obtiene JWT')
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  // 2. Opciones actuales de la tienda
  const cur = await (await fetch(`${BASE}/api/stores/${SLUG}`)).json()
  const baseOpts = Array.isArray(cur.shippingOptions) && cur.shippingOptions.length > 0
    ? cur.shippingOptions
    : [{ label: 'Delivery centro', price: 5, time: '24 horas' }]
  const optsPayFirst = baseOpts.map((o, i) => ({ ...o, payFirst: i === 0 }))

  // 3. FREE: PUT con payFirst -> se recorta
  const putFree = await fetch(`${BASE}/api/stores/${SLUG}`, {
    method: 'PUT', headers: auth, body: JSON.stringify({ shippingOptions: optsPayFirst }),
  })
  const savedFree = await putFree.json()
  ok(putFree.status === 200, `PUT free responde 200 (status ${putFree.status})`)
  ok(!savedFree.shippingOptions?.some((o) => 'payFirst' in o && o.payFirst === true), 'FREE: respuesta del PUT no conserva payFirst')

  const getFree = await (await fetch(`${BASE}/api/stores/${SLUG}`)).json()
  ok(!getFree.shippingOptions?.some((o) => o.payFirst === true), 'FREE: GET público no sirve payFirst')

  // 4. PREMIUM temporal (directo en BD)
  const qa = await db.user.findUnique({ where: { email: QA_EMAIL }, select: { id: true, stores: { select: { id: true } } } })
  if (!qa || qa.stores.length === 0) throw new Error('QA user/store no encontrado')
  const sub = await db.subscription.create({
    data: { userId: qa.id, storeId: qa.stores[0].id, planId: PREMIUM_PLAN_ID, status: 'active', billingCycle: 'monthly', amountPaid: 0 },
  })
  console.log('sub premium temporal:', sub.id)

  const putPro = await fetch(`${BASE}/api/stores/${SLUG}`, {
    method: 'PUT', headers: auth, body: JSON.stringify({ shippingOptions: optsPayFirst }),
  })
  const savedPro = await putPro.json()
  ok(putPro.status === 200, `PUT premium responde 200 (status ${putPro.status})`)
  ok(savedPro.shippingOptions?.some((o) => o.payFirst === true), 'PREMIUM: respuesta del PUT conserva payFirst')

  const getPro = await (await fetch(`${BASE}/api/stores/${SLUG}`)).json()
  ok(getPro.shippingOptions?.some((o) => o.payFirst === true), 'PREMIUM: GET público sirve payFirst')

  // 5. Cleanup: opciones limpias + sub fuera
  const clean = await fetch(`${BASE}/api/stores/${SLUG}`, {
    method: 'PUT', headers: auth, body: JSON.stringify({ shippingOptions: baseOpts.map(({ payFirst, ...rest }) => rest) }),
  })
  ok(clean.status === 200, 'cleanup: opciones restauradas sin payFirst')
  await db.subscription.delete({ where: { id: sub.id } })
  const getFinal = await (await fetch(`${BASE}/api/stores/${SLUG}`)).json()
  ok(!getFinal.shippingOptions?.some((o) => o.payFirst === true), 'cleanup: GET final sin payFirst')

  console.log(failures === 0 ? '\nQA TODO PASS' : `\nQA CON ${failures} FALLOS`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
