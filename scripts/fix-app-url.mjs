// Centraliza la URL canonica: APP_URL desde @/lib/env con guardia contra dominios muertos.
// Reemplaza process.env.NEXT_PUBLIC_APP_URL || 'https://kyllari.com' -> APP_URL
// y agrega el import en cada archivo modificado.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join, extname } from 'path'

const ROOT = process.cwd()
const PATTERNS = [
  "process.env.NEXT_PUBLIC_APP_URL || 'https://kyllari.com'",
  'process.env.NEXT_PUBLIC_APP_URL || "https://kyllari.com"',
]
const IMPORT_LINE = "import { APP_URL } from '@/lib/env'\n"
const SKIP = ['src/lib/env.ts', 'src/app/api/health/route.ts']

function walk(dir, acc) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (['.ts', '.tsx'].includes(extname(e))) acc.push(full)
  }
  return acc
}

const files = walk(join(ROOT, 'src'), [])
let touched = 0
for (const file of files) {
  const rel = file.replace(ROOT + '/', '')
  if (SKIP.includes(rel)) continue
  let src = readFileSync(file, 'utf8')
  if (!src.includes('NEXT_PUBLIC_APP_URL')) continue
  let n = 0
  for (const p of PATTERNS) {
    n += src.split(p).length - 1
    src = src.split(p).join('APP_URL')
  }
  if (n > 0) {
    if (!src.includes("from '@/lib/env'")) {
      src = IMPORT_LINE + src
    }
    writeFileSync(file, src)
    touched++
    console.log(`✏️  ${rel}: ${n} uso(s) -> APP_URL`)
  }
}
console.log(`\n${touched} archivos actualizados`)
