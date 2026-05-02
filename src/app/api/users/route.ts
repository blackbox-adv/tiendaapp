import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, hashPassword, requireRole } from '@/lib/auth'
import { validateBody, registerSchema, updateUserSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'
import { sendWelcomeEmail } from '@/lib/email'

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
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
    return apiSuccess(safeUsers, 200, request)
  } catch (error: unknown) {
    console.error('[USERS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo usuarios', 500, undefined, request)
  }
}

// POST /api/users - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(registerSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }
    const { email, password, name, phone } = validation.data

    // Check duplicate
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return apiError('El email ya esta registrado', 409, undefined, request)
    }

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
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

    auditLog({ action: 'REGISTER', userId: user.id, userEmail: user.email, ip: getClientIp(request), details: { name }, success: true, statusCode: 201 })

    // Send welcome email (non-blocking - registration succeeds even if email fails)
    sendWelcomeEmail(user.name, user.email)

    return apiSuccess(safeUser, 201, request)
  } catch (error: unknown) {
    console.error('[USERS] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error creando usuario', 500, undefined, request)
  }
}

// PUT /api/users - Update user (auth required, admin can update anyone, user can update self)
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(updateUserSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { id, password, email, ...data } = validation.data

    // Only admin or self can update
    if (!requireRole(auth.user, ['super_admin']) && auth.user.userId !== id) {
      return apiError('Acceso denegado. Solo puedes actualizar tu propia cuenta.', 403, undefined, request)
    }

    // Prevent non-admin from changing role or isActive
    if (!requireRole(auth.user, ['super_admin'])) {
      delete (data as Record<string, unknown>).isActive
    }

    // Build update data
    const updateData: Record<string, unknown> = { ...data }

    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Normalize email if provided
    if (email) {
      updateData.email = email.toLowerCase()
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        stores: true,
        subscriptions: true,
      },
    })

    // Remove password from response
    const { password: _, ...safeUser } = user

    return apiSuccess(safeUser, 200, request)
  } catch (error: unknown) {
    console.error('[USERS] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando usuario', 500, undefined, request)
  }
}

// OPTIONS /api/users - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
