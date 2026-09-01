import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id }, include: { images: { orderBy: { order: 'asc' } } } })
    if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(product)
  } catch { return NextResponse.json({ error: 'Error' }, { status: 500 }) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    if (body.images && body.images.length > 0) await db.storeImage.deleteMany({ where: { productId: id } })
    const product = await db.product.update({
      where: { id },
      data: {
        name: body.name, description: body.description, price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        isActive: body.isActive, isFeatured: body.isFeatured, order: body.order,
        ...(body.images?.length > 0 ? { images: { create: body.images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({ url: img.url, alt: img.alt || body.name, order: i, isPrimary: img.isPrimary || i === 0 })) } } : {})
      },
      include: { images: { orderBy: { order: 'asc' } } }
    })
    return NextResponse.json(product)
  } catch { return NextResponse.json({ error: 'Error' }, { status: 500 }) }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.storeImage.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error' }, { status: 500 }) }
}
