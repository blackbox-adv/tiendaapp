// Task 30: sincronizar BD de producción con los nuevos planes
//   - Gratis 6 productos (antes 5)
//   - Pro 50 productos (antes 20)
//   - Premium -1 = ILIMITADO (antes 100)
//   - features actualizadas (dominio 'muy pronto', notificaciones, popup)
//   - Asegura tabla "Notification" (campanita del dashboard)
// Uso:
//   DATABASE_URL='postgresql://...' node --dns-result-order=ipv4first scripts/sync-plans-task30.mjs
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const FEATURES = {
  free: [
    'Hasta 6 productos',
    '1 tienda online',
    '1 plantilla básica (Moderna)',
    'Botón de WhatsApp',
    'Reportes básicos de visitas en tu panel',
    'Badge "Creado con TiendApp"',
    'Soporte por email',
  ],
  pro: [
    'Hasta 50 productos',
    '1 tienda online',
    '3 plantillas base',
    'Packs y combos con descuento',
    'Importa y exporta tu catálogo (Excel/Sheets)',
    'Reportes de ventas en Excel',
    'Buscador de productos',
    'Popup de ofertas y banner de anuncios',
    'Notificaciones en tu panel',
    'Dominio personalizado (muy pronto)',
    'Estadísticas avanzadas',
    'Sin badge TiendApp',
    'Copys y descripciones con IA (muy pronto)',
    'Soporte prioritario',
  ],
  premium: [
    'Productos ilimitados',
    'Hasta 3 tiendas',
    'Las 21 plantillas (un diseño por rubro)',
    'Packs y combos con descuento',
    'Importa y exporta tu catálogo (Excel/Sheets)',
    'Reportes de ventas en Excel',
    'Buscador y filtros avanzados',
    'Popup de ofertas y banner de anuncios',
    'Landing IA para tus lanzamientos',
    'Notificaciones en tu panel',
    'Copys y descripciones con IA (muy pronto)',
    'Dominio personalizado (muy pronto)',
    'Tarjeta de marca al compartir en WhatsApp',
    'Sin marca TiendApp',
    'Soporte 24/7',
  ],
}

const LIMITS = { free: 6, pro: 50, premium: -1 }
const DESCRIPTIONS = {
  free: 'Perfecto para comenzar',
  pro: 'Para tiendas en crecimiento',
  premium: 'Para negocios establecidos',
}

async function main() {
  console.log('── Antes ──')
  const before = await db.$queryRawUnsafe(`SELECT type, "maxProducts", price FROM "Plan" ORDER BY price ASC`)
  console.log(JSON.stringify(before, null, 2))

  // 1) Tabla Notification (campanita)
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Notification" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      icon TEXT NOT NULL DEFAULT 'bell',
      link TEXT,
      "userId" TEXT,
      read BOOLEAN NOT NULL DEFAULT false,
      "senderId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", read)`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC)`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt" DESC)`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification"(type)`)
  console.log('✔ Tabla "Notification" verificada')

  // 2) Planes: límites + features + descripción
  for (const type of ['free', 'pro', 'premium']) {
    await db.$executeRawUnsafe(
      `UPDATE "Plan" SET "maxProducts" = $1, features = $2::jsonb, description = $3, "updatedAt" = now() WHERE type = $4`,
      LIMITS[type], JSON.stringify(FEATURES[type]), DESCRIPTIONS[type], type
    )
  }
  console.log('✔ Planes actualizados (6 / 50 / -1 ilimitado)')

  console.log('── Después ──')
  const after = await db.$queryRawUnsafe(`SELECT type, "maxProducts", description FROM "Plan" ORDER BY price ASC`)
  console.log(JSON.stringify(after, null, 2))
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1) }).finally(() => db.$disconnect())
