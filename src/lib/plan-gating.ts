// ============================================================
// GATING DE PLANTILLAS POR PLAN (server-side)
// Las plantillas premium son exclusivas del plan Premium.
// Protege el negocio: un usuario Free/Pro no puede asignarse
// una plantilla premium ni siquiera llamando a la API directo.
// ============================================================

import { db } from '@/lib/db'

export const PREMIUM_TEMPLATES: string[] = ['luxury', 'minimalist', 'bodega', 'sabor', 'moda']

export const VALID_TEMPLATES: string[] = ['moderna', 'vibrante', 'clasica', ...PREMIUM_TEMPLATES]

// Obtiene el tipo de plan activo del usuario ('free' si no tiene suscripción activa)
export async function getUserPlanType(userId: string): Promise<string> {
  try {
    const rows = await db.$queryRawUnsafe(`
      SELECT pl.type FROM "Subscription" sub
      JOIN "Plan" pl ON pl.id = sub."planId"
      WHERE sub."userId" = $1 AND sub.status = 'active'
      ORDER BY sub."createdAt" DESC LIMIT 1
    `, userId) as Array<{ type?: string }>
    if (Array.isArray(rows) && rows.length > 0 && rows[0].type) {
      return rows[0].type
    }
  } catch {
    /* si falla la consulta, queda 'free' (más seguro para el negocio) */
  }
  return 'free'
}

// Verifica si el usuario puede usar la plantilla pedida.
// Devuelve null si está permitido, o el error listo para responder.
export async function checkTemplatePermission(
  userId: string,
  template: unknown,
  role?: string
): Promise<{ status: number; error: string; code: string } | null> {
  if (role === 'super_admin') return null
  if (typeof template !== 'string' || !VALID_TEMPLATES.includes(template)) {
    return { status: 400, error: 'Plantilla no valida', code: 'INVALID_TEMPLATE' }
  }
  if (PREMIUM_TEMPLATES.includes(template)) {
    const planType = await getUserPlanType(userId)
    if (planType !== 'premium') {
      return {
        status: 403,
        error: 'Esta plantilla esta disponible en el plan Premium. Actualiza tu plan desde "Mi Plan".',
        code: 'PLAN_REQUIRED',
      }
    }
  }
  return null
}
