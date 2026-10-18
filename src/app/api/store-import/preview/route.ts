import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { parseWorkbook, MAX_FILE_BYTES } from '@/lib/excel-import';
import { EXCEL_IMPORTER_PLANS } from '@/lib/plans';

/**
 * Importador de Excel — PASO PREVIEW (no toca productos).
 * POST multipart: { storeId, file, sheetName? }
 * Devuelve las columnas detectadas + ejemplos para que el dueño arme su
 * mapeo ("¿'PVP' es el precio?"). La segunda vez ni se usa: el mapeo
 * guardado va directo a /apply.
 */

const VALID_EXT = /\.(xlsx|xls|csv)$/i;

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const form = await request.formData();
    const storeId = String(form.get('storeId') || '');
    const sheetName = String(form.get('sheetName') || '') || undefined;
    const file = form.get('file');

    if (!storeId) return apiError('storeId es requerido', 400, undefined, request);
    if (!(file instanceof File)) return apiError('Adjunta tu archivo de Excel', 400, undefined, request);
    if (file.size > MAX_FILE_BYTES) return apiError('El archivo pesa más de 5 MB. Guárdalo como .xlsx o quita fotos/columnas que sobre.', 400, undefined, request);
    if (!VALID_EXT.test(file.name)) return apiError('Formato no reconocido. Guarda tu archivo como .xlsx, .xls o .csv.', 400, undefined, request);

    const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } });
    if (!store) return apiError('Tienda no encontrada', 404, undefined, request);
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permisos para esta tienda', 403, undefined, request);
    }

    // Gating de plan: el importador es exclusivo Premium (super_admin puede demostrarlo)
    if (auth.user.role !== 'super_admin') {
      const sub = await db.subscription.findFirst({
        where: { userId: auth.user.userId, storeId, status: 'active' },
        include: { plan: true },
      });
      if (!EXCEL_IMPORTER_PLANS.includes(sub?.plan?.type ?? 'free')) {
        return apiError('El importador de Excel es parte del plan Premium. Actualiza tu plan para actualizar tu tienda subiendo tu propio Excel.', 403, 'PLAN_LOCKED', request);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = parseWorkbook(buffer, file.name, sheetName);

    return apiSuccess(
      {
        fileName: wb.fileName,
        sheetNames: wb.sheetNames,
        headers: wb.headers,
        totalRows: wb.rows.length,
      },
      200,
      request,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo leer el archivo';
    console.error('Import preview error:', error);
    return apiError(message, 400, undefined, request);
  }
}
