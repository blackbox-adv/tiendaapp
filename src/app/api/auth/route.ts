import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyPassword, generateToken, verifyToken } from '@/lib/auth'
import { validateBody, loginSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'

// POST /api/auth - Login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateBody(loginSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }
    const { email, password } = validation.data
    const clientIp = getClientIp(request)

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user) {
      auditLog({ action: 'LOGIN_FAILED', userEmail: email.toLowerCase(), ip: clientIp, details: { reason: 'user_not_found' }, success: false, statusCode: 401 })
      return apiError('Usuario no encontrado', 401, undefined, request)
    }

    if (!user.isActive) {
      auditLog({ action: 'LOGIN_FAILED', userId: user.id, userEmail: user.email, ip: clientIp, details: { reason: 'account_disabled' }, success: false, statusCode: 403 })
      return apiError('Cuenta desactivada. Contacta soporte.', 403, undefined, request)
    }

    let isMatch = false
    try {
      isMatch = await verifyPassword(password, user.password)
    } catch {
      return apiError('Error de autenticacion', 500, undefined, request)
    }

    if (!isMatch) {
      auditLog({ action: 'LOGIN_FAILED', userId: user.id, userEmail: user.email, ip: clientIp, details: { reason: 'wrong_password' }, success: false, statusCode: 401 })
      return apiError('Contrasena incorrecta', 401, undefined, request)
    }

    // Update last login
    await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    auditLog({ action: 'LOGIN_SUCCESS', userId: user.id, userEmail: user.email, ip: clientIp, details: { role: user.role }, success: true, statusCode: 200 })

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
