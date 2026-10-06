import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiSuccess, apiError, handleCorsPreflight } from '@/lib/api-response'
import { getUserPlanType } from '@/lib/plan-gating'

// ============================================================
// NOTIFICACIONES DEL VENDEDOR (campanita del dashboard)
//   GET    /api/notifications            → lista + no leídas
//   POST   /api/notifications            → { action: 'markAllRead' }
//   PUT    /api/notifications            → { markAll: true } | { notificationId }
//   DELETE /api/notifications?id=<id>    → elimina una notificación
//
// Exclusiva de planes Pro/Premium (el plan Gratis no tiene
// notificaciones: GET devuelve planLocked y lista vacía).
// Para usuarios de pago se generan avisos automáticos "lazy"
// al consultar (deduplicados por título, ventana de 7 días):
//   - Plan por vencer (nextBillingDate dentro de 7 días)
//   - Límite de productos por alcanzarse / alcanzado
// ============================================================

const DEDUP_DAYS = 7

async function notifyOnce(userId: string, title: string, message: string, type: string, icon: string, link: string) {
  const dedup = await db.$queryRawUnsafe(
    `SELECT 1 FROM "Notification"
     WHERE title = $1 AND ("userId" = $2 OR "userId" IS NULL)
       AND "createdAt" > now() - interval '${DEDUP_DAYS} days'
     LIMIT 1`,
    title, userId
  )
  if (Array.isArray(dedup) && dedup.length > 0) return
  await db.$executeRawUnsafe(
    `INSERT INTO "Notification" (id, title, message, type, icon, link, "userId", read, "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, false, now())`,
    title, message, type, icon, link, userId
  )
}

// Avisos automáticos según estado del plan y del catálogo
async function generateAutomaticNotifications(userId: string) {
  try {
    // ── 1) Plan por vencer (próximo cobro en menos de 7 días) ──
    const expiring = await db.$queryRawUnsafe(
      `SELECT pl.name AS "planName", sub."nextBillingDate"
       FROM "Subscription" sub
       JOIN "Plan" pl ON pl.id = sub."planId"
       WHERE sub."userId" = $1 AND sub.status = 'active'
         AND sub."nextBillingDate" IS NOT NULL
         AND sub."nextBillingDate" <= now() + interval '7 days'
       ORDER BY sub."nextBillingDate" ASC LIMIT 1`,
      userId
    ) as Array<{ planName?: string; nextBillingDate?: string | Date }>

    if (Array.isArray(expiring) && expiring.length > 0 && expiring[0].planName) {
      const date = new Date(expiring[0].nextBillingDate as string | Date)
      const fecha = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit' }).format(date)
      await notifyOnce(
        userId,
        `Tu plan ${expiring[0].planName} vence el ${fecha}`,
        'Renuévalo a tiempo para no perder los beneficios de tu plan.',
        'warning',
        '⏰',
        '/dashboard/plan'
      )
    }

    // ── 2) Límite de productos (queda 1 o 0) ──
    const limits = await db.$queryRawUnsafe(
      `SELECT pl."maxProducts" AS "maxProducts", pl.name AS "planName",
              (SELECT COUNT(*)::int FROM "StoreProduct" sp
                WHERE sp."storeId" IN (SELECT s.id FROM "Store" s WHERE s."ownerId" = $1)
                  AND sp."isActive" = true) AS "used"
       FROM "Subscription" sub
       JOIN "Plan" pl ON pl.id = sub."planId"
       WHERE sub."userId" = $1 AND sub.status = 'active'
       ORDER BY sub."createdAt" DESC LIMIT 1`,
      userId
    ) as Array<{ maxProducts?: number; planName?: string; used?: number }>

    if (Array.isArray(limits) && limits.length > 0) {
      const row = limits[0]
      const max = Number(row.maxProducts)
      const used = Number(row.used ?? 0)
      if (max > 0) {
        const remaining = max - used
        if (remaining === 1) {
          await notifyOnce(
            userId,
            'Te queda 1 producto disponible',
            `Tu plan ${row.planName || ''} permite ${max} productos y ya tienes ${used}. Actualiza para no detenerte.`,
            'warning',
            '📦',
            '/dashboard/plan'
          )
        } else if (remaining <= 0) {
          await notifyOnce(
            userId,
            `Alcanzaste el límite de ${max} productos`,
            `Tu plan ${row.planName || ''} llegó a su tope. Sube de plan para agregar más productos.`,
            'warning',
            '📦',
            '/dashboard/plan'
          )
        }
      }
    }
  } catch {
    /* los avisos automáticos nunca deben romper el GET */
  }
}

// GET /api/notifications — lista del usuario + broadcast + no leídas
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (!auth.user) {
    return apiError('No autenticado', 401, undefined, request)
  }
  const userId = auth.user.userId

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '30'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0)

  try {
    // Plan Gratis: sin notificaciones (feature de planes pago)
    const planType = await getUserPlanType(userId)
    if (planType === 'free') {
      return apiSuccess({
        notifications: [],
        unreadCount: 0,
        total: 0,
        unread: 0,
        planLocked: true,
      }, 200, request)
    }

    await generateAutomaticNotifications(userId)

    const rows = await db.$queryRawUnsafe(
      `SELECT id, title, message, type, icon, link, read, "createdAt"
       FROM "Notification"
       WHERE "userId" = $1 OR "userId" IS NULL
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
      userId, limit, offset
    ) as Array<Record<string, unknown>>

    const unreadRow = await db.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS unread FROM "Notification"
       WHERE ("userId" = $1 OR "userId" IS NULL) AND read = false`,
      userId
    ) as Array<{ unread?: number }>

    const unread = Number(unreadRow?.[0]?.unread ?? 0)

    return apiSuccess({
      notifications: rows,
      unreadCount: unread, // compat con consumidores previos
      total: rows.length,
      unread,               // clave nueva (campanita)
      planLocked: false,
    }, 200, request)
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error al obtener notificaciones', 500, undefined, request)
  }
}

// POST /api/notifications — marcar todas como leídas (campanita)
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.user) {
      return apiError('No autenticado', 401, undefined, request)
    }
    const body = await request.json().catch(() => ({})) as { action?: string }
    if (body.action !== 'markAllRead') {
      return apiError('Acción no válida', 400, undefined, request)
    }
    await db.$executeRawUnsafe(
      `UPDATE "Notification" SET read = true
       WHERE read = false AND ("userId" = $1 OR "userId" IS NULL)`,
      auth.user.userId
    )
    return apiSuccess({ ok: true }, 200, request)
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error al actualizar notificaciones', 500, undefined, request)
  }
}

// PUT /api/notifications — marcar como leídas (compat: markAll | notificationId)
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.user) {
      return apiError('No autenticado', 401, undefined, request)
    }
    const body = await request.json().catch(() => ({})) as { notificationId?: string; markAll?: boolean }

    if (body.markAll) {
      await db.$executeRawUnsafe(
        `UPDATE "Notification" SET read = true
         WHERE read = false AND ("userId" = $1 OR "userId" IS NULL)`,
        auth.user.userId
      )
      return apiSuccess({ message: 'Todas las notificaciones marcadas como leidas' }, 200, request)
    }

    if (body.notificationId) {
      const rows = await db.$queryRawUnsafe(
        `SELECT "userId" FROM "Notification" WHERE id = $1 LIMIT 1`,
        body.notificationId
      ) as Array<{ userId: string | null }>
      if (!Array.isArray(rows) || rows.length === 0) {
        return apiError('Notificacion no encontrada', 404, undefined, request)
      }
      if (rows[0].userId && rows[0].userId !== auth.user.userId) {
        return apiError('No autorizado', 403, undefined, request)
      }
      await db.$executeRawUnsafe(
        `UPDATE "Notification" SET read = true WHERE id = $1`,
        body.notificationId
      )
      return apiSuccess({ message: 'Notificacion marcada como leida' }, 200, request)
    }

    return apiError('Debe especificar notificationId o markAll', 400, undefined, request)
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error al actualizar notificaciones', 500, undefined, request)
  }
}

// DELETE /api/notifications?id=<id> — eliminar una notificación
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.user) {
      return apiError('No autenticado', 401, undefined, request)
    }
    const url = new URL(request.url)
    const notificationId = url.searchParams.get('id')
    if (!notificationId) {
      return apiError('ID de notificacion requerido', 400, undefined, request)
    }
    // Solo propia o broadcast
    await db.$executeRawUnsafe(
      `DELETE FROM "Notification"
       WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)`,
      notificationId, auth.user.userId
    )
    return apiSuccess({ message: 'Notificacion eliminada' }, 200, request)
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] DELETE error:', error instanceof Error ? error.message : String(error))
    return apiError('Error al eliminar notificacion', 500, undefined, request)
  }
}

// OPTIONS /api/notifications - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
