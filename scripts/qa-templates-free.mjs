// QA: free puede usar las 3 plantillas base; premium sigue bloqueada
const BASE = 'https://kyllari.com'
const SLUG = 'qa-recorrido-test'
let failures = 0
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'} — ${l}`); if (!c) failures++ }

const login = await (await fetch(`${BASE}/api/auth`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'qa.recorrido.2026@tiendapp-test.com', password: 'QaRecorrido2026!' }),
})).json()
const token = login.token || login.user?.token
const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

const cur = await (await fetch(`${BASE}/api/stores/${SLUG}`)).json()
const original = cur.template
console.log('template actual de la tienda QA:', original)

// 1. Free puede asignar vibrante y clasica (antes "Pro" en UI)
for (const t of ['vibrante', 'clasica']) {
  const r = await fetch(`${BASE}/api/stores/${SLUG}`, { method: 'PUT', headers: auth, body: JSON.stringify({ template: t }) })
  ok(r.status === 200, `free asigna ${t} -> 200 (status ${r.status})`)
}

// 2. Premium sigue bloqueada para free
const rl = await fetch(`${BASE}/api/stores/${SLUG}`, { method: 'PUT', headers: auth, body: JSON.stringify({ template: 'luxury' }) })
const jl = await rl.json().catch(() => ({}))
ok(rl.status === 403 && jl.code === 'PLAN_REQUIRED', `free NO asigna luxury -> 403 PLAN_REQUIRED (status ${rl.status}, code ${jl.code})`)

// 3. Restaurar
const rr = await fetch(`${BASE}/api/stores/${SLUG}`, { method: 'PUT', headers: auth, body: JSON.stringify({ template: original }) })
ok(rr.status === 200, `template restaurado a ${original}`)

console.log(failures === 0 ? '\nQA TODO PASS' : `\nQA CON ${failures} FALLOS`)
process.exit(failures === 0 ? 0 : 1)
