// QA guía de tallas + envío payFirst: setup | verify | cleanup
const BASE = 'https://kyllari.com'
const EMAIL = 'qa.recorrido.2026@tiendapp-test.com'
const PASS = 'QaRecorrido2026!'
const SLUG = 'qa-recorrido-test'

async function main() {
  const mode = process.argv[2] || 'setup'
  const loginRes = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  })
  if (!loginRes.ok) throw new Error('login falló: ' + loginRes.status)
  const { token } = await loginRes.json()
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  if (mode === 'setup') {
    const userRes = await fetch(`${BASE}/api/user`, { headers })
    const user = await userRes.json()
    const store = user.stores?.[0]
    console.log('[fix /api/user] yape:', store?.yapeNumber, '| shippingOptions:', JSON.stringify(store?.shippingOptions))
    console.log('[fix /api/user] otherPayments:', JSON.stringify(store?.otherPayments), '| sizeGuide:', JSON.stringify(store?.sizeGuide))
    const put = await fetch(`${BASE}/api/stores/${SLUG}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        shippingOptions: [
          { label: 'QA Delivery centro', price: 5, time: '24h', payFirst: true },
          { label: 'QA Recojo en tienda', price: null, time: '' },
        ],
        sizeGuide: {
          enabled: true,
          type: 'polo',
          rows: [
            { size: 'S', a: '46', b: '68', c: '20' },
            { size: 'M', a: '50', b: '70', c: '21' },
            { size: 'L', a: '54', b: '72', c: '22' },
          ],
          note: 'QA: medidas en cm, tolerancia ±2cm',
        },
      }),
    })
    const body = await put.json().catch(() => ({}))
    console.log('PUT setup:', put.status, JSON.stringify(body).slice(0, 200))
  } else if (mode === 'verify') {
    const pub = await fetch(`${BASE}/api/stores?slug=${SLUG}`)
    const data = await pub.json()
    console.log('[público] sizeGuide:', JSON.stringify(data.sizeGuide))
    console.log('[público] shippingOptions:', JSON.stringify(data.shippingOptions))
  } else if (mode === 'cleanup') {
    const orig = process.env.QA_ORIG_SHIPPING || '[]'
    const put = await fetch(`${BASE}/api/stores/${SLUG}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ shippingOptions: JSON.parse(orig), sizeGuide: { enabled: false } }),
    })
    console.log('PUT cleanup:', put.status)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
