// TEMPORARY ENDPOINT - Delete after use!
// This resets the super_admin password without requiring auth.
// Protected by a shared secret.
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api-response'

const TEMP_SECRET = 'tiendapp-emergency-reset-2024'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, email, newPassword } = body

    // Require a shared secret to prevent abuse
    if (secret !== TEMP_SECRET) {
      return apiError('Secret invalido', 403, undefined, request)
    }

    if (!email || !newPassword) {
      return apiError('Email y nueva contraseña son requeridos', 400, undefined, request)
    }

    if (newPassword.length < 8) {
      return apiError('La contraseña debe tener al menos 8 caracteres', 400, undefined, request)
    }

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
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 },
      },
    })

    return apiSuccess({ message: `Contraseña actualizada para ${user.email}` }, 200, request)
  } catch (error: unknown) {
    console.error('[FIX-RESET] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error reseteando contraseña', 500, undefined, request)
  }
}
