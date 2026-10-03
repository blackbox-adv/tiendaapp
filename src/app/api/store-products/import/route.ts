import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { sanitizeBasic } from '@/lib/sanitize'
import { revalidatePath } from 'next/cache'

// ============================================================
// POST /api/store-products/import
// Importa productos desde CSV (Excel / Google Sheets) a la tienda.
// - multipart/form-data: storeId + file (.csv)
// - Solo planes de pago (Pro / Premium).
// - Si la fila trae "id" y existe → ACTUALIZA; si no → CREA.
// - Nunca borra productos que falten en el CSV.
// - Respeta el límite de productos del plan (solo creaciones).
// ============================================================

const MAX_FILE_BYTES = 2 * 1024 * 1024 // 2 MB
const MAX_ROWS = 1000

// ── Parser CSV tolerante: comillas, saltos de línea embebidos, BOM ──
function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ }
        else inQuotes = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(cell); cell = ''
    } else if (ch === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''
    } else if (ch === '\r') {
      // ignorar (manejado por \n)
    } else {
      cell += ch
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

function detectDelimiter(headerLine: string): string {
  const semis = (headerLine.match(/;/g) || []).length
  const commas = (headerLine.match(/,/g) || []).length
  return semis >= commas ? ';' : ','
}

// Normaliza encabezados: minúsculas, sin acentos, sin espacios
function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
}

const HEADER_ALIASES: Record<string, string> = {
  id: 'id',
  nombre: 'nombre', name: 'nombre', producto: 'nombre', producto_nombre: 'nombre',
  descripcion: 'descripcion', description: 'descripcion', detalle: 'descripcion',
  precio: 'precio', price: 'precio', pvp: 'precio',
  precio_anterior: 'precio_anterior', precio_normal: 'precio_anterior', precio_tachado: 'precio_anterior', preciooriginal: 'precio_anterior', original_price: 'precio_anterior',
  categoria: 'categoria', category: 'categoria', rubro: 'categoria',
  imagen_url: 'imagen_url', imagen: 'imagen_url', imagenurl: 'imagen_url', url_imagen: 'imagen_url', image: 'imagen_url', foto: 'imagen_url',
  imagenes_extra: 'imagenes_extra', imagenes: 'imagenes_extra', images: 'imagenes_extra',
  destacado: 'destacado', featured: 'destacado',
  activo: 'activo', active: 'activo', visible: 'activo',
  stock: 'stock', existencias: 'stock', cantidad: 'stock',
  color: 'color', variante: 'color',
}

function parsePrice(raw: string): number | null {
  if (raw == null) return null
  let s = String(raw).trim()
  if (!s) return null
  s = s.replace(/[S/\/\s]/g, '').replace(/[^\d.,-]/g, '')
  if (!s) return null
  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  if (hasComma && hasDot) {
    // El último separador que aparece es el decimal
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.')
    } else {
      s = s.replace(/,/g, '')
    }
  } else if (hasComma) {
    s = s.replace(',', '.')
  }
  const n = parseFloat(s)
  if (!isFinite(n) || n < 0) return null
  return Math.round(n * 100) / 100
}

function parseBool(raw: string, def: boolean): boolean {
  const s = (raw || '').trim().toLowerCase()
  if (!s) return def
  if (['si', 'sí', 'true', '1', 'x', 'yes', 'y'].includes(s)) return true
  if (['no', 'false', '0', 'n'].includes(s)) return false
  return def
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error) {
      return apiError(auth.error, auth.status, undefined, request)
    }
    if (!auth.user) return apiError('No autenticado', 401, undefined, request)

    const formData = await request.formData()
    const storeId = String(formData.get('storeId') || '')
    const file = formData.get('file')

    if (!storeId || !/^[a-zA-Z0-9_-]+$/.test(storeId)) {
      return apiError('storeId invalido', 400, undefined, request)
    }
    if (!file || typeof file === 'string') {
      return apiError('Adjunta un archivo CSV', 400, undefined, request)
    }
    const csvFile = file as File
    if (csvFile.size > MAX_FILE_BYTES) {
      return apiError('El archivo es demasiado grande (máximo 2 MB)', 400, undefined, request)
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, ownerId: true, slug: true },
    })
    if (!store) return apiError('Tienda no encontrada', 404, undefined, request)

    const isAdmin = requireRole(auth.user, ['super_admin'])
    if (!isAdmin && store.ownerId !== auth.user.userId) {
      return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request)
    }

    // Solo planes de pago
    let planType = 'free'
    let maxProducts = 50
    try {
      const rows = await db.$queryRawUnsafe(`
        SELECT pl.type, pl."maxProducts" FROM "Subscription" sub
        JOIN "Plan" pl ON pl.id = sub."planId"
        WHERE sub."storeId" = $1 AND sub.status = 'active'
        ORDER BY sub."createdAt" DESC LIMIT 1
      `, storeId) as Array<{ type?: string; maxProducts?: number }>
      if (Array.isArray(rows) && rows.length > 0) {
        if (rows[0].type) planType = rows[0].type
        if (rows[0].maxProducts) maxProducts = Number(rows[0].maxProducts)
      }
    } catch { /* queda free */ }
    if (!isAdmin && planType !== 'pro' && planType !== 'premium') {
      return apiError(
        'La importación de productos está disponible en los planes de pago. Actualiza tu plan desde "Mi Plan".',
        403,
        'PLAN_REQUIRED',
        request
      )
    }

    // ── Leer y parsear CSV ──
    let text = await csvFile.text()
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1) // BOM
    const firstLineEnd = text.indexOf('\n')
    const headerLine = firstLineEnd === -1 ? text : text.slice(0, firstLineEnd)
    const delimiter = detectDelimiter(headerLine)
    const parsed = parseCsv(text, delimiter)
    if (parsed.length < 2) {
      return apiError('El CSV no tiene filas de datos. Descarga la plantilla y sigue el formato.', 400, undefined, request)
    }

    // Mapear encabezados a campos
    const headerRow = parsed[0].map(normalizeHeader)
    const colMap: Record<number, string> = {}
    headerRow.forEach((h, idx) => {
      const field = HEADER_ALIASES[h]
      if (field && !Object.values(colMap).includes(field)) colMap[idx] = field
    })
    if (!Object.values(colMap).includes('nombre')) {
      return apiError('Falta la columna "nombre" en el CSV. Descarga la plantilla para ver el formato.', 400, undefined, request)
    }

    const get = (row: string[], field: string): string => {
      for (const [idx, f] of Object.entries(colMap)) {
        if (f === field) return row[Number(idx)] ?? ''
      }
      return ''
    }

    // ── Upsert ──
    const existing = await db.storeProduct.findMany({
      where: { storeId },
      select: { id: true },
    })
    const existingIds = new Set(existing.map((p) => p.id))
    let activeCount = await db.storeProduct.count({ where: { storeId, isActive: true } })

    let created = 0
    let updated = 0
    let skipped = 0
    let limitReached = false
    const errors: Array<{ fila: number; motivo: string }> = []

    const dataRows = parsed.slice(1, MAX_ROWS + 1)
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const fila = i + 2 // número de fila humano (encabezado = fila 1)
      const rowId = get(row, 'id').trim()
      const name = sanitizeBasic(get(row, 'nombre'))
      if (!name) {
        skipped++
        errors.push({ fila, motivo: 'Sin nombre' })
        continue
      }

      const priceRaw = get(row, 'precio').trim()
      const price = parsePrice(priceRaw)
      const isUpdate = rowId && existingIds.has(rowId)

      if (!isUpdate && (price == null || price <= 0)) {
        skipped++
        errors.push({ fila, motivo: `"${name}": precio inválido o vacío` })
        continue
      }
      if (!isUpdate && limitReached) {
        skipped++
        errors.push({ fila, motivo: `"${name}": no se creó, límite del plan alcanzado` })
        continue
      }

      const description = sanitizeBasic(get(row, 'descripcion'))
      const category = sanitizeBasic(get(row, 'categoria'))
      const imageUrl = get(row, 'imagen_url').trim()
      const imagesExtra = get(row, 'imagenes_extra')
        .split('|')
        .map((u) => u.trim())
        .filter((u) => u.length > 0)
      const colorRaw = sanitizeBasic(get(row, 'color'))
      const stockRaw = get(row, 'stock').trim()

      try {
        if (isUpdate && rowId) {
          // ACTUALIZACIÓN: solo sobrescribe lo que viene lleno en el CSV
          const data: Record<string, unknown> = {}
          if (name) data.name = name
          if (price != null) data.price = price
          const originalPrice = parsePrice(get(row, 'precio_anterior'))
          if (get(row, 'precio_anterior').trim()) {
            data.originalPrice = originalPrice != null && originalPrice > 0 ? originalPrice : null
          }
          if (description) data.description = description
          if (category) data.category = category
          if (imageUrl) data.imageUrl = imageUrl
          if (imagesExtra.length > 0) data.images = imagesExtra
          if (get(row, 'destacado').trim()) data.featured = parseBool(get(row, 'destacado'), false)
          if (get(row, 'activo').trim()) data.isActive = parseBool(get(row, 'activo'), true)
          if (stockRaw) {
            const st = parseInt(stockRaw, 10)
            if (!isNaN(st)) data.stock = st
          }
          if (colorRaw) data.color = colorRaw

          if (Object.keys(data).length > 0) {
            await db.storeProduct.update({ where: { id: rowId }, data })
            updated++
          } else {
            skipped++
          }
        } else {
          // CREACIÓN: respeta el límite del plan
          if (activeCount + 1 > maxProducts) {
            limitReached = true
            skipped++
            errors.push({ fila, motivo: `"${name}": no se creó, límite del plan alcanzado (${maxProducts} productos)` })
            continue
          }
          const originalPrice = parsePrice(get(row, 'precio_anterior'))
          const st = stockRaw ? parseInt(stockRaw, 10) : -1
          await db.storeProduct.create({
            data: {
              storeId,
              name,
              description,
              price: price as number,
              originalPrice: originalPrice != null && originalPrice > 0 ? originalPrice : null,
              imageUrl,
              images: imagesExtra,
              category,
              color: colorRaw || null,
              stock: isNaN(st) ? -1 : st,
              isActive: parseBool(get(row, 'activo'), true),
              featured: parseBool(get(row, 'destacado'), false),
            },
          })
          activeCount++
          created++
        }
      } catch (rowErr: unknown) {
        skipped++
        errors.push({ fila, motivo: `"${name}": error al guardar` })
        console.error('[PRODUCTS-IMPORT] row error:', rowErr instanceof Error ? rowErr.message : rowErr)
      }
    }

    // Cache busting de la tienda pública
    try { revalidatePath(`/store/${store.slug}`) } catch { /* non-critical */ }

    return apiSuccess(
      { success: true, created, updated, skipped, limitReached, errors, maxProducts },
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[PRODUCTS-IMPORT] error:', error instanceof Error ? error.message : String(error))
    return apiError('Error importando productos', 500, undefined, request)
  }
}
