import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/whatsapp - Generate WhatsApp link and optionally log the contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, productName, productPrice, productUrl, customerMessage } = body

    if (!storeId) {
      return NextResponse.json({ error: 'storeId es requerido' }, { status: 400 })
    }

    // Fetch store to get WhatsApp number
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { name: true, whatsappNumber: true, slug: true, primaryColor: true },
    })

    if (!store || !store.whatsappNumber) {
      return NextResponse.json({ error: 'Tienda no encontrada o sin WhatsApp configurado' }, { status: 404 })
    }

    // Clean WhatsApp number (remove all non-digits)
    const cleanNumber = store.whatsappNumber.replace(/[^0-9]/g, '')

    // Build the WhatsApp message
    let message = ''
    if (customerMessage) {
      message = customerMessage
    } else if (productName && productPrice) {
      const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tiendapp.pe'}/tienda/${store.slug}`
      message = `¡Hola ${store.name}! 👋\n\n` +
        `Me interesa el siguiente producto:\n` +
        `📦 *${productName}*\n` +
        `💰 S/${productPrice.toFixed(2)}\n\n` +
        `🔗 ${productUrl || storeUrl}\n\n` +
        `¿Tienen disponibilidad?`
    } else {
      message = `¡Hola ${store.name}! 👋 Quisiera más información sobre sus productos.`
    }

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`

    // Log the contact interaction (for analytics)
    // In production, this would use WhatsApp Business API for more features
    await db.store.update({
      where: { id: storeId },
      data: { visitCount: { increment: 1 } },
    })

    return NextResponse.json({
      whatsappUrl,
      phoneNumber: cleanNumber,
      storeName: store.name,
      message,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error generando enlace WhatsApp'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
