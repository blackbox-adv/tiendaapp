import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const PRODUCT_LIMITS: Record<string, number> = {
  free: 5,
  pro: 20,
  premium: 500,
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })

    const products = await db.product.findMany({
      where: { storeId },
      orderBy: { order: 'asc' },
      include: { images: { orderBy: { order: 'asc' } } }
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const storeId = body.storeId
    if (!storeId) return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })

    // Find the store by storeId (could be store.id or user id depending on usage)
    let store = await db.store.findUnique({ where: { id: storeId }, include: { user: { select: { plan: true } } } })
    // If not found, try searching by userId (legacy compatibility)
    if (!store) {
      store = await db.store.findUnique({ where: { userId: storeId }, include: { user: { select: { plan: true } } } })
    }
    if (!store) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })

    // Use the actual store id for product creation
    const actualStoreId = store.id

    const plan = store.user?.plan || 'free'
    const limit = PRODUCT_LIMITS[plan] || 5

    // Count current active products
    const count = await db.product.count({ where: { storeId: actualStoreId } })
    if (count >= limit) {
      return NextResponse.json({
        error: `Límite alcanzado`,
        message: `Tu plan ${plan === 'free' ? 'Gratis' : plan === 'pro' ? 'Pro' : 'Premium'} permite máximo ${limit} productos. Ya tienes ${count}.`,
        limit,
        current: count,
        plan
      }, { status: 403 })
    }

    const product = await db.product.create({
      data: {
        name: body.name,
        description: body.description || '',
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        currency: body.currency || 'PEN',
        isActive: body.isActive !== false,
        isFeatured: body.isFeatured || false,
        order: body.order || 0,
        storeId: actualStoreId,
        images: { create: (body.images || []).map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({ url: img.url, alt: img.alt || body.name, order: i, isPrimary: img.isPrimary || i === 0 })) }
      },
      include: { images: { orderBy: { order: 'asc' } } }
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    if (error?.status === 403) return NextResponse.json(error, { status: 403 })
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
