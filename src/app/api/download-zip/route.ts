import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// GET /api/download-zip - Admin only: download store data as zip placeholder
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
  }

  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request)
    }

    // Validate storeId format
    if (!/^[a-z0-9-]+$/.test(storeId)) {
      return apiError('storeId invalido', 400, undefined, request)
    }

    // Placeholder: In production this would generate a real ZIP with store data
    return apiSuccess(
      {
        message: 'Funcion de descarga ZIP disponible para administradores.',
        storeId,
        note: 'En produccion, este endpoint generaria un archivo ZIP con los datos de la tienda.',
      },
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[DOWNLOAD] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error generando descarga', 500, undefined, request)
  }
}

// OPTIONS /api/download-zip - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
