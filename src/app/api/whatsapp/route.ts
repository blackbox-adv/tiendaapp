import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { validateBody, whatsappSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/whatsapp - Generate WhatsApp link and log the contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(whatsappSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { storeId, productName, productPrice, productUrl, customerMessage } = validation.data

    // Fetch store to get WhatsApp number
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { name: true, whatsappNumber: true, slug: true, primaryColor: true, isActive: true },
    })

    if (!store || !store.whatsappNumber) {
      return apiError('Tienda no encontrada o sin WhatsApp configurado', 404, undefined, request)
    }

    if (!store.isActive) {
      return apiError('Esta tienda esta desactivada temporalmente', 403, undefined, request)
    }

    // Clean WhatsApp number (remove all non-digits)
    const cleanNumber = store.whatsappNumber.replace(/[^0-9]/g, '')

    if (cleanNumber.length < 10) {
      console.error('[WHATSAPP] Invalid phone number format for store:', storeId)
      return apiError('Numero de WhatsApp de la tienda invalido', 500, undefined, request)
    }

    // Build the WhatsApp message
    let message = ''
    const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tiendapp.pe'}/tienda/${store.slug}`

    if (customerMessage) {
      // Sanitize customer message: limit length
      message = customerMessage.slice(0, 1000)
    } else if (productName && productPrice) {
      message = `Hola ${store.name}!\n\n` +
        `Me interesa el siguiente producto:\n` +
        `${productName}\n` +
        `S/${productPrice.toFixed(2)}\n\n` +
        `${productUrl || storeUrl}\n\n` +
        `Tienen disponibilidad?`
    } else {
      message = `Hola ${store.name}! Quisiera mas informacion sobre sus productos.`
    }

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`

    // Log the contact interaction (fire-and-forget)
    db.store
      .update({
        where: { id: storeId },
        data: { visitCount: { increment: 1 } },
      })
      .catch(() => {})

    return apiSuccess(
      {
        whatsappUrl,
        phoneNumber: cleanNumber,
        storeName: store.name,
      },
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[WHATSAPP] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error generando enlace WhatsApp', 500, undefined, request)
  }
}

// OPTIONS /api/whatsapp - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
