import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, settingsSchema, ALLOWED_SETTING_KEYS } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { v4 as uuidv4 } from 'uuid'

// GET /api/settings - Public
export async function GET(request: NextRequest) {
  try {
    let settings: Record<string, string> = {}

    try {
      // Use raw SQL without parameters for PgBouncer compatibility
      const rows = await db.$queryRawUnsafe(
        `SELECT "key", "value" FROM "PlatformSetting"`
      ) as Array<{ key: string; value: string }>
      for (const row of rows) {
        settings[row.key] = row.value
      }
    } catch {
      // Table doesn't exist yet or error, use defaults
    }

    const defaults: Record<string, string> = {
      name: 'TiendApp',
      defaultPlanId: 'free',
      maintenanceMode: 'false',
      registrationsEnabled: 'true',
      whatsappSupport: '+51999999999',
      currency: 'PEN',
      countryCode: 'PE',
      contactEmail: 'hola@tiendapp.pe',
      contactPhone: '+51999888777',
    }

    return apiSuccess({ ...defaults, ...settings }, 200, request)
  } catch {
    return apiSuccess(
      {
        name: 'TiendApp',
        defaultPlanId: 'free',
        maintenanceMode: 'false',
        registrationsEnabled: 'true',
        whatsappSupport: '+51999999999',
        currency: 'PEN',
        countryCode: 'PE',
        contactEmail: 'hola@tiendapp.pe',
        contactPhone: '+51999888777',
      },
      200,
      request
    )
  }
}

// PUT /api/settings - Admin only
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
  }

  try {
    const body = await request.json()
    const validation = validateBody(settingsSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const entries = Object.entries(validation.data)

    // Only allow whitelisted keys
    const filteredEntries = entries.filter(([key]) => ALLOWED_SETTING_KEYS.has(key))

    if (filteredEntries.length === 0) {
      return apiError('No se proporcionaron configuraciones validas', 400, undefined, request)
    }

    // Use raw SQL without parameters for PgBouncer compatibility
    // Validate key format to prevent SQL injection (alphanumeric + underscore only)
    for (const [key, value] of filteredEntries) {
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        console.warn('[SETTINGS] Invalid key format:', key)
        continue
      }

      const id = uuidv4()
      // Escape single quotes in value to prevent SQL injection
      const safeValue = String(value).replace(/'/g, "''")

      await db.$executeRawUnsafe(
        `INSERT INTO "PlatformSetting" ("id", "key", "value", "updatedAt") ` +
        `VALUES ('${id}', '${key}', '${safeValue}', CURRENT_TIMESTAMP) ` +
        `ON CONFLICT ("key") ` +
        `DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = CURRENT_TIMESTAMP`
      )
    }

    return apiSuccess({ success: true, updated: filteredEntries.length }, 200, request)
  } catch (error: unknown) {
    console.error('[SETTINGS] PUT error:', error instanceof Error ? error.message : String(error))
    console.error('[SETTINGS] PUT stack:', error instanceof Error ? error.stack : 'no stack')
    return apiError('Error actualizando configuracion', 500, undefined, request)
  }
}

// OPTIONS /api/settings - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
