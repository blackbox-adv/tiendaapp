import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { getUserPlanType } from '@/lib/plan-gating'
import { resolveStoreForUser } from '@/lib/store-access'

// ============================================================
// Bandeja de chat de la tienda (dueno + empleados, Premium).
// GET  /api/chats               — lista de hilos (ultimo msg + no leidos)
// GET  /api/chats?thread=<id>   — mensajes del hilo (marca leidos)
// POST /api/chats { threadId, body } — responder como tienda
// ============================================================

const MAX_BODY = 1000

interface ChatCtx {
  ok: boolean
  response?: NextResponse
  userId?: string
  storeId?: string
  storeName?: string
  isOwner?: boolean
  authorWhatsapp?: string | null
}

async function requireChatAccess(request: NextRequest): Promise<ChatCtx> {
  const auth = await authenticateRequest(request)
  if (auth.error || !auth.user) {
    return { ok: false, response: apiError(auth.error || 'No autorizado', 401, undefined, request) }
  }
  const access = await resolveStoreForUser(auth.user.userId, auth.user.role)
  if (!access) {
    return { ok: false, response: apiError('No tienes una tienda asignada', 403, undefined, request) }
  }
  const plan = await getUserPlanType(access.ownerId)
  if (plan !== 'premium') {
    return { ok: false, response: apiError('El chat esta disponible en el plan Premium.', 403, undefined, request) }
  }
  // WhatsApp del autor: dueno usa el de la tienda; empleado el suyo
  let authorWhatsapp: string | null = null
  if (access.isOwner) {
    const st = await db.store.findUnique({ where: { id: access.storeId }, select: { whatsappNumber: true } })
    authorWhatsapp = st?.whatsappNumber || null
  } else {
    const member = await db.storeMember.findFirst({
      where: { userId: auth.user.userId, isActive: true },
      select: { whatsappNumber: true },
    })
    authorWhatsapp = member?.whatsappNumber || null
  }
  return { ok: true, userId: auth.user.userId, storeId: access.storeId, storeName: access.storeName, isOwner: access.isOwner, authorWhatsapp }
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireChatAccess(request)
    if (!ctx.ok || !ctx.storeId) return ctx.response!

    const { searchParams } = new URL(request.url)
    const thread = searchParams.get('thread')

    if (thread) {
      // Marcar como leidos los mensajes del cliente
      await db.chatMessage.updateMany({
        where: { storeId: ctx.storeId, threadId: thread, sender: 'customer', readByStore: false },
        data: { readByStore: true },
      })
      const messages = await db.chatMessage.findMany({
        where: { storeId: ctx.storeId, threadId: thread },
        orderBy: { createdAt: 'asc' },
        take: 200,
      })
      return apiSuccess({ messages }, 200, request)
    }

    // Lista de hilos: agrupado por threadId
    const groups = await db.chatMessage.groupBy({
      by: ['threadId'],
      where: { storeId: ctx.storeId },
      _max: { createdAt: true },
      _count: { _all: true },
    })

    const unreadGroups = await db.chatMessage.groupBy({
      by: ['threadId'],
      where: { storeId: ctx.storeId, sender: 'customer', readByStore: false },
      _count: { _all: true },
    })
    const unreadMap = new Map(unreadGroups.map((g) => [g.threadId, g._count._all]))

    const ids = groups.map((g) => g.threadId)
    if (ids.length === 0) return apiSuccess({ threads: [], totalUnread: 0 }, 200, request)

    const msgs = await db.chatMessage.findMany({
      where: { storeId: ctx.storeId, threadId: { in: ids } },
      orderBy: { createdAt: 'asc' },
    })

    const byThread = new Map<string, typeof msgs>()
    for (const m of msgs) {
      const arr = byThread.get(m.threadId) || []
      arr.push(m)
      byThread.set(m.threadId, arr)
    }

    const threads = groups
      .map((g) => {
        const arr = byThread.get(g.threadId) || []
        const firstCustomer = arr.find((m) => m.sender === 'customer')
        const last = arr[arr.length - 1]
        return {
          threadId: g.threadId,
          customerName: firstCustomer?.authorName || 'Cliente',
          lastMessage: last?.body || '',
          lastSender: last?.sender || 'customer',
          lastAt: last?.createdAt || g._max.createdAt,
          messageCount: arr.length,
          unread: unreadMap.get(g.threadId) || 0,
        }
      })
      .sort((a, b) => new Date(b.lastAt as Date).getTime() - new Date(a.lastAt as Date).getTime())
      .slice(0, 100)

    const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0)
    return apiSuccess({ threads, totalUnread }, 200, request)
  } catch (error) {
    console.error('Chats GET error:', error)
    return apiError('Error al cargar conversaciones', 500, undefined, request)
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireChatAccess(request)
    if (!ctx.ok || !ctx.storeId || !ctx.userId) return ctx.response!

    const body = await request.json().catch(() => null)
    const threadId = (body as Record<string, unknown>)?.threadId
    const text = String((body as Record<string, unknown>)?.body || '').trim()
    if (typeof threadId !== 'string' || !/^[0-9a-f-]{36}$/i.test(threadId)) {
      return apiError('Hilo invalido', 400, undefined, request)
    }
    if (!text || text.length > MAX_BODY) {
      return apiError('Mensaje invalido (max 1000 caracteres)', 400, undefined, request)
    }

    // El hilo debe existir en esta tienda (los hilos nacen del cliente)
    const exists = await db.chatMessage.findFirst({
      where: { storeId: ctx.storeId, threadId },
      select: { id: true },
    })
    if (!exists) return apiError('Conversacion no encontrada', 404, undefined, request)

    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      select: { name: true },
    })

    const message = await db.chatMessage.create({
      data: {
        storeId: ctx.storeId,
        threadId,
        sender: 'store',
        authorName: user?.name || ctx.storeName || 'Tienda',
        authorWhatsapp: ctx.authorWhatsapp,
        body: text,
        readByStore: true,
      },
    })

    return apiSuccess({
      id: message.id, threadId: message.threadId, sender: message.sender,
      authorName: message.authorName, authorWhatsapp: message.authorWhatsapp,
      body: message.body, createdAt: message.createdAt,
    }, 201, request)
  } catch (error) {
    console.error('Chats POST error:', error)
    return apiError('Error al enviar respuesta', 500, undefined, request)
  }
}
