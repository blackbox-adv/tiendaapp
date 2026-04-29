import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name, storeName, storeCategory } = await request.json()
    
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 })

    const slug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36)

    const user = await db.user.create({
      data: {
        email, password, name,
        store: {
          create: {
            name: storeName, slug,
            category: storeCategory || 'general',
            whatsapp: '',
          }
        }
      },
      include: { store: true }
    })

    const { password: _, ...safeUser } = user
    return NextResponse.json(safeUser, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }
}
