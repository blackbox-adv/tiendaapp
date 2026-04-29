import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'

// POST /api/auth - Login
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Cuenta desactivada. Contacta soporte.' }, { status: 403 })
    }

    // Try bcrypt comparison first, fallback to plaintext for migration
    let isMatch = false
    if (user.password.startsWith('$2')) {
      isMatch = await verifyPassword(password, user.password)
    } else {
      // Legacy plaintext comparison - will be phased out
      isMatch = user.password === password
      if (isMatch) {
        // Auto-migrate: hash the plaintext password
        const hashed = await hashPassword(password)
        await db.user.update({ where: { id: user.id }, data: { password: hashed } })
      }
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
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Error en login', details: msg }, { status: 500 })
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
