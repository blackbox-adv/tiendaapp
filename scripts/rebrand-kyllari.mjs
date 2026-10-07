// Rebrand TiendApp -> Kyllari (solo capa visual/copy, sin tocar BD ni claves internas)
// Protegido (NO se reemplaza): tiendapp_token, tiendapp_user, tiendapp_ab*,
// admin@tiendapp.com, demo@tiendapp.pe  — claves de sesión/A-B y cuentas internas.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join, extname } from 'path'

const ROOT = process.cwd()
const DIRS = ['src']
const EXTRA_FILES = ['package.json']

const RULES = [
  // 1. Firma de emails (antes del reemplazo genérico)
  { from: 'Enviado por TiendApp - BlackboxPeru', to: 'Enviado por Kyllari' },
  // 2. Marca visible
  { from: 'TiendApp', to: 'Kyllari' },
  // 3. Dominios (fallbacks de código -> nuevo dominio canónico)
  { from: 'https://tienda.blackboxperu.com', to: 'https://kyllari.com' },
  { from: 'tienda.blackboxperu.com', to: 'kyllari.com' },
  // 4. Contacto real (aprobado por el dueño)
  { from: 'hola@tiendapp.pe', to: 'contacto@kyllari.com' },
  { from: '+51999888777', to: '+51958297236' },
  { from: '+51999999999', to: '+51958297236' },
]

const PROTECTED = [
  'tiendapp_token',
  'tiendapp_user',
  'tiendapp_ab',
  'admin@tiendapp.com',
  'demo@tiendapp.pe',
]

const EXT_OK = new Set(['.ts', '.tsx'])
const changed = []
let totalReplacements = 0

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full)
    else if (EXT_OK.has(extname(entry))) changed.push(full)
  }
}
for (const d of DIRS) walk(join(ROOT, d))
for (const f of EXTRA_FILES) changed.push(join(ROOT, f))

const perRule = RULES.map(() => 0)
const skippedLines = []

for (const file of changed) {
  const original = readFileSync(file, 'utf8')
  const lines = original.split('\n')
  let fileTouched = 0

  const out = lines.map((line) => {
    if (PROTECTED.some((p) => line.includes(p))) {
      // línea protegida: solo se permiten reglas de dominio/ marca si no toca lo protegido
      let l = line
      RULES.forEach((r, i) => {
        // en líneas protegidas solo aplicamos dominio y contacto, nunca la regla de marca genérica
        if (r.from === 'https://tienda.blackboxperu.com' || r.from === 'tienda.blackboxperu.com' ||
            r.from === 'hola@tiendapp.pe' || r.from === '+51999888777' || r.from === '+51999999999') {
          if (l.includes(r.from)) { perRule[i] += l.split(r.from).length - 1; fileTouched += l.split(r.from).length - 1; l = l.split(r.from).join(r.to) }
        }
      })
      return l
    }
    let l = line
    RULES.forEach((r, i) => {
      if (l.includes(r.from)) {
        const n = l.split(r.from).length - 1
        perRule[i] += n
        fileTouched += n
        l = l.split(r.from).join(r.to)
      }
    })
    return l
  })

  if (fileTouched > 0) {
    writeFileSync(file, out.join('\n'))
    totalReplacements += fileTouched
    console.log(`✏️  ${file.replace(ROOT + '/', '')}: ${fileTouched} reemplazo(s)`)
  }
}

console.log('\n=== RESUMEN ===')
RULES.forEach((r, i) => console.log(`${perRule[i]}\t"${r.from}" -> "${r.to}"`))
console.log(`TOTAL: ${totalReplacements} reemplazos en ${changed.length} archivos escaneados`)

// Package name aparte (identificador npm, seguro renombrar)
const pkgPath = join(ROOT, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
if (pkg.name === 'tiendapp') {
  pkg.name = 'kyllari'
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('📦 package.json name: tiendapp -> kyllari')
}
