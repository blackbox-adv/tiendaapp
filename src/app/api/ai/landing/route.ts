// ============================================================
// POST /api/ai/landing — Landing IA v1 (solo Premium)
// Auth + ownership + gating Premium → llama a Gemini → guarda
// el borrador de la landing y lo devuelve. No toca nada más.
// ============================================================
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { serializeDecimals, slugify } from '@/lib/utils'
import { getUserPlanType } from '@/lib/plan-gating'
import { generateLandingCopy, isGeminiConfigured, GeminiError } from '@/lib/ai/gemini'

interface GenerateBody {
  storeId?: string
  productName?: string
  productInfo?: string
  price?: number | string
  offerText?: string
  photos?: string[]
}

async function uniqueSlug(base: string): Promise<string> {
  const clean = slugify(base).slice(0, 40) || 'lanzamiento'
  for (let i = 0; i < 6; i++) {
    const candidate = i === 0 ? clean : `${clean}-${Math.random().toString(36).slice(2, 6)}`
    const exists = await db.landingPage.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!exists) return candidate
  }
  return `${clean}-${Date.now().toString(36)}`
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = (await request.json()) as GenerateBody

    // Validación manual (campos acotados, sin zod nuevo)
    const storeId = typeof body.storeId === 'string' ? body.storeId.trim() : ''
    const productName = typeof body.productName === 'string' ? body.productName.trim() : ''
    const productInfo = typeof body.productInfo === 'string' ? body.productInfo.trim().slice(0, 600) : ''
    const offerText = typeof body.offerText === 'string' && body.offerText.trim()
      ? body.offerText.trim().slice(0, 80)
      : null
    const photos = Array.isArray(body.photos)
      ? body.photos.filter((p): p is string => typeof p === 'string' && p.length > 0).slice(0, 4)
      : []
    const priceNum = typeof body.price === 'number'
      ? body.price
      : typeof body.price === 'string' && body.price.trim() !== ''
        ? Number(body.price.replace(',', '.'))
        : NaN
    const price = Number.isFinite(priceNum) && priceNum > 0 ? Math.min(priceNum, 999999) : null

    if (!/^[a-zA-Z0-9_-]+$/.test(storeId)) {
      return apiError('storeId invalido', 400, undefined, request)
    }
    if (productName.length < 2 || productName.length > 120) {
      return apiError('Indica el nombre del producto (2 a 120 caracteres)', 400, undefined, request)
    }

    // Ownership de la tienda
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, ownerId: true, name: true, category: true },
    })
    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permiso sobre esta tienda', 403, undefined, request)
    }

    // Gating Premium (la landing ya lo anuncia así en la página pública)
    if (auth.user.role !== 'super_admin') {
      const planType = await getUserPlanType(auth.user.userId)
      if (planType !== 'premium') {
        return apiError(
          'La Landing IA esta disponible en el plan Premium. Actualiza tu plan desde "Mi Plan".',
          403,
          { code: 'PLAN_REQUIRED' },
          request
        )
      }
    }

    // La IA debe estar configurada (GEMINI_API_KEY en Vercel)
    if (!isGeminiConfigured()) {
      return apiError(
        'La IA aun no esta configurada en el servidor. Contacta al soporte.',
        503,
        { code: 'GEMINI_NO_KEY' },
        request
      )
    }

    // Generar copy con Gemini
    let copy
    try {
      copy = await generateLandingCopy({
        storeName: store.name,
        storeCategory: store.category || undefined,
        productName,
        productInfo: productInfo || undefined,
        price,
        offerText,
      })
    } catch (e) {
      if (e instanceof GeminiError) {
        return apiError(e.message, 502, { code: e.code }, request)
      }
      console.error('[AI-LANDING] error generando:', e instanceof Error ? e.message : String(e))
      return apiError('Error generando el copy con la IA. Intenta de nuevo.', 502, undefined, request)
    }

    // Guardar borrador
    const slug = await uniqueSlug(productName)
    const landing = await db.landingPage.create({
      data: {
        storeId: store.id,
        title: productName.slice(0, 120),
        slug,
        inputText: productInfo,
        offerText,
        headline: copy.headline,
        subheadline: copy.subheadline,
        description: copy.description,
        benefits: copy.benefits,
        price,
        ctaText: copy.ctaText,
        photos,
        seoTitle: copy.seoTitle || `${productName} — ${store.name}`,
        seoDescription: copy.seoDescription,
        published: false,
      },
    })

    return apiSuccess(serializeDecimals(landing), 201, request)
  } catch (error: unknown) {
    console.error('[AI-LANDING] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error interno generando la landing', 500, undefined, request)
  }
}
