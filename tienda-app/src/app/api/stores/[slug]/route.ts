import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const store = await db.store.findUnique({
      where: { slug, isActive: true },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: { images: { orderBy: { order: 'asc' } } }
        },
        user: { select: { name: true } }
      }
    })
    if (!store) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    return NextResponse.json(store)
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
