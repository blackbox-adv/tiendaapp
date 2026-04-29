import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// GET /api/subscriptions - Admin only
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const subscriptions = await db.subscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(subscriptions)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching subscriptions'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/subscriptions - Auth required
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { userId, storeId, planId, status } = body

    if (!userId || !planId) {
      return NextResponse.json({ error: 'userId y planId son requeridos' }, { status: 400 })
    }

    // Users can only manage their own subscriptions (unless admin)
    if (auth.user.role !== 'super_admin' && auth.user.userId !== userId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const existing = await db.subscription.findFirst({
      where: { userId, storeId: storeId || undefined, status: 'active' },
    })

    if (existing) {
      const updated = await db.subscription.update({
        where: { id: existing.id },
        data: { planId, status: status || 'active', startDate: new Date() },
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true, slug: true } },
          plan: { select: { id: true, name: true, price: true } },
        },
      })
      return NextResponse.json(updated)
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        storeId: storeId || null,
        planId,
        status: status || 'active',
        startDate: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/subscriptions - Auth required
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, planId, status } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (planId) data.planId = planId
    if (status) {
      data.status = status
      if (status === 'cancelled') data.endDate = new Date()
    }

    const subscription = await db.subscription.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, slug: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    })

    return NextResponse.json(subscription)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
