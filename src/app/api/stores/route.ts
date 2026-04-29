import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// GET /api/stores - Public (store browsing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const store = await db.store.findUnique({
        where: { slug },
        include: {
          products: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
          owner: { select: { id: true, name: true, email: true } },
        },
      })

      if (!store) {
        return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
      }

      await db.store.update({
        where: { id: store.id },
        data: { visitCount: { increment: 1 } },
      })

      return NextResponse.json(store)
    }

    // Auth required for listing all stores
    const auth = authenticateRequest(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    if (auth.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const stores = await db.store.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true } },
        subscriptions: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(stores)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching stores'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/stores - Auth required
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      ownerId, name, description, logo, primaryColor, secondaryColor,
      whatsappNumber, template, category,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'name es requerido' }, { status: 400 })
    }

    // User can only create stores for themselves (unless admin)
    const effectiveOwnerId = ownerId || auth.user.userId
    if (auth.user.role !== 'super_admin' && auth.user.userId !== ownerId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const slug =
      name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' + Date.now().toString(36)

    const store = await db.store.create({
      data: {
        ownerId: effectiveOwnerId,
        name,
        slug,
        description: description || '',
        logo: logo || '',
        primaryColor: primaryColor || '#7C3AED',
        secondaryColor: secondaryColor || '#10B981',
        whatsappNumber: whatsappNumber || '',
        template: template || 'moderna',
        category: category || 'general',
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(store, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating store'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/stores - Auth required
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    // Check ownership (unless admin)
    if (auth.user.role !== 'super_admin') {
      const store = await db.store.findUnique({ where: { id } })
      if (!store || store.ownerId !== auth.user.userId) {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
      }
    }

    const store = await db.store.update({
      where: { id },
      data,
      include: { owner: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(store)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating store'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
