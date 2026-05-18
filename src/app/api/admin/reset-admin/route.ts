import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/admin/reset-admin - Reset super_admin password
// SECURITY: Only works when called with a secret key in the body
// This is a one-time setup/maintenance endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secretKey, newPassword } = body

    // Require a secret key to prevent unauthorized access
    // The secret key is the user's own JWT_SECRET env var
    const envSecret = process.env.JWT_SECRET
    if (!envSecret) {
      return apiError('JWT_SECRET no configurado', 500, undefined, request)
    }

    if (secretKey !== envSecret) {
      return apiError('Clave secreta invalida', 401, undefined, request)
    }

    const password = newPassword && newPassword.length >= 6 ? newPassword : 'admin123'

    // Find the super_admin user
    const admin = await db.user.findFirst({
      where: { role: 'super_admin' },
    })

    if (!admin) {
      return apiError('No existe usuario super_admin. Ejecuta /api/setup primero.', 404, undefined, request)
    }

    // Update password and increment tokenVersion to invalidate all existing sessions
    const hashedPassword = await hashPassword(password)
    await db.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 },
      },
    })

    return apiSuccess(
      {
        message: 'Contraseña de admin actualizada exitosamente',
        email: admin.email,
        hint: 'Usa estas credenciales para iniciar sesion',
      },
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[RESET-ADMIN] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error reseteando contraseña de admin', 500, undefined, request)
  }
}

// OPTIONS /api/admin/reset-admin - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
