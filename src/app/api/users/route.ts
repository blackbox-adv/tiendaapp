import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, hashPassword, requireRole } from '@/lib/auth'
import { validateBody, registerSchema, updateUserSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'
import { sendWelcomeEmail } from '@/lib/email'
import { serializeDecimals } from '@/lib/utils'

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        include: {
          stores: { select: { id: true, name: true, slug: true, isActive: true } },
          subscriptions: {
            include: { plan: { select: { id: true, name: true, price: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count(),
    ])

    // Remove password from response
    const safeUsers = users.map(({ password: _, ...user }) => user)
    return apiSuccess(serializeDecimals({
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }), 200, request)
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
      return apiError('Este email ya esta registrado. Intenta iniciar sesion con tu cuenta existente.', 409, undefined, request)
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
    const errMsg = error instanceof Error ? error.message : String(error)
    const errCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined
    const errMeta = error && typeof error === 'object' && 'meta' in error ? (error as { meta: unknown }).meta : undefined

    console.error('[USERS] POST error:', errMsg, { code: errCode, meta: errMeta })

    // Handle Prisma unique constraint violation (P2002)
    if (errCode === 'P2002') {
      return apiError('Este email ya esta registrado. Intenta iniciar sesion con tu cuenta existente.', 409, undefined, request)
    }

    // Include Prisma error code and meta for debugging (safe to expose - no user data)
    const details = errCode ? { prismaCode: errCode, hint: String(errMeta || '').substring(0, 200) } : undefined

    return apiError('Error creando usuario. Intenta de nuevo o contacta soporte.', 500, details, request)
  }
}

// PUT /api/users - Update user (auth required, admin can update anyone, user can update self)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
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
      delete (data as Record<string, unknown>).role
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

    return apiSuccess(serializeDecimals(safeUser), 200, request)
  } catch (error: unknown) {
    console.error('[USERS] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando usuario', 500, undefined, request)
  }
}

// DELETE /api/users - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  // Only super_admin can delete users
  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores pueden eliminar usuarios.', 403, undefined, request)
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return apiError('ID de usuario requerido', 400, undefined, request)
    }

    // Prevent deleting yourself
    if (auth.user.userId === userId) {
      return apiError('No puedes eliminar tu propia cuenta.', 400, undefined, request)
    }

    // Check user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        stores: { select: { id: true, name: true } },
        subscriptions: { select: { id: true } },
      },
    })

    if (!user) {
      return apiError('Usuario no encontrado', 404, undefined, request)
    }

    // Prevent deleting other super_admins (safety measure)
    if (user.role === 'super_admin') {
      return apiError('No puedes eliminar otros administradores.', 403, undefined, request)
    }

    // Delete in transaction — cascades handle: stores → products, subscriptions → payments
    // Payment.userId has onDelete: SetNull, but payments are cascade-deleted via subscription first
    await db.user.delete({
      where: { id: userId },
    })

    auditLog({
      action: 'USER_DELETE',
      userId: auth.user.userId,
      userEmail: auth.user.email,
      ip: getClientIp(request),
      details: { deletedUserId: userId, deletedUserEmail: user.email, deletedUserName: user.name, deletedStores: user.stores.length },
      success: true,
      statusCode: 200,
    })

    return apiSuccess({ message: `Usuario "${user.name}" eliminado correctamente`, deletedUserId: userId }, 200, request)
  } catch (error: unknown) {
    console.error('[USERS] DELETE error:', error instanceof Error ? error.message : String(error))
    return apiError('Error eliminando usuario. Puede tener datos relacionados que impiden la eliminación.', 500, undefined, request)
  }
}

// OPTIONS /api/users - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
