import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { serializeDecimals } from '@/lib/utils'

// ── GET /api/orders/[id] — Get single order (auth required, store ownership) ──
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request)
    }

    const { id } = await params
    const order = await db.storeOrder.findUnique({ where: { id } })

    if (!order) {
      return apiError('Pedido no encontrado', 404, undefined, request)
    }

    // Verify store ownership
    const store = await db.store.findUnique({
      where: { id: order.storeId },
      select: { ownerId: true },
    })
    if (!store || (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin')) {
      return apiError('No tienes permisos para ver este pedido', 403, undefined, request)
    }

    return apiSuccess(serializeDecimals(order), 200, request)
  } catch (error) {
    console.error('Get order error:', error)
    return apiError('Error al obtener pedido', 500, undefined, request)
  }
}

// ── PUT /api/orders/[id] — Update order status (auth required, store ownership) ──
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request)
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['confirmed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return apiError('status debe ser "confirmed" o "cancelled"', 400, undefined, request)
    }

    // Find the order
    const order = await db.storeOrder.findUnique({ where: { id } })
    if (!order) {
      return apiError('Pedido no encontrado', 404, undefined, request)
    }

    // Verify store ownership
    const store = await db.store.findUnique({
      where: { id: order.storeId },
      select: { ownerId: true },
    })
    if (!store || (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin')) {
      return apiError('No tienes permisos para actualizar este pedido', 403, undefined, request)
    }

    // Prevent updating already cancelled orders
    if (order.status === 'cancelled') {
      return apiError('No se puede actualizar un pedido cancelado', 400, undefined, request)
    }

    // Update the order
    const updatedOrder = await db.storeOrder.update({
      where: { id },
      data: { status },
    })

    return apiSuccess(serializeDecimals(updatedOrder), 200, request)
  } catch (error) {
    console.error('Update order error:', error)
    return apiError('Error al actualizar pedido', 500, undefined, request)
  }
}
