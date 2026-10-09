// TEMPORAL - ELIMINAR DESPUES DE USAR (emergency access restore, owner-requested)
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'

const SECRET = 'cad39540e0af9e19ad7e9d5e43ac4e5549bbe875a98cff0a'
const ALLOWED = ['admin@tiendapp.com']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, email, newPassword } = body
    if (secret !== SECRET) return apiError('No autorizado', 401)
    if (!ALLOWED.includes(email)) return apiError('Usuario no permitido', 403)
    if (!newPassword || newPassword.length < 8) return apiError('Clave muy corta', 400)

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || user.role !== 'super_admin') return apiError('No es super_admin', 403)

    const hashed = await hashPassword(newPassword)
    await db.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashed, tokenVersion: { increment: 1 } },
    })
    return apiSuccess({ ok: true, email: user.email })
  } catch {
    return apiError('Error', 500)
  }
}
