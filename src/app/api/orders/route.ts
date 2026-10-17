import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { serializeDecimals, decimalToNumber } from '@/lib/utils'

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

    // Verify store access: dueno, super_admin o empleado activo
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })
    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }
    let hasAccess = store.ownerId === auth.user.userId || auth.user.role === 'super_admin'
    if (!hasAccess && auth.user.role === 'store_employee') {
      const member = await db.storeMember.findFirst({
        where: { userId: auth.user.userId, storeId, isActive: true },
        select: { id: true },
      })
      hasAccess = !!member
    }
    if (!hasAccess) {
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
      // Tope defensivo: el dashboard baja el listado completo. Con años de uso
      // una tienda puede acumular decenas de miles — sin tope el payload y la
      // memoria crecen sin control. 1000 recientes es más que suficiente hoy.
      take: Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '1000', 10) || 1000)),
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
    if (items.length > 50) {
      return apiError('Demasiados productos en un solo pedido (max 50)', 400, undefined, request)
    }

    // Tope de longitud en endpoint PÚBLICO: sin esto un atacante puede guardar
    // strings de megas en StoreOrder/whatsappMessage (bloat de BD).
    const nameStr = String(customerName).trim()
    const phoneStr = String(customerPhone).trim()
    const emailStr = typeof customerEmail === 'string' ? customerEmail.trim().slice(0, 120) : ''
    const notesStr = typeof notes === 'string' ? notes.trim().slice(0, 500) : ''
    if (nameStr.length > 100) {
      return apiError('El nombre es demasiado largo (máx 100 caracteres)', 400, undefined, request)
    }
    if (phoneStr.length > 20) {
      return apiError('El teléfono es demasiado largo (máx 20 caracteres)', 400, undefined, request)
    }
    if (emailStr && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailStr)) {
      return apiError('El email no es válido', 400, undefined, request)
    }

    // Validar forma minima: los precios y nombres NO se toman del cliente
    // (se verifican contra la BD abajo) — evita pedidos falsos con montos arbitrarios
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return apiError('Cada item debe tener un productId valido', 400, undefined, request)
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return apiError('La cantidad debe ser un número mayor a 0', 400, undefined, request)
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

    // ── ANTI-FRAUDE: precios SIEMPRE desde la BD ──
    const productIds = [...new Set(items.map((item: { productId: string }) => item.productId))]
    const dbProducts = await db.storeProduct.findMany({
      where: { id: { in: productIds }, storeId, isActive: true },
      select: { id: true, name: true, price: true, imageUrl: true },
    })
    const productById = new Map(dbProducts.map((p) => [p.id, p]))

    const serverItems: Array<{ productId: string; name: string; price: number; quantity: number; imageUrl: string }> = []
    for (const item of items) {
      const p = productById.get(item.productId)
      if (!p) {
        return apiError('Un producto del pedido ya no está disponible', 400, undefined, request)
      }
      const qty = Math.min(999, Math.max(1, Math.floor(item.quantity)))
      serverItems.push({
        productId: p.id,
        name: p.name,
        price: decimalToNumber(p.price),
        quantity: qty,
        imageUrl: p.imageUrl || '',
      })
    }

    // Calculate total amount from BD prices
    const totalAmount = serverItems.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    // Generate a readable order number: ORD-YYYYMMDD-XXXX (con reintento si colisiona)
    const now = new Date()
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0')
    const makeOrderNumber = () =>
      `ORD-${dateStr}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Build WhatsApp message (datos verificados contra BD)
    const itemsText = serverItems
      .map((item) => {
        const subtotal = item.price * item.quantity
        return `- ${item.name} x${item.quantity} (S/ ${subtotal.toFixed(2)})`
      })
      .join('\n')

    const buildWhatsappMessage = (orderNumber: string) =>
      [
        `Pedido ${orderNumber}`,
        `Cliente: ${nameStr}`,
        `Teléfono: ${phoneStr}`,
        emailStr ? `Email: ${emailStr}` : null,
        '',
        'Productos:',
        itemsText,
        '',
        `Total: S/ ${totalAmount.toFixed(2)}`,
        notesStr ? `\nNotas: ${notesStr}` : null,
      ]
        .filter(Boolean)
        .join('\n')

    // Create the order — reintenta con nuevo sufijo si el orderNumber del día
    // colisiona (36^4 combinaciones/día: raro, pero un 500 para el comprador
    // es un pedido perdido, así que lo tratamos)
    type CreatedOrder = Awaited<ReturnType<typeof db.storeOrder.create>>
    let order: CreatedOrder | null = null
    for (let attempt = 0; attempt < 3 && !order; attempt++) {
      const orderNumber = makeOrderNumber()
      try {
        order = await db.storeOrder.create({
          data: {
            orderNumber,
            status: 'pending',
            customerName: nameStr,
            customerPhone: phoneStr,
            customerEmail: emailStr || null,
            totalAmount,
            items: serverItems,
            whatsappMessage: buildWhatsappMessage(orderNumber),
            notes: notesStr || null,
            storeId,
          },
        })
      } catch (createError) {
        const code = createError && typeof createError === 'object' && 'code' in createError
          ? (createError as { code: string }).code
          : undefined
        if (code === 'P2002' && attempt < 2) continue // colisión de número: reintenta
        throw createError
      }
    }

    return apiSuccess(serializeDecimals(order), 201, request)
  } catch (error) {
    console.error('Create order error:', error)
    return apiError('Error al crear pedido', 500, undefined, request)
  }
}
