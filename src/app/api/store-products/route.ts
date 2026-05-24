import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, createProductSchema, updateProductSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { sanitizeBasic, sanitizeHtml, sanitizeUrl } from '@/lib/sanitize'
import { serializeDecimals } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

// GET /api/store-products - Public (product browsing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request)
    }

    // Validate storeId format (must be a valid cuid)
    if (!/^[a-z0-9-]+$/.test(storeId)) {
      return apiError('storeId invalido', 400, undefined, request)
    }

    const products = await db.storeProduct.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        imageUrl: true,
        category: true,
        isActive: true,
        featured: true,
        rating: true,
        storeId: true,
        createdAt: true,
      },
    })

    return apiSuccess(serializeDecimals(products), 200, request)
  } catch (error: unknown) {
    console.error('[PRODUCTS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo productos', 500, undefined, request)
  }
}

// POST /api/store-products - Create product (auth required + ownership + plan limit)
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(createProductSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { storeId, name, description, price, originalPrice, imageUrl, category, color, isActive, featured, rating } =
      validation.data

    // Check ownership FIRST — use simple query to avoid PgBouncer timeout with Prisma include
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, ownerId: true },
    })

    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }

    // Ownership check (unless admin)
    if (!requireRole(auth.user, ['super_admin']) && store.ownerId !== auth.user.userId) {
      return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request)
    }

    // Check product limit based on plan — use raw SQL to avoid PgBouncer include timeout
    let maxProducts = 5 // Default for free plan
    try {
      const planResult = await db.$queryRawUnsafe(`
        SELECT pl."maxProducts" 
        FROM "Subscription" sub
        JOIN "Plan" pl ON pl.id = sub."planId"
        WHERE sub."userId" = $1 AND sub.status = 'active'
        ORDER BY sub."createdAt" DESC LIMIT 1
      `, auth.user.userId) as Array<Record<string, unknown>>
      if (Array.isArray(planResult) && planResult.length > 0 && planResult[0].maxProducts) {
        maxProducts = Number(planResult[0].maxProducts)
      }
    } catch { /* use default */ }

    // CRITICAL FIX: Use transaction to prevent race condition on product limit check
    const product = await db.$transaction(async (tx) => {
      const currentCount = await tx.storeProduct.count({ where: { storeId } })

      if (currentCount >= maxProducts) {
        throw new Error('PRODUCT_LIMIT')
      }

      // Sanitize user-generated content (XSS prevention)
      const sanitizedName = sanitizeBasic(name)
      const sanitizedDescription = sanitizeHtml(description || '')
      const sanitizedImageUrl = sanitizeUrl(imageUrl || '')
      const sanitizedCategory = sanitizeBasic(category || '')

      return tx.storeProduct.create({
        data: {
          storeId,
          name: sanitizedName,
          description: sanitizedDescription,
          price: parseFloat(price.toString()),
          originalPrice: originalPrice ? parseFloat(originalPrice.toString()) : null,
          imageUrl: sanitizedImageUrl,
          category: sanitizedCategory,
          color: color || null,
          isActive: isActive !== undefined ? isActive : true,
          featured: featured === true,
          rating: rating ? parseFloat(rating.toString()) : 0,
        },
      })
    }).catch((err) => {
      if (err instanceof Error && err.message === 'PRODUCT_LIMIT') {
        return 'PRODUCT_LIMIT'
      }
      console.error('[PRODUCTS] Transaction error:', err)
      return null
    })

    if (product === 'PRODUCT_LIMIT') {
      return apiError(
        `Has alcanzado el limite de ${maxProducts} productos. Actualiza tu plan para mas.`,
        403,
        undefined,
        request
      )
    }

    if (product === null) {
      return apiError('Error creando producto', 500, undefined, request)
    }

    // On-demand revalidation: update store page cache
    try {
      const storeData = await db.store.findUnique({ where: { id: storeId }, select: { slug: true } })
      if (storeData?.slug) revalidatePath(`/store/${storeData.slug}`)
    } catch { /* non-critical */ }

    return apiSuccess(serializeDecimals(product), 201, request)
  } catch (error: unknown) {
    console.error('[PRODUCTS] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error creando producto', 500, undefined, request)
  }
}

// PUT /api/store-products - Update product (auth required + ownership)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(updateProductSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { id, ...data } = validation.data

    // Sanitize user-generated content before update
    if (data.name) data.name = sanitizeBasic(data.name)
    if (data.description) data.description = sanitizeHtml(data.description)
    if (data.imageUrl) data.imageUrl = sanitizeUrl(data.imageUrl)
    if (data.category) data.category = sanitizeBasic(data.category)

    // Check ownership through store — use raw SQL to avoid PgBouncer include timeout
    if (!requireRole(auth.user, ['super_admin'])) {
      const ownershipCheck = await db.$queryRawUnsafe(`
        SELECT p.id, s."ownerId" 
        FROM "StoreProduct" p 
        JOIN "Store" s ON s.id = p."storeId" 
        WHERE p.id = $1
      `, id) as Array<Record<string, unknown>>
      if (!Array.isArray(ownershipCheck) || ownershipCheck.length === 0) {
        return apiError('Producto no encontrado', 404, undefined, request)
      }
      if (ownershipCheck[0].ownerId !== auth.user.userId) {
        return apiError('Acceso denegado. No eres dueno de este producto.', 403, undefined, request)
      }
    }

    // Sanitize numeric fields
    if (data.price !== undefined) data.price = parseFloat(data.price.toString())
    if (data.originalPrice !== undefined) {
      data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice.toString()) : null
    }
    if (data.rating !== undefined) data.rating = parseFloat(data.rating.toString())

    const product = await db.storeProduct.update({
      where: { id },
      data,
    })

    // On-demand revalidation: update store page cache
    try {
      const storeData = await db.store.findUnique({ where: { id: product.storeId }, select: { slug: true } })
      if (storeData?.slug) revalidatePath(`/store/${storeData.slug}`)
      revalidatePath(`/store/${storeData?.slug || ''}/product/${id}`)
    } catch { /* non-critical */ }

    return apiSuccess(serializeDecimals(product), 200, request)
  } catch (error: unknown) {
    console.error('[PRODUCTS] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando producto', 500, undefined, request)
  }
}

// DELETE /api/store-products/:id - Delete product (auth required + ownership)
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return apiError('ID del producto requerido', 400, undefined, request)
    }

    // Check ownership — use raw SQL to avoid PgBouncer include timeout
    if (!requireRole(auth.user, ['super_admin'])) {
      const ownershipCheck = await db.$queryRawUnsafe(`
        SELECT p.id, s."ownerId", s.slug as "storeSlug"
        FROM "StoreProduct" p
        JOIN "Store" s ON s.id = p."storeId"
        WHERE p.id = $1
      `, id) as Array<Record<string, unknown>>
      if (!Array.isArray(ownershipCheck) || ownershipCheck.length === 0) {
        return apiError('Producto no encontrado', 404, undefined, request)
      }
      if (ownershipCheck[0].ownerId !== auth.user.userId) {
        return apiError('Acceso denegado. No eres dueno de este producto.', 403, undefined, request)
      }
    }

    // Get store slug before deleting for cache revalidation
    let storeSlug = ''
    try {
      const slugResult = await db.$queryRawUnsafe(`
        SELECT s.slug FROM "StoreProduct" p JOIN "Store" s ON s.id = p."storeId" WHERE p.id = $1
      `, id) as Array<Record<string, unknown>>
      storeSlug = (Array.isArray(slugResult) && slugResult.length > 0) ? String(slugResult[0].slug || '') : ''
    } catch { /* non-critical */ }

    await db.storeProduct.delete({ where: { id } })

    // On-demand revalidation: update store page cache
    if (storeSlug) {
      try { revalidatePath(`/store/${storeSlug}`) } catch { /* non-critical */ }
    }

    return apiSuccess({ success: true, message: 'Producto eliminado' }, 200, request)
  } catch (error: unknown) {
    console.error('[PRODUCTS] DELETE error:', error instanceof Error ? error.message : String(error))
    return apiError('Error eliminando producto', 500, undefined, request)
  }
}

// OPTIONS /api/store-products - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
