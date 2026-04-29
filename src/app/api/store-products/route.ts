import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// GET /api/store-products - Public (product browsing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json({ error: 'storeId es requerido' }, { status: 400 })
    }

    const products = await db.storeProduct.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching products'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/store-products - Auth required (owner or admin)
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { storeId, name, description, price, originalPrice, imageUrl, category, color, isActive, featured, rating } = body

    if (!storeId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'storeId, name y price son requeridos' },
        { status: 400 },
      )
    }

    // Check ownership
    if (auth.user.role !== 'super_admin') {
      const store = await db.store.findUnique({ where: { id: storeId } })
      if (!store || store.ownerId !== auth.user.userId) {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
      }
    }

    // Check product limit based on plan
    const store = await db.store.findUnique({
      where: { id: storeId },
      include: { subscriptions: { include: { plan: true }, orderBy: { startDate: 'desc' }, take: 1 } },
    })
    
    if (store) {
      const latestSub = store.subscriptions[0]
      const maxProducts = latestSub?.plan?.maxProducts || 10
      const currentCount = await db.storeProduct.count({ where: { storeId } })
      
      if (currentCount >= maxProducts) {
        return NextResponse.json(
          { error: `Has alcanzado el límite de ${maxProducts} productos. Actualiza tu plan para más.` },
          { status: 403 },
        )
      }
    }

    const product = await db.storeProduct.create({
      data: {
        storeId,
        name,
        description: description || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        imageUrl: imageUrl || '',
        category: category || '',
        color: color || null,
        isActive: isActive !== undefined ? isActive : true,
        featured: featured === true,
        rating: rating ? parseFloat(rating) : 0,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/store-products - Auth required
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    // Check ownership through store
    if (auth.user.role !== 'super_admin') {
      const product = await db.storeProduct.findUnique({ where: { id }, include: { store: true } })
      if (!product || product.store.ownerId !== auth.user.userId) {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
      }
    }

    if (data.price !== undefined) data.price = parseFloat(data.price)
    if (data.originalPrice !== undefined) {
      data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null
    }

    const product = await db.storeProduct.update({ where: { id }, data })

    return NextResponse.json(product)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
