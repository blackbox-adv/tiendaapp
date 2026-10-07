import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest, hashPassword } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-response'
import { getUserPlanType } from '@/lib/plan-gating'
import { resolveStoreForUser } from '@/lib/store-access'
import { auditLog, getClientIp } from '@/lib/env'

// ============================================================
// Empleados / vendedoras de la tienda (dueno, Premium).
// GET  /api/store-members           — listar
// POST /api/store-members           — crear { name, email, password, whatsappNumber }
// PATCH/DELETE -> ver /api/store-members/[id]
// El empleado se crea como User(role='store_employee') + StoreMember:
// reusa todo el sistema de auth (JWT, tokenVersion, isActive).
// ============================================================

const MAX_MEMBERS = 5

function emailValid(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 120
}

async function requireOwnerPremium(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error || !auth.user) {
    return { ok: false as const, response: apiError(auth.error || 'No autorizado', 401, undefined, request) }
  }
  if (auth.user.role !== 'store_owner' && auth.user.role !== 'owner') {
    return { ok: false as const, response: apiError('Solo el dueno de la tienda puede gestionar empleados', 403, undefined, request) }
  }
  const access = await resolveStoreForUser(auth.user.userId, auth.user.role)
  if (!access || !access.isOwner) {
    return { ok: false as const, response: apiError('No tienes una tienda propia', 403, undefined, request) }
  }
  const plan = await getUserPlanType(auth.user.userId)
  if (plan !== 'premium') {
    return { ok: false as const, response: apiError('Los empleados estan disponibles en el plan Premium.', 403, undefined, request) }
  }
  return { ok: true as const, storeId: access.storeId, ownerId: auth.user.userId }
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireOwnerPremium(request)
    if (!ctx.ok) return ctx.response

    const members = await db.storeMember.findMany({
      where: { storeId: ctx.storeId },
      orderBy: { createdAt: 'desc' },
    })

    // StoreMember no tiene relación Prisma con User: se resuelve aparte
    const userIds = members.map((m) => m.userId)
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, isActive: true, lastLogin: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    return apiSuccess({
      members: members.map((m) => {
        const u = userMap.get(m.userId)
        return {
          id: m.id,
          name: u?.name || 'Empleado',
          email: u?.email || '',
          whatsappNumber: m.whatsappNumber,
          isActive: m.isActive && (u?.isActive ?? false),
          lastLogin: u?.lastLogin || null,
          createdAt: m.createdAt,
        }
      }),
      max: MAX_MEMBERS,
    }, 200, request)
  } catch (error) {
    console.error('StoreMembers GET error:', error)
    return apiError('Error al cargar empleados', 500, undefined, request)
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireOwnerPremium(request)
    if (!ctx.ok) return ctx.response

    const body = await request.json().catch(() => null)
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const whatsappNumber = String(body?.whatsappNumber || '').replace(/[^0-9]/g, '')

    if (name.length < 2 || name.length > 60) return apiError('Nombre invalido', 400, undefined, request)
    if (!emailValid(email)) return apiError('Email invalido', 400, undefined, request)
    if (password.length < 6) return apiError('La contrasena debe tener al menos 6 caracteres', 400, undefined, request)
    if (whatsappNumber && (whatsappNumber.length < 9 || whatsappNumber.length > 15)) {
      return apiError('Numero de WhatsApp invalido (formato: 51958297236)', 400, undefined, request)
    }

    const count = await db.storeMember.count({ where: { storeId: ctx.storeId, isActive: true } })
    if (count >= MAX_MEMBERS) {
      return apiError(`Alcanzaste el maximo de ${MAX_MEMBERS} empleados activos`, 400, undefined, request)
    }

    const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } })
    if (existingUser) return apiError('Ese email ya esta registrado', 400, undefined, request)

    const user = await db.user.create({
      data: {
        email,
        password: await hashPassword(password),
        name,
        role: 'store_employee',
        isActive: true,
      },
      select: { id: true, name: true, email: true },
    })

    const member = await db.storeMember.create({
      data: {
        storeId: ctx.storeId,
        userId: user.id,
        whatsappNumber: whatsappNumber || null,
        isActive: true,
      },
    })

    auditLog({
      action: 'SETTINGS_UPDATE', userId: ctx.ownerId, userEmail: email, ip: getClientIp(request),
      details: { what: 'employee_created', memberId: member.id }, success: true, statusCode: 201,
    })

    return apiSuccess({
      id: member.id, name: user.name, email: user.email,
      whatsappNumber: member.whatsappNumber, isActive: true,
    }, 201, request)
  } catch (error) {
    console.error('StoreMembers POST error:', error)
    return apiError('Error al crear empleado', 500, undefined, request)
  }
}
