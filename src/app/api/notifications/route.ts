import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// GET /api/notifications - Get notifications for the current user
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  try {
    // Get notifications for this user + broadcasts (userId = null)
    const notifications = await db.notification.findMany({
      where: {
        OR: [
          { userId: auth.user.userId },
          { userId: null }, // Broadcast notifications
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        OR: [
          { userId: auth.user.userId },
          { userId: null },
        ],
        read: false,
      },
    })

    return apiSuccess({
      notifications,
      unreadCount,
      total: notifications.length,
    }, 200, request)
  } catch (err) {
    console.error('[NOTIFICATIONS] Error fetching:', err)
    return apiError('Error al obtener notificaciones', 500, undefined, request)
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const { notificationId, markAll } = body as { notificationId?: string; markAll?: boolean }

    if (markAll) {
      // Mark all as read for this user
      await db.notification.updateMany({
        where: {
          OR: [
            { userId: auth.user.userId },
            { userId: null },
          ],
          read: false,
        },
        data: { read: true },
      })
      return apiSuccess({ message: 'Todas las notificaciones marcadas como leidas' }, 200, request)
    }

    if (notificationId) {
      // Mark specific notification as read
      const notif = await db.notification.findUnique({ where: { id: notificationId } })
      if (!notif) {
        return apiError('Notificacion no encontrada', 404, undefined, request)
      }
      // Verify the notification belongs to this user or is a broadcast
      if (notif.userId && notif.userId !== auth.user.userId) {
        return apiError('No autorizado', 403, undefined, request)
      }
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true },
      })
      return apiSuccess({ message: 'Notificacion marcada como leida' }, 200, request)
    }

    return apiError('Debe especificar notificationId o markAll', 400, undefined, request)
  } catch (err) {
    console.error('[NOTIFICATIONS] Error updating:', err)
    return apiError('Error al actualizar notificaciones', 500, undefined, request)
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const url = new URL(request.url)
    const notificationId = url.searchParams.get('id')

    if (!notificationId) {
      return apiError('ID de notificacion requerido', 400, undefined, request)
    }

    await db.notification.delete({
      where: { id: notificationId },
    })

    return apiSuccess({ message: 'Notificacion eliminada' }, 200, request)
  } catch (err) {
    console.error('[NOTIFICATIONS] Error deleting:', err)
    return apiError('Error al eliminar notificacion', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
