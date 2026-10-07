import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { apiError, apiSuccess } from '@/lib/api-response'
import { getUserPlanType } from '@/lib/plan-gating'

// ============================================================
// Chat publico del cliente (visitante de la tienda).
// POST /api/chat   — enviar mensaje { storeSlug, threadId?, name, body }
// GET  /api/chat?storeSlug=&thread=&since= — leer mi hilo (polling)
//
// Escalabilidad: sin Realtime ni websockets — polling de consultas
// indexadas (storeId+threadId+createdAt). threadId es un UUID que vive
// en el localStorage del visitante y actua como capability token.
// ============================================================

const MAX_BODY = 1000
const MAX_NAME = 60

// Rate limit ligero en memoria (por instancia serverless; disuade abuso)
const rateBuckets = new Map<string, number[]>()
function rateLimited(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const arr = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs)
  if (arr.length >= limit) return true
  arr.push(now)
  rateBuckets.set(key, arr)
  return false
}

function validThreadId(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

async function getPremiumStore(storeSlug: unknown) {
  if (typeof storeSlug !== 'string' || !/^[a-z0-9-]{1,80}$/.test(storeSlug)) return null
  const store = await db.store.findUnique({
    where: { slug: storeSlug },
    select: { id: true, name: true, isActive: true, ownerId: true },
  })
  if (!store || !store.isActive) return null
  const plan = await getUserPlanType(store.ownerId)
  if (plan !== 'premium') return null
  return store
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return apiError('Datos invalidos', 400, undefined, request)

    const store = await getPremiumStore((body as Record<string, unknown>).storeSlug)
    if (!store) return apiError('Chat no disponible', 404, undefined, request)

    const name = String((body as Record<string, unknown>).name || '').trim().slice(0, MAX_NAME)
    const text = String((body as Record<string, unknown>).body || '').trim()
    if (name.length < 2) return apiError('Tu nombre es requerido', 400, undefined, request)
    if (!text || text.length > MAX_BODY) return apiError('Mensaje invalido (max 1000 caracteres)', 400, undefined, request)

    let threadId: string = typeof (body as Record<string, unknown>).threadId === 'string'
      ? String((body as Record<string, unknown>).threadId)
      : ''
    if (!validThreadId(threadId)) {
      threadId = crypto.randomUUID()
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (rateLimited(`${ip}:${threadId}`)) {
      return apiError('Demasiados mensajes, espera un momento', 429, undefined, request)
    }

    const message = await db.chatMessage.create({
      data: {
        storeId: store.id,
        threadId,
        sender: 'customer',
        authorName: name,
        body: text,
        readByCustomer: true,
      },
      select: { id: true, threadId: true, sender: true, authorName: true, body: true, createdAt: true },
    })

    return apiSuccess(message, 201, request)
  } catch (error) {
    console.error('Chat POST error:', error)
    return apiError('Error al enviar mensaje', 500, undefined, request)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const store = await getPremiumStore(searchParams.get('storeSlug'))
    if (!store) return apiError('Chat no disponible', 404, undefined, request)

    const thread = searchParams.get('thread')
    if (!validThreadId(thread)) return apiError('Hilo invalido', 400, undefined, request)
    const since = searchParams.get('since') // ISO date opcional

    const where: Record<string, unknown> = { storeId: store.id, threadId: thread }
    if (since) {
      const d = new Date(since)
      if (!isNaN(d.getTime())) where.createdAt = { gt: d }
    }

    const messages = await db.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 200,
      select: {
        id: true, threadId: true, sender: true, authorName: true,
        authorWhatsapp: true, body: true, createdAt: true,
      },
    })

    // El cliente ya vio las respuestas de la tienda
    await db.chatMessage.updateMany({
      where: { storeId: store.id, threadId: thread, sender: 'store', readByCustomer: false },
      data: { readByCustomer: true },
    })

    return apiSuccess({ storeName: store.name, messages }, 200, request)
  } catch (error) {
    console.error('Chat GET error:', error)
    return apiError('Error al cargar mensajes', 500, undefined, request)
  }
}
