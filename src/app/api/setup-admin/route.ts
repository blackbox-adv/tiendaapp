import { db } from '@/lib/db'
import { hashPassword, authenticateRequest, requireRole } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'

// POST /api/setup-admin - Reset admin password (REQUIRES super_admin auth)
export async function POST(request: NextRequest) {
  // CRITICAL: Require super_admin authentication
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo super_admin puede usar este endpoint.', 403, undefined, request)
  }

  try {
    const body = await request.json()
    const { email, newPassword } = body
    const clientIp = getClientIp(request)

    if (!email || !newPassword) {
      return apiError('Email y nueva contraseña son requeridos', 400, undefined, request)
    }

    if (newPassword.length < 8) {
      return apiError('La contraseña debe tener al menos 8 caracteres', 400, undefined, request)
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user) {
      return apiError('Usuario no encontrado', 404, undefined, request)
    }

    if (user.role !== 'super_admin') {
      return apiError('Este endpoint solo funciona para super_admin', 403, undefined, request)
    }

    const hashedPassword = await hashPassword(newPassword)
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    auditLog({ action: 'ADMIN_PASSWORD_RESET', userId: auth.user.userId, userEmail: auth.user.email, ip: clientIp, details: { targetUser: user.email }, success: true, statusCode: 200 })

    return apiSuccess({ message: `Contraseña actualizada para ${user.email}` }, 200, request)
  } catch (error: unknown) {
    console.error('[SETUP-ADMIN] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando contraseña', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
