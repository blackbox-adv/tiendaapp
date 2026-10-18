import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

/**
 * Importador de Excel (Fase 1) — mapeo guardado por tienda.
 * GET    /api/store-import?storeId=...  -> mapeo actual (o null)
 * DELETE /api/store-import?storeId=...  -> olvida el mapeo (empezar de nuevo)
 */

async function authorize(request: NextRequest, storeId: string | null) {
  const auth = await authenticateRequest(request);
  if (auth.error || !auth.user) return { error: apiError('No autorizado', 401, undefined, request) as NextResponse };
  if (!storeId) return { error: apiError('storeId es requerido', 400, undefined, request) as NextResponse };

  const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } });
  if (!store) return { error: apiError('Tienda no encontrada', 404, undefined, request) as NextResponse };
  if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
    return { error: apiError('No tienes permisos para esta tienda', 403, undefined, request) as NextResponse };
  }
  return { userId: auth.user.userId };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const gate = await authorize(request, storeId);
    if (gate.error) return gate.error;

    const record = await db.storeImportMapping.findUnique({
      where: { storeId: storeId! },
      select: {
        mapping: true,
        missingAction: true,
        lastFileName: true,
        lastImportAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess(record, 200, request);
  } catch (error) {
    console.error('Get import mapping error:', error);
    return apiError('Error al obtener el mapeo de importación', 500, undefined, request);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const gate = await authorize(request, storeId);
    if (gate.error) return gate.error;

    await db.storeImportMapping.deleteMany({ where: { storeId: storeId! } });
    return apiSuccess({ ok: true }, 200, request);
  } catch (error) {
    console.error('Delete import mapping error:', error);
    return apiError('Error al olvidar el mapeo', 500, undefined, request);
  }
}
