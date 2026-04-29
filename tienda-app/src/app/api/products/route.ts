import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

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
        storeId: body.storeId,
        images: { create: (body.images || []).map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({ url: img.url, alt: img.alt || body.name, order: i, isPrimary: img.isPrimary || i === 0 })) }
      },
      include: { images: { orderBy: { order: 'asc' } } }
    })
    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
