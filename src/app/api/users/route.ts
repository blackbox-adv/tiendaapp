import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, hashPassword } from '@/lib/auth'

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const users = await db.user.findMany({
      include: {
        stores: { select: { id: true, name: true, slug: true, isActive: true } },
        subscriptions: {
          include: { plan: { select: { id: true, name: true, price: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Remove password from response
    const safeUsers = users.map(({ password: _, ...user }) => user)

    return NextResponse.json(safeUsers)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching users'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/users - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'email, password y name son requeridos' },
        { status: 400 },
      )
    }

    // Check duplicate
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'store_owner',
        phone: phone || null,
      },
      include: {
        stores: true,
        subscriptions: true,
      },
    })

    // Remove password from response
    const { password: _, ...safeUser } = user

    return NextResponse.json(safeUser, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating user'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/users - Update user (auth required, admin can update anyone, user can update self)
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { id, password, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    // Only admin or self can update
    if (auth.user.role !== 'super_admin' && auth.user.userId !== id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Hash password if provided
    if (password) {
      data.password = await hashPassword(password)
    }

    const user = await db.user.update({
      where: { id },
      data,
      include: {
        stores: true,
        subscriptions: true,
      },
    })

    // Remove password from response
    const { password: _, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating user'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
