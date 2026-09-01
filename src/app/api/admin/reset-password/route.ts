import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, hashPassword, requireRole } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/admin/reset-password - Admin resets any user's password
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado', 403, undefined, request)
  }

  try {
    const body = await request.json()
    const { userId, newPassword } = body

    if (!userId || !newPassword || newPassword.length < 8) {
      return apiError('userId y newPassword (min 8 chars) requeridos', 400, undefined, request)
    }

    const hashedPassword = await hashPassword(newPassword)

    // Use raw SQL to avoid PgBouncer include issues
    await db.$queryRawUnsafe(`
      UPDATE "User" SET password = $1, "tokenVersion" = "tokenVersion" + 1, "updatedAt" = NOW()
      WHERE id = $2
    `, hashedPassword, userId)

    return apiSuccess({ message: 'Contraseña actualizada exitosamente' }, 200, request)
  } catch (error: unknown) {
    console.error('[ADMIN-RESET-PW] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error reseteando contraseña', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
