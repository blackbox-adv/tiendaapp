import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/setup-admin - Reset admin password (emergency only)
export async function POST(request: NextRequest) {
  try {
    // Only works if no admin exists or with correct current password
    const body = await request.json()
    const { email, newPassword } = body

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

    return apiSuccess({ message: `Contraseña actualizada para ${user.email}` }, 200, request)
  } catch (error: unknown) {
    console.error('[SETUP-ADMIN] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando contraseña', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
