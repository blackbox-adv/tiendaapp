import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'

// ── Franja de anuncio de la tienda (banner) ──
// Se guarda en columnas "announcementText"/"announcementLink" de Store
// vía SQL crudo: si la migración aún no se aplicó, responde DB_NOT_READY
// sin romper nada. Escribir null en el texto = ocultar la franja.

async function resolveOwnStore(userId: string, role: string, slug?: string) {
  if (slug) {
    const store = await db.store.findUnique({ where: { slug } })
    if (!store) return { error: 'Tienda no encontrada', status: 404 as const }
    if (store.ownerId !== userId && role !== 'super_admin') {
      return { error: 'No tienes permisos sobre esta tienda', status: 403 as const }
    }
    return { store }
  }
  const store = await db.store.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
  })
  if (!store) return { error: 'Primero crea tu tienda', status: 404 as const }
  return { store }
}

async function readAnnouncement(storeId: string): Promise<{ text: string | null; link: string | null }> {
  try {
    const rows = await db.$queryRawUnsafe(
      `SELECT "announcementText", "announcementLink" FROM "Store" WHERE id = $1 LIMIT 1`,
      storeId
    ) as Array<{ announcementText?: string | null; announcementLink?: string | null }>
    return {
      text: rows?.[0]?.announcementText ?? null,
      link: rows?.[0]?.announcementLink ?? null,
    }
  } catch {
    return { text: null, link: null }
  }
}

async function writeAnnouncement(storeId: string, text: string | null, link: string | null): Promise<boolean> {
  try {
    await db.$executeRawUnsafe(
      `UPDATE "Store" SET "announcementText" = $1, "announcementLink" = $2 WHERE id = $3`,
      text,
      text === null ? null : link,
      storeId
    )
    return true
  } catch (e) {
    console.error('[store-announcement] write failed:', (e as Error).message?.slice(0, 200))
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const slug = request.nextUrl.searchParams.get('slug') || undefined
    const resolved = await resolveOwnStore(auth.user.userId, auth.user.role, slug)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }
    const data = await readAnnouncement(resolved.store.id)
    return NextResponse.json(data)
  } catch (e) {
    console.error('[store-announcement] GET error:', (e as Error).message?.slice(0, 200))
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const body = (await request.json().catch(() => ({}))) as {
      slug?: string
      text?: string
      link?: string
    }
    const resolved = await resolveOwnStore(auth.user.userId, auth.user.role, body.slug)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const text = String(body.text || '').trim().slice(0, 90)
    let link = String(body.link || '').trim().slice(0, 300)
    if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`
    if (link && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(link)) {
      return NextResponse.json({ error: 'El enlace no es válido' }, { status: 400 })
    }

    const saved = await writeAnnouncement(resolved.store.id, text || null, text ? link || null : null)
    if (!saved) {
      return NextResponse.json(
        { error: 'Aún no se puede guardar el aviso (configuración de base de datos en curso).', code: 'DB_NOT_READY' },
        { status: 503 }
      )
    }
    return NextResponse.json({ text: text || null, link: text ? link || null : null })
  } catch (e) {
    console.error('[store-announcement] POST error:', (e as Error).message?.slice(0, 200))
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
