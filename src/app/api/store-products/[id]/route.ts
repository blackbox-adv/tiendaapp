import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// GET /api/store-products/[id] - Public
export async function GET(
  _request: NextRequest,
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
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/store-products/[id] - Auth required
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const { id } = await params

    // Check ownership
    if (auth.user.role !== 'super_admin') {
      const product = await db.storeProduct.findUnique({ where: { id }, include: { store: true } })
      if (!product || product.store.ownerId !== auth.user.userId) {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
      }
    }

    await db.storeProduct.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Producto eliminado' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
