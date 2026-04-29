import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword, verifyPassword, generateToken, verifyToken, getTokenFromHeader } from '@/lib/auth'
import { validateBody, loginSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight, corsHeaders } from '@/lib/api-response'

// POST /api/auth - Login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateBody(loginSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }
    const { email, password } = validation.data

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user) {
      return apiError('Usuario no encontrado', 401, undefined, request)
    }

    if (!user.isActive) {
      return apiError('Cuenta desactivada. Contacta soporte.', 403, undefined, request)
    }

    let isMatch = false
    try {
      isMatch = await verifyPassword(password, user.password)
    } catch {
      return apiError('Error de autenticacion', 500, undefined, request)
    }

    if (!isMatch) {
      return apiError('Contrasena incorrecta', 401, undefined, request)
    }

    // Update last login
    await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return apiSuccess(
      {
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
      },
      200,
      request
    )
  } catch (err) {
    console.error('[AUTH] Login error:', err instanceof Error ? err.message : String(err))
    return apiError('Error en login', 500, undefined, request)
  }
}

// GET /api/auth - Verify token
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return apiError('Token requerido', 401, undefined, request)
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return apiError('Token invalido', 401, undefined, request)
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return apiError('Usuario no encontrado', 401, undefined, request)
    }

    return apiSuccess({ user }, 200, request)
  } catch (err) {
    console.error('[AUTH] Token verify error:', err instanceof Error ? err.message : String(err))
    return apiError('Error verificando token', 500, undefined, request)
  }
}

// OPTIONS /api/auth - CORS preflight
export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}
