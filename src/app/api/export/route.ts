import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth'
import { corsHeaders } from '@/lib/api-response'

// ============================================================
// GET /api/export — Reportes descargables (CSV compatible con Excel)
//   ?type=orders  → detalle de pedidos (respeta filtro de estado)
//   ?type=sales   → resumen de ventas (por día + top productos)
// Requiere plan Pro o Premium (403 PLAN_REQUIRED para Gratis).
// ============================================================

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
}

const LIMA_TZ = 'America/Lima'

function limaDateParts(date: Date): { dateStr: string; timeStr: string } {
  const d = new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const t = new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
  // d viene como dd/mm/yyyy → normalizar a yyyy-mm-dd para Excel
  const [dd, mm, yyyy] = d.split('/')
  return { dateStr: `${yyyy}-${mm}-${dd}`, timeStr: t }
}

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function toCsv(rows: unknown[][]): string {
  // BOM \uFEFF para que Excel detecte UTF-8 (acentos y ñ correctos)
  return '\uFEFF' + rows.map((r) => r.map(csvEscape).join(',')).join('\r\n')
}

function sanitizeFilePart(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'tienda'
}

interface OrderItemJson {
  name?: string
  quantity?: number
  price?: number
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401, headers: corsHeaders(request) }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'orders'
    const storeId = searchParams.get('storeId')
    const statusFilter = searchParams.get('status') || ''

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId es requerido', code: 'BAD_REQUEST' },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    if (type !== 'orders' && type !== 'sales') {
      return NextResponse.json(
        { error: 'Tipo de reporte inválido', code: 'BAD_REQUEST' },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    // Verificar ownership de la tienda
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true, name: true, slug: true },
    })
    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada', code: 'NOT_FOUND' },
        { status: 404, headers: corsHeaders(request) }
      )
    }
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para esta tienda', code: 'FORBIDDEN' },
        { status: 403, headers: corsHeaders(request) }
      )
    }

    // ── Gating por plan: reportes solo en Pro/Premium ──
    let planType = 'free'
    try {
      const planRows = await db.$queryRawUnsafe(`
        SELECT pl.type FROM "Subscription" sub
        JOIN "Plan" pl ON pl.id = sub."planId"
        WHERE sub."userId" = $1 AND sub.status = 'active'
        ORDER BY sub."createdAt" DESC LIMIT 1
      `, auth.user.userId) as Array<{ type?: string }>
      if (Array.isArray(planRows) && planRows.length > 0 && planRows[0].type) {
        planType = planRows[0].type
      }
    } catch {
      /* planType queda 'free' (más seguro para el negocio) */
    }
    if (planType !== 'pro' && planType !== 'premium') {
      return NextResponse.json(
        {
          error: 'Los reportes descargables están disponibles en los planes Pro y Premium. Actualiza tu plan desde "Mi Plan".',
          code: 'PLAN_REQUIRED',
        },
        { status: 403, headers: corsHeaders(request) }
      )
    }

    const today = new Date()
    const stamp = limaDateParts(today).dateStr
    const base = sanitizeFilePart(store.slug || store.name)

    if (type === 'orders') {
      const orders = await db.storeOrder.findMany({
        where: {
          storeId,
          ...(statusFilter && ['pending', 'confirmed', 'cancelled'].includes(statusFilter)
            ? { status: statusFilter as 'pending' | 'confirmed' | 'cancelled' }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
      })

      const rows: unknown[][] = [
        ['N° Pedido', 'Fecha', 'Hora', 'Estado', 'Cliente', 'Teléfono', 'Email', 'Productos', 'Total (S/)', 'Notas'],
      ]
      for (const o of orders) {
        const { dateStr, timeStr } = limaDateParts(o.createdAt)
        const items = (Array.isArray(o.items) ? o.items : []) as OrderItemJson[]
        const productos = items
          .map((i) => `${i?.name ?? 'Producto'} x${Number(i?.quantity) || 0}`)
          .join(' + ')
        rows.push([
          o.orderNumber,
          dateStr,
          timeStr,
          STATUS_LABELS[o.status] ?? o.status,
          o.customerName,
          o.customerPhone,
          o.customerEmail ?? '',
          productos,
          Number(o.totalAmount).toFixed(2),
          o.notes ?? '',
        ])
      }

      const csv = toCsv(rows)
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="pedidos-${base}-${stamp}.csv"`,
          ...corsHeaders(request),
        },
      })
    }

    // ── type=sales ──

    // Resumen por estado (todos los pedidos)
    const byStatus = await db.storeOrder.groupBy({
      by: ['status'],
      where: { storeId },
      _count: true,
      _sum: { totalAmount: true },
    })
    const stat = (s: string) => byStatus.find((b) => b.status === s)
    const totalOrders = byStatus.reduce((acc, b) => acc + b._count, 0)

    // Ventas por día (últimos 30 días, hora Lima)
    const daily = await db.$queryRawUnsafe(`
      SELECT to_char(date_trunc('day', "createdAt" AT TIME ZONE 'America/Lima'), 'YYYY-MM-DD') AS dia,
             COUNT(*)::int AS pedidos,
             COALESCE(SUM("totalAmount"), 0)::float AS ingresos
      FROM "StoreOrder"
      WHERE "storeId" = $1 AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1 DESC
    `, storeId) as Array<{ dia: string; pedidos: number; ingresos: number }>

    // Productos más vendidos (últimos 90 días, excluye cancelados)
    const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const recentOrders = await db.storeOrder.findMany({
      where: { storeId, createdAt: { gte: since90 }, status: { not: 'cancelled' } },
      select: { items: true },
    })
    const productMap = new Map<string, { unidades: number; ingresos: number }>()
    for (const o of recentOrders) {
      const items = (Array.isArray(o.items) ? o.items : []) as OrderItemJson[]
      for (const i of items) {
        const name = (i?.name || 'Producto').trim()
        const qty = Number(i?.quantity) || 0
        const rev = (Number(i?.price) || 0) * qty
        const prev = productMap.get(name) ?? { unidades: 0, ingresos: 0 }
        productMap.set(name, { unidades: prev.unidades + qty, ingresos: prev.ingresos + rev })
      }
    }
    const topProducts = Array.from(productMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.ingresos - a.ingresos || b.unidades - a.unidades)
      .slice(0, 20)

    // Visitas de la tienda
    const storeFull = await db.store.findUnique({
      where: { id: storeId },
      select: { visitCount: true },
    })

    const rows: unknown[][] = [
      [`Reporte de ventas — ${store.name}`],
      ['Generado', `${stamp} (hora Perú)`],
      [],
      ['RESUMEN GENERAL'],
      ['Estado', 'Pedidos', 'Ingresos (S/)'],
      ['Total', totalOrders, Number(byStatus.reduce((a, b) => a + Number(b._sum.totalAmount ?? 0), 0)).toFixed(2)],
      ['Pendientes', stat('pending')?._count ?? 0, Number(stat('pending')?._sum.totalAmount ?? 0).toFixed(2)],
      ['Confirmados', stat('confirmed')?._count ?? 0, Number(stat('confirmed')?._sum.totalAmount ?? 0).toFixed(2)],
      ['Cancelados', stat('cancelled')?._count ?? 0, Number(stat('cancelled')?._sum.totalAmount ?? 0).toFixed(2)],
      ['Visitas a la tienda', storeFull?.visitCount ?? 0],
      [],
      ['VENTAS POR DÍA (últimos 30 días)'],
      ['Fecha', 'Pedidos', 'Ingresos (S/)'],
      ...daily.map((d) => [d.dia, d.pedidos, Number(d.ingresos).toFixed(2)]),
      [],
      ['PRODUCTOS MÁS VENDIDOS (últimos 90 días, sin cancelados)'],
      ['Producto', 'Unidades', 'Ingresos (S/)'],
      ...topProducts.map((p) => [p.name, p.unidades, p.ingresos.toFixed(2)]),
    ]

    const csv = toCsv(rows)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reporte-ventas-${base}-${stamp}.csv"`,
        ...corsHeaders(request),
      },
    })
  } catch (error) {
    console.error('[EXPORT] GET error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Error generando el reporte', code: 'INTERNAL_ERROR' },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 405, headers: corsHeaders(request) })
}
