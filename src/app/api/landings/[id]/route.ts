// ============================================================
// PATCH/DELETE /api/landings/[id] — Editar o borrar MI landing
// PATCH permite publicar/despublicar y ajustar los textos antes
// de publicar. Ambos exigen ownership de la tienda dueña.
// ============================================================
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { serializeDecimals } from '@/lib/utils'

interface PatchBody {
  published?: boolean
  title?: string
  headline?: string
  subheadline?: string
  description?: string
  benefits?: string[]
  ctaText?: string
  price?: number | string
  offerPrice?: number | string
  offerText?: string | null
}

function parsePrice(v: number | string | undefined, max = 999999): number | null | undefined {
  if (v === undefined) return undefined
  if (v === null) return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.min(n, max)
}

function parseBenefits(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  return v
    .filter((b): b is string => typeof b === 'string')
    .map((b) => b.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 4)
}

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined
  return v.trim().slice(0, max)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const { id } = await params
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return apiError('id invalido', 400, undefined, request)
    }

    const landing = await db.landingPage.findUnique({
      where: { id },
      select: { id: true, storeId: true, store: { select: { ownerId: true } } },
    })
    if (!landing) return apiError('Landing no encontrada', 404, undefined, request)
    if (landing.store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permiso sobre esta landing', 403, undefined, request)
    }

    const body = (await request.json()) as PatchBody
    const data: Record<string, unknown> = {}

    if (typeof body.published === 'boolean') data.published = body.published
    const title = str(body.title, 120); if (title !== undefined && title.length >= 2) data.title = title
    const headline = str(body.headline, 60); if (headline !== undefined && headline.length >= 2) data.headline = headline
    const sub = str(body.subheadline, 100); if (sub !== undefined) data.subheadline = sub
    const desc = str(body.description, 500); if (desc !== undefined) data.description = desc
    const cta = str(body.ctaText, 30); if (cta !== undefined && cta.length >= 2) data.ctaText = cta
    const benefits = parseBenefits(body.benefits); if (benefits !== undefined) data.benefits = benefits
    const price = parsePrice(body.price); if (price !== undefined) data.price = price
    const offerPrice = parsePrice(body.offerPrice); if (offerPrice !== undefined) data.offerPrice = offerPrice
    if (body.offerText === null) data.offerText = null
    else { const ot = str(body.offerText ?? '', 80); if (ot !== undefined && ot.length > 0) data.offerText = ot }

    if (Object.keys(data).length === 0) {
      return apiError('Nada que actualizar', 400, undefined, request)
    }

    const updated = await db.landingPage.update({ where: { id }, data })
    return apiSuccess(serializeDecimals(updated), 200, request)
  } catch (error: unknown) {
    console.error('[LANDINGS] PATCH error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando la landing', 500, undefined, request)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const { id } = await params
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return apiError('id invalido', 400, undefined, request)
    }

    const landing = await db.landingPage.findUnique({
      where: { id },
      select: { id: true, store: { select: { ownerId: true } } },
    })
    if (!landing) return apiError('Landing no encontrada', 404, undefined, request)
    if (landing.store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permiso sobre esta landing', 403, undefined, request)
    }

    await db.landingPage.delete({ where: { id } })
    return apiSuccess({ ok: true }, 200, request)
  } catch (error: unknown) {
    console.error('[LANDINGS] DELETE error:', error instanceof Error ? error.message : String(error))
    return apiError('Error eliminando la landing', 500, undefined, request)
  }
}
