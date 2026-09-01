import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { serializeDecimals } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

// GET /api/store-products/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const product = await db.storeProduct.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true, name: true, slug: true, logo: true,
            primaryColor: true, secondaryColor: true, whatsappNumber: true, template: true,
          },
        },
      },
    })

    if (!product) {
      return apiError('Producto no encontrado', 404, undefined, request)
    }

    return apiSuccess(serializeDecimals(product), 200, request)
  } catch {
    return apiError('Error fetching product', 500, undefined, request)
  }
}

// DELETE /api/store-products/[id] - Auth required
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const { id } = await params

    // Check ownership
    if (!requireRole(auth.user, ['super_admin'])) {
      const product = await db.storeProduct.findUnique({ where: { id }, include: { store: { select: { ownerId: true, slug: true } } } })
      if (!product) {
        return apiError('Producto no encontrado', 404, undefined, request)
      }
      if (product.store.ownerId !== auth.user.userId) {
        return apiError('Acceso denegado', 403, undefined, request)
      }

      // On-demand revalidation: update store page cache
      try { revalidatePath(`/store/${product.store.slug}`) } catch { /* non-critical */ }
    }

    await db.storeProduct.delete({ where: { id } })

    return apiSuccess({ success: true, message: 'Producto eliminado' }, 200, request)
  } catch {
    return apiError('Error deleting product', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
