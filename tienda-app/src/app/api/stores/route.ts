import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, ...data } = body

    const store = await db.store.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })

    return NextResponse.json(store)
  } catch {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
