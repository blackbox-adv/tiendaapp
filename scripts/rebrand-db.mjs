// Actualiza PlatformSetting en producción (Supabase) — aprobado por el dueño:
// contacto@kyllari.com / +51958297236 / marca Kyllari.
// NO toca tiendas reales ni números por-tienda.
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const before = await db.platformSetting.findMany()
  console.log('=== PlatformSetting ANTES ===')
  before.forEach((r) => console.log(`  ${r.key} = ${JSON.stringify(r.value)}`))

  const res = {}
  res.email = await db.platformSetting.updateMany({
    where: { key: 'contactEmail', value: { contains: 'tiendapp' } },
    data: { value: 'contacto@kyllari.com' },
  })
  res.phone = await db.platformSetting.updateMany({
    where: { key: { in: ['contactPhone', 'whatsappSupport'] }, value: { in: ['+51999888777', '51999888777', '+51999999999', '51999999999'] } },
    data: { value: '+51958297236' },
  })
  res.name = await db.platformSetting.updateMany({
    where: { key: 'name', value: 'TiendApp' },
    data: { value: 'Kyllari' },
  })

  // Limpieza genérica de cualquier otra fila con marca/dominio viejo
  let generic = 0
  const all = await db.platformSetting.findMany()
  for (const r of all) {
    const nv = r.value
      .replaceAll('TiendApp', 'Kyllari')
      .replaceAll('tiendapp.pe', 'kyllari.com')
      .replaceAll('tienda.blackboxperu.com', 'kyllari.com')
    if (nv !== r.value) {
      await db.platformSetting.update({ where: { id: r.id }, data: { value: nv } })
      generic++
    }
  }
  console.log(`\ncontactEmail: ${res.email.count} fila(s), telefono: ${res.phone.count} fila(s), nombre: ${res.name.count} fila(s), limpieza extra: ${generic}`)

  // Verificar tiendas demo con contactos viejos (solo reporte, no se tocan)
  const demoOld = await db.$queryRaw`
    SELECT slug, name, "whatsappNumber" FROM "Store"
    WHERE "isDemo" = true AND "whatsappNumber" IS NOT NULL
      AND "whatsappNumber" IN ('51999888777','999999999','+51999888777','51999999999','+51999999999')
    LIMIT 30`
  console.log(`\n=== Tiendas DEMO con numero placeholder (REPORTADOS, sin tocar): ${demoOld.length} ===`)
  demoOld.forEach((s) => console.log(`  ${s.slug} (${s.name}): ${s.whatsappNumber}`))

  const after = await db.platformSetting.findMany()
  console.log('\n=== PlatformSetting DESPUES ===')
  after.forEach((r) => console.log(`  ${r.key} = ${JSON.stringify(r.value)}`))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
