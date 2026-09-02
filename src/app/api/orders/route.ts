import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { serializeDecimals } from '@/lib/utils'

// ── GET /api/orders — List orders for a store (auth required, store ownership) ──
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request)
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status') // optional filter

    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request)
    }

    // Verify store ownership
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })
    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permisos para esta tienda', 403, undefined, request)
    }

    // Build where clause
    const where: Record<string, unknown> = { storeId }
    if (status) {
      where.status = status
    }

    const orders = await db.storeOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return apiSuccess(serializeDecimals(orders), 200, request)
  } catch (error) {
    console.error('Get orders error:', error)
    return apiError('Error al obtener pedidos', 500, undefined, request)
  }
}

// ── POST /api/orders — Create a new order (public, no auth required) ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, customerName, customerPhone, customerEmail, items, notes } = body

    // Validate required fields
    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request)
    }
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return apiError('customerName es requerido', 400, undefined, request)
    }
    if (!customerPhone || typeof customerPhone !== 'string' || !customerPhone.trim()) {
      return apiError('customerPhone es requerido', 400, undefined, request)
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError('items es requerido y debe tener al menos un producto', 400, undefined, request)
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.name || item.price == null || !item.quantity) {
        return apiError('Cada item debe tener productId, name, price y quantity', 400, undefined, request)
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return apiError('La cantidad debe ser un número mayor a 0', 400, undefined, request)
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        return apiError('El precio debe ser un número mayor o igual a 0', 400, undefined, request)
      }
    }

    // Verify store exists and is active
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, isActive: true, whatsappNumber: true },
    })
    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }
    if (!store.isActive) {
      return apiError('Esta tienda no está disponible', 400, undefined, request)
    }

    // Calculate total amount from items
    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    // Generate a readable order number: ORD-YYYYMMDD-XXXX
    const now = new Date()
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0')
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`

    // Build WhatsApp message
    const itemsText = items
      .map((item: { name: string; quantity: number; price: number }) => {
        const subtotal = item.price * item.quantity
        return `- ${item.name} x${item.quantity} (S/ ${subtotal.toFixed(2)})`
      })
      .join('\n')

    const whatsappMessage = [
      `Pedido ${orderNumber}`,
      `Cliente: ${customerName}`,
      `Teléfono: ${customerPhone}`,
      customerEmail ? `Email: ${customerEmail}` : null,
      '',
      'Productos:',
      itemsText,
      '',
      `Total: S/ ${totalAmount.toFixed(2)}`,
      notes ? `\nNotas: ${notes}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    // Create the order
    const order = await db.storeOrder.create({
      data: {
        orderNumber,
        status: 'pending',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail?.trim() || null,
        totalAmount,
        items: items.map((item: { productId: string; name: string; price: number; quantity: number; imageUrl?: string }) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || '',
        })),
        whatsappMessage,
        notes: notes?.trim() || null,
        storeId,
      },
    })

    return apiSuccess(serializeDecimals(order), 201, request)
  } catch (error) {
    console.error('Create order error:', error)
    return apiError('Error al crear pedido', 500, undefined, request)
  }
}
