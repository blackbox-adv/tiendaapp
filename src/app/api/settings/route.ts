import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, settingsSchema, ALLOWED_SETTING_KEYS } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// Helper: ensure PlatformSetting table exists
async function ensureSettingsTable(): Promise<boolean> {
  try {
    // Try a simple query first
    await db.platformSetting.count()
    return true
  } catch {
    // Table doesn't exist, create it
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlatformSetting" (
          "id" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSetting_key_key" ON "PlatformSetting"("key");
        CREATE INDEX IF NOT EXISTS "PlatformSetting_key_idx" ON "PlatformSetting"("key");
      `)
      console.log('[SETTINGS] Created PlatformSetting table')
      return true
    } catch (createErr) {
      console.error('[SETTINGS] Failed to create PlatformSetting table:', createErr instanceof Error ? createErr.message : String(createErr))
      return false
    }
  }
}

// GET /api/settings - Public
export async function GET(request: NextRequest) {
  try {
    let settings: Record<string, string> = {}

    try {
      const dbSettings = await db.platformSetting.findMany()
      for (const s of dbSettings) {
        settings[s.key] = s.value
      }
    } catch {
      // Table doesn't exist yet, use defaults
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

    // Ensure the table exists before trying to upsert
    const tableReady = await ensureSettingsTable()
    if (!tableReady) {
      return apiError('No se pudo acceder a la tabla de configuracion. Ejecuta las migraciones de base de datos.', 500, undefined, request)
    }

    for (const [key, value] of filteredEntries) {
      await db.platformSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
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
