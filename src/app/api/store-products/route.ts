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
  const auth = authenticateRequest(request)
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

    // Check ownership FIRST
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        ownerId: true,
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    })

    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request)
    }

    // Ownership check (unless admin)
    if (!requireRole(auth.user, ['super_admin']) && store.ownerId !== auth.user.userId) {
      return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request)
    }

    // Check product limit based on plan
    const maxProducts = store.subscriptions[0]?.plan?.maxProducts || 5
    const currentCount = await db.storeProduct.count({ where: { storeId } })

    if (currentCount >= maxProducts) {
      return apiError(
        `Has alcanzado el limite de ${maxProducts} productos. Actualiza tu plan para mas.`,
        403,
        undefined,
        request
      )
    }

    // Sanitize user-generated content (XSS prevention)
    const sanitizedName = sanitizeBasic(name)
    const sanitizedDescription = sanitizeHtml(description || '')
    const sanitizedImageUrl = sanitizeUrl(imageUrl || '')
    const sanitizedCategory = sanitizeBasic(category || '')

    const product = await db.storeProduct.create({
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
  const auth = authenticateRequest(request)
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

    // Check ownership through store
    if (!requireRole(auth.user, ['super_admin'])) {
      const product = await db.storeProduct.findUnique({
        where: { id },
        include: { store: { select: { ownerId: true } } },
      })
      if (!product) {
        return apiError('Producto no encontrado', 404, undefined, request)
      }
      if (product.store.ownerId !== auth.user.userId) {
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
  const auth = authenticateRequest(request)
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

    // Check ownership
    if (!requireRole(auth.user, ['super_admin'])) {
      const product = await db.storeProduct.findUnique({
        where: { id },
        include: { store: { select: { ownerId: true } } },
      })
      if (!product) {
        return apiError('Producto no encontrado', 404, undefined, request)
      }
      if (product.store.ownerId !== auth.user.userId) {
        return apiError('Acceso denegado. No eres dueno de este producto.', 403, undefined, request)
      }
    }

    // Get store slug before deleting for cache revalidation
    let storeSlug = ''
    try {
      const product = await db.storeProduct.findUnique({ where: { id }, include: { store: { select: { slug: true } } } })
      storeSlug = product?.store?.slug || ''
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
