// ============================================================
// Sincroniza la tabla "Plan" de la BD con la FUENTE ÚNICA DE
// VERDAD: src/lib/plans.ts (CANONICAL_PLANS).
//
//   - Lee los planes directamente del archivo TS (nunca se
//     desincroniza de lo que dice la web).
//   - Hace upsert por `type` (free / pro / premium).
//   - Solo toca la tabla "Plan". No borra nada ni toca
//     suscripciones, pagos ni usuarios.
//
// Uso (requiere dependencias instaladas):
//   npm install
//   DATABASE_URL='postgresql://...' node --dns-result-order=ipv4first scripts/sync-plans.mjs
//
// NOTA: scripts/sync-plans-task30.mjs está OBSOLETO (texto viejo
// con marca "TiendApp"); usa siempre este.
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ── 1. Leer CANONICAL_PLANS desde src/lib/plans.ts ──
const here = path.dirname(fileURLToPath(import.meta.url))
const plansTsPath = path.resolve(here, '..', 'src', 'lib', 'plans.ts')
const src = fs.readFileSync(plansTsPath, 'utf8')

const m = src.match(/export const CANONICAL_PLANS[^=]*=\s*(\[[\s\S]*?\n\])/)
if (!m) {
  console.error('ERROR: no se encontró CANONICAL_PLANS en src/lib/plans.ts')
  process.exit(1)
}
// El fragmento es un literal de array JS puro (strings/números/booleanos)
const canonical = eval('(' + m[1] + ')')

if (!Array.isArray(canonical) || canonical.length === 0) {
  console.error('ERROR: CANONICAL_PLANS vacío o mal parseado')
  process.exit(1)
}
console.log(`Fuente: src/lib/plans.ts → ${canonical.length} planes (${canonical.map((p) => p.type).join(', ')})`)

// ── 2. Upsert en la tabla Plan (solo estas 3 filas) ──
for (const p of canonical) {
  const data = {
    type: p.type,
    name: p.name,
    price: p.price,
    currency: 'PEN',
    maxProducts: p.maxProducts,
    description: p.description,
    features: p.features,
    popular: p.popular,
  }
  const row = await db.plan.upsert({
    where: { type: p.type },
    update: data,
    create: data,
  })
  console.log(`OK [${row.type}] ${row.name} | S/${row.price} | maxProducts=${row.maxProducts} | ${JSON.parse(JSON.stringify(row.features)).length} features`)
}

// ── 3. Verificación final: lo que quedó en la BD ──
console.log('\nEstado final de la tabla Plan:')
const rows = await db.plan.findMany({ orderBy: { price: 'asc' } })
for (const r of rows) {
  const feats = Array.isArray(r.features) ? r.features : JSON.parse(r.features ?? '[]')
  const c = canonical.find((p) => p.type === r.type)
  const match = c && r.name === c.name && Number(r.price) === c.price && r.maxProducts === c.maxProducts
    && JSON.stringify(feats) === JSON.stringify(c.features) && r.popular === c.popular
  console.log(`  ${r.type.padEnd(8)} ${match ? '== canónico ✓' : '≠ canónico ✗ REVISAR'}`)
}

await db.$disconnect()
console.log('\nListo. La tabla Plan quedó sincronizada con src/lib/plans.ts.')
