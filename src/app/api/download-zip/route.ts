import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// GET /api/download-zip - Admin only: download store data as zip placeholder
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json({ error: 'storeId es requerido' }, { status: 400 })
    }

    // Placeholder: In production this would generate a real ZIP with store data
    return NextResponse.json({
      message: 'Función de descarga ZIP disponible para administradores.',
      storeId,
      note: 'En producción, este endpoint generaría un archivo ZIP con los datos de la tienda.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error generating download'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
