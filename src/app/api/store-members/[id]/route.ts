import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest, hashPassword } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { getUserPlanType } from '@/lib/plan-gating'
import { resolveStoreForUser } from '@/lib/store-access'

// ============================================================
// Empleado individual (dueno de la tienda, Premium).
// PATCH  /api/store-members/[id] — editar { name?, whatsappNumber?, isActive?, password? }
// DELETE /api/store-members/[id] — desactivar (soft: conserva historial de chat)
// ============================================================

async function requireOwnerPremium(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error || !auth.user) {
    return { ok: false as const, response: apiError(auth.error || 'No autorizado', 401, undefined, request) }
  }
  if (auth.user.role !== 'store_owner' && auth.user.role !== 'owner') {
    return { ok: false as const, response: apiError('Solo el dueno de la tienda puede gestionar empleados', 403, undefined, request) }
  }
  const plan = await getUserPlanType(auth.user.userId)
  if (plan !== 'premium') {
    return { ok: false as const, response: apiError('Los empleados estan disponibles en el plan Premium.', 403, undefined, request) }
  }
  const access = await resolveStoreForUser(auth.user.userId, auth.user.role)
  if (!access || !access.isOwner) {
    return { ok: false as const, response: apiError('No tienes una tienda propia', 403, undefined, request) }
  }
  return { ok: true as const, storeId: access.storeId }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireOwnerPremium(request)
    if (!ctx.ok) return ctx.response

    const { id } = await params
    const member = await db.storeMember.findUnique({ where: { id } })
    if (!member || member.storeId !== ctx.storeId) {
      return apiError('Empleado no encontrado', 404, undefined, request)
    }

    const body = await request.json().catch(() => null)
    const memberData: Record<string, unknown> = {}
    const userData: Record<string, unknown> = {}

    if (body?.name !== undefined) {
      const name = String(body.name).trim()
      if (name.length < 2 || name.length > 60) return apiError('Nombre invalido', 400, undefined, request)
      userData.name = name
    }
    if (body?.whatsappNumber !== undefined) {
      const wa = String(body.whatsappNumber).replace(/[^0-9]/g, '')
      if (wa && (wa.length < 9 || wa.length > 15)) {
        return apiError('Numero de WhatsApp invalido (formato: 51958297236)', 400, undefined, request)
      }
      memberData.whatsappNumber = wa || null
    }
    if (body?.password !== undefined) {
      const password = String(body.password)
      if (password.length < 6) return apiError('La contrasena debe tener al menos 6 caracteres', 400, undefined, request)
      userData.password = await hashPassword(password)
      // Invalida sesiones activas del empleado
      const u = await db.user.findUnique({ where: { id: member.userId }, select: { tokenVersion: true } })
      userData.tokenVersion = (u?.tokenVersion ?? 0) + 1
    }
    if (body?.isActive !== undefined) {
      const active = Boolean(body.isActive)
      memberData.isActive = active
      userData.isActive = active
    }

    if (Object.keys(memberData).length > 0) {
      await db.storeMember.update({ where: { id: member.id }, data: memberData })
    }
    if (Object.keys(userData).length > 0) {
      await db.user.update({ where: { id: member.userId }, data: userData })
    }

    return apiSuccess({ ok: true }, 200, request)
  } catch (error) {
    console.error('StoreMember PATCH error:', error)
    return apiError('Error al actualizar empleado', 500, undefined, request)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireOwnerPremium(request)
    if (!ctx.ok) return ctx.response

    const { id } = await params
    const member = await db.storeMember.findUnique({ where: { id } })
    if (!member || member.storeId !== ctx.storeId) {
      return apiError('Empleado no encontrado', 404, undefined, request)
    }

    // Soft-delete: desactiva membresia y usuario, conserva mensajes del chat
    await db.storeMember.update({ where: { id: member.id }, data: { isActive: false } })
    await db.user.update({ where: { id: member.userId }, data: { isActive: false } })

    return apiSuccess({ ok: true }, 200, request)
  } catch (error) {
    console.error('StoreMember DELETE error:', error)
    return apiError('Error al desactivar empleado', 500, undefined, request)
  }
}
