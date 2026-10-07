import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { apiError } from '@/lib/api-response'

// ============================================================
// GET /api/store-products/export?storeId=...
// Exporta el catálogo de la tienda a CSV (separador ';' + BOM,
// compatible con Excel y Google Sheets). Solo planes de pago.
//
// GET /api/store-products/export?storeId=...&template=1
// Descarga solo la fila de encabezados (plantilla para cargar
// productos desde cero).
// ============================================================

const CSV_HEADERS = [
  'id',
  'nombre',
  'descripcion',
  'precio',
  'precio_anterior',
  'categoria',
  'imagen_url',
  'imagenes_extra',
  'destacado',
  'activo',
  'stock',
  'color',
]

function csvCell(value: string | number | boolean | null | undefined): string {
  const s = value == null ? '' : String(value)
  if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function imagesToJsonUrls(images: unknown): string {
  if (Array.isArray(images)) return images.filter((u) => typeof u === 'string').join(' | ')
  return ''
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error) {
      return apiError(auth.error, auth.status, undefined, request)
    }
    if (!auth.user) return apiError('No autenticado', 401, undefined, request)

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const isTemplate = searchParams.get('template') === '1'

    if (!storeId || !/^[a-zA-Z0-9_-]+$/.test(storeId)) {
      return apiError('storeId invalido', 400, undefined, request)
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, ownerId: true, slug: true, name: true },
    })
    if (!store) return apiError('Tienda no encontrada', 404, undefined, request)

    const isAdmin = requireRole(auth.user, ['super_admin'])
    if (!isAdmin && store.ownerId !== auth.user.userId) {
      return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request)
    }

    // Función de plan de pago (Pro / Premium). SQL crudo tolerante a fallos.
    if (!isAdmin) {
      let planType = 'free'
      try {
        const rows = await db.$queryRawUnsafe(`
          SELECT pl.type FROM "Subscription" sub
          JOIN "Plan" pl ON pl.id = sub."planId"
          WHERE sub."storeId" = $1 AND sub.status = 'active'
          ORDER BY sub."createdAt" DESC LIMIT 1
        `, storeId) as Array<{ type?: string }>
        if (Array.isArray(rows) && rows.length > 0 && rows[0].type) planType = rows[0].type
      } catch { /* queda free (más seguro) */ }
      if (planType !== 'pro' && planType !== 'premium') {
        return apiError(
          'La importación y exportación de productos está disponible en los planes de pago. Actualiza tu plan desde "Mi Plan".',
          403,
          'PLAN_REQUIRED',
          request
        )
      }
    }

    let csvBody = CSV_HEADERS.join(';')

    if (!isTemplate) {
      const products = await db.storeProduct.findMany({
        where: { storeId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, name: true, description: true, price: true, originalPrice: true,
          imageUrl: true, images: true, category: true, color: true,
          isActive: true, featured: true, stock: true,
        },
      })
      const rows = products.map((p) => [
        csvCell(p.id),
        csvCell(p.name),
        csvCell(p.description),
        csvCell(Number(p.price).toFixed(2)),
        p.originalPrice != null ? csvCell(Number(p.originalPrice).toFixed(2)) : '',
        csvCell(p.category),
        csvCell(p.imageUrl),
        csvCell(imagesToJsonUrls(p.images)),
        csvCell(p.featured ? 'si' : 'no'),
        csvCell(p.isActive ? 'si' : 'no'),
        csvCell(p.stock),
        csvCell(p.color ?? ''),
      ].join(';'))
      if (rows.length > 0) csvBody += '\n' + rows.join('\n')
    }

    const filename = isTemplate
      ? 'plantilla-productos-kyllari.csv'
      : `productos-${store.slug}.csv`

    return new Response('\uFEFF' + csvBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: unknown) {
    console.error('[PRODUCTS-EXPORT] error:', error instanceof Error ? error.message : String(error))
    return apiError('Error exportando productos', 500, undefined, request)
  }
}
