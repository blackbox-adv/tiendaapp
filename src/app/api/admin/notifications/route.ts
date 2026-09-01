import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/admin/notifications - Send notification (super_admin only)
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
  }

  try {
    const body = await request.json()
    const { title, message, type, icon, link, userId, sendToAll } = body as {
      title: string
      message: string
      type?: string
      icon?: string
      link?: string
      userId?: string
      sendToAll?: boolean
    }

    if (!title || !message) {
      return apiError('Titulo y mensaje son requeridos', 400, undefined, request)
    }

    const validTypes = ['info', 'success', 'warning', 'promo', 'system']
    const notifType = validTypes.includes(type || '') ? type : 'info'

    if (sendToAll) {
      // Broadcast to all users (userId = null means all users can see it)
      const notification = await db.notification.create({
        data: {
          title,
          message,
          type: notifType!,
          icon: icon || 'bell',
          link: link || null,
          userId: null, // null = broadcast
          senderId: auth.user.userId,
        },
      })

      return apiSuccess({
        notification,
        broadcast: true,
        message: 'Notificacion enviada a todos los usuarios',
      }, 201, request)
    } else if (userId) {
      // Send to specific user
      const targetUser = await db.user.findUnique({ where: { id: userId } })
      if (!targetUser) {
        return apiError('Usuario no encontrado', 404, undefined, request)
      }

      const notification = await db.notification.create({
        data: {
          title,
          message,
          type: notifType!,
          icon: icon || 'bell',
          link: link || null,
          userId,
          senderId: auth.user.userId,
        },
      })

      return apiSuccess({
        notification,
        broadcast: false,
        message: `Notificacion enviada a ${targetUser.name}`,
      }, 201, request)
    } else {
      return apiError('Debe especificar userId o sendToAll', 400, undefined, request)
    }
  } catch (err) {
    console.error('[ADMIN/NOTIFICATIONS] Error creating:', err)
    return apiError('Error al crear notificacion', 500, undefined, request)
  }
}

// GET /api/admin/notifications - List all sent notifications (super_admin only)
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
  }

  try {
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    const stats = {
      total: await db.notification.count(),
      broadcast: await db.notification.count({ where: { userId: null } }),
      unread: await db.notification.count({ where: { read: false } }),
    }

    return apiSuccess({ notifications, stats }, 200, request)
  } catch (err) {
    console.error('[ADMIN/NOTIFICATIONS] Error listing:', err)
    return apiError('Error al obtener notificaciones', 500, undefined, request)
  }
}

// DELETE /api/admin/notifications - Delete a notification
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
  }

  try {
    const url = new URL(request.url)
    const notificationId = url.searchParams.get('id')

    if (!notificationId) {
      return apiError('ID de notificacion requerido', 400, undefined, request)
    }

    await db.notification.delete({ where: { id: notificationId } })

    return apiSuccess({ message: 'Notificacion eliminada' }, 200, request)
  } catch (err) {
    console.error('[ADMIN/NOTIFICATIONS] Error deleting:', err)
    return apiError('Error al eliminar notificacion', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
