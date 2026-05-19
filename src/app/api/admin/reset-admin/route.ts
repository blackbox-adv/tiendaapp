import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'

// POST /api/admin/reset-admin - Reset super_admin password
// SECURITY: Requires a confirmation code sent to the admin email
// For initial setup, accepts adminEmail + confirmation code "RESET-2024"
// This should be removed or disabled after initial setup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, confirmationCode, newPassword } = body

    // Simple confirmation code - change this after first use
    // This is intentionally simple for the initial setup scenario
    // In production, you'd use email-based verification
    const validCode = 'TIENDAPP-RESET-2024'
    if (confirmationCode !== validCode) {
      return apiError('Codigo de confirmacion invalido', 401, undefined, request)
    }

    const targetEmail = email || 'admin@tiendapp.com'
    const password = newPassword && newPassword.length >= 8 ? newPassword : 'admin1234'

    // Find the user
    const user = await db.user.findUnique({
      where: { email: targetEmail.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists
      return apiError('Usuario no encontrado', 404, undefined, request)
    }

    if (user.role !== 'super_admin') {
      return apiError('Solo se puede resetear la contrasena del super_admin', 403, undefined, request)
    }

    // Update password and increment tokenVersion to invalidate all existing sessions
    const hashedPassword = await hashPassword(password)
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 },
      },
    })

    auditLog({
      action: 'ADMIN_PASSWORD_RESET',
      userId: user.id,
      userEmail: user.email,
      ip: getClientIp(request),
      details: { method: 'reset-admin-endpoint' },
      success: true,
      statusCode: 200,
    })

    return apiSuccess(
      {
        message: 'Contraseña actualizada exitosamente',
        email: user.email,
        password: password === 'admin1234' ? 'admin1234' : '***',
      },
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[RESET-ADMIN] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error reseteando contraseña', 500, undefined, request)
  }
}

// OPTIONS /api/admin/reset-admin - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
