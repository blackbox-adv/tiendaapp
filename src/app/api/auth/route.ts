import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { validateBody, loginSchema } from '@/lib/validations'

// POST /api/auth - Login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateBody(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const { email, password } = validation.data

    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Cuenta desactivada. Contacta soporte.' }, { status: 403 })
    }

    // Verify password with bcrypt only
    let isMatch = false
    try {
      isMatch = await verifyPassword(password, user.password)
    } catch {
      return NextResponse.json({ error: 'Error de autenticacion' }, { status: 500 })
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    // Update last login
    await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    })
  } catch (err) {
    console.error('[AUTH] Login error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: 'Error en login' }, { status: 500 })
  }
}

// GET /api/auth - Verify token (check if still valid)
export async function GET(request: Request) {
  const { getTokenFromHeader, verifyToken } = await import('@/lib/auth')
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
  }
  
  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  
  if (!payload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
  
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, isActive: true },
  })
  
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
  }
  
  return NextResponse.json({ user })
}
