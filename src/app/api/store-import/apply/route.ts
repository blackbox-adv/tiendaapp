import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { PLAN_BY_TYPE } from '@/lib/plans';
import {
  parseWorkbook,
  extractRows,
  buildSyncPlan,
  parseStockCell,
  MAX_FILE_BYTES,
  type MappingConfig,
} from '@/lib/excel-import';

/**
 * Importador de Excel — IMPORTACIÓN REAL (el corazón de la Fase 1).
 * POST multipart: { storeId, file, mapping?, missingAction?, saveMapping?, sheetName? }
 *
 * Regla acordada con el dueño: "gana el último que sube". El Excel del
 * usuario es el jefe: se crea lo nuevo, se actualiza lo existente y (si él
 * eligió) se desactiva lo que ya no aparece. Su archivo nunca se modifica.
 */

const VALID_EXT = /\.(xlsx|xls|csv)$/i;

function sanitizeMapping(raw: unknown): MappingConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  const name = String(m.name ?? '').trim();
  const price = String(m.price ?? '').trim();
  if (!name || !price) return null;
  const pick = (k: string) => {
    const v = String(m[k] ?? '').trim();
    return v || undefined;
  };
  return {
    sheetName: pick('sheetName'),
    name: pick('name')!,
    price: pick('price')!,
    stock: pick('stock'),
    code: pick('code'),
    description: pick('description'),
    category: pick('category'),
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const form = await request.formData();
    const storeId = String(form.get('storeId') || '');
    const file = form.get('file');
    const saveMapping = String(form.get('saveMapping') || '1') === '1';
    const missingActionForm = String(form.get('missingAction') || '');
    const sheetNameForm = String(form.get('sheetName') || '');
    const mappingForm = sanitizeMapping(JSON.parse(String(form.get('mapping') || 'null')));

    if (!storeId) return apiError('storeId es requerido', 400, undefined, request);
    if (!(file instanceof File)) return apiError('Adjunta tu archivo de Excel', 400, undefined, request);
    if (file.size > MAX_FILE_BYTES) return apiError('El archivo pesa más de 5 MB.', 400, undefined, request);
    if (!VALID_EXT.test(file.name)) return apiError('Formato no reconocido. Guarda tu archivo como .xlsx, .xls o .csv.', 400, undefined, request);

    const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } });
    if (!store) return apiError('Tienda no encontrada', 404, undefined, request);
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permisos para esta tienda', 403, undefined, request);
    }

    // Mapeo: el del formulario tiene prioridad; si no viene, el guardado.
    let mapping = mappingForm;
    let savedRecord = await db.storeImportMapping.findUnique({ where: { storeId } });
    if (!mapping) {
      const savedMapping = savedRecord?.mapping as MappingConfig | undefined;
      mapping = sanitizeMapping(savedMapping ?? null);
    }
    if (!mapping) {
      return apiError('Primero define tu mapeo de columnas', 400, undefined, request);
    }
    const missingAction = missingActionForm === 'deactivate' || missingActionForm === 'keep'
      ? missingActionForm
      : (savedRecord?.missingAction === 'deactivate' ? 'deactivate' : 'keep');
    if (sheetNameForm) mapping = { ...mapping, sheetName: sheetNameForm };

    // 1) Leer el archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = parseWorkbook(buffer, file.name, mapping.sheetName);
    const { rows, errors } = extractRows(wb, mapping);

    if (!rows.length) {
      const first = errors[0]?.message || 'No se encontraron filas con producto (nombre + precio).';
      return apiError(first, 400, undefined, request);
    }

    // 2) Plan de sincronización en memoria (diff sin tocar BD)
    const existing = await db.storeProduct.findMany({
      where: { storeId },
      select: { id: true, name: true, externalCode: true, isActive: true, price: true, stock: true, description: true, category: true },
    });
    const { ops, seenKeys, duplicateWarnings } = buildSyncPlan(rows, existing);

    const creates = ops.filter((o) => o.kind === 'create');
    const updates = ops.filter((o) => o.kind === 'update');

    // 3) Límite de productos del plan: si el import crearía de más, se aborta
    //    ANTES de escribir nada (sin importaciones a medias).
    const subscription = await db.subscription.findFirst({
      where: { userId: auth.user.userId, storeId, status: 'active' },
      include: { plan: true },
    });
    const maxProducts = subscription?.plan?.maxProducts ?? PLAN_BY_TYPE.free.maxProducts;
    const productCount = existing.length;
    if (maxProducts !== -1 && productCount + creates.length > maxProducts) {
      return apiError(
        `Tu plan permite ${maxProducts} productos y este Excel crearía ${creates.length} nuevos (tendrías ${productCount + creates.length}). Actualiza tu plan o quita filas del Excel.`,
        403,
        undefined,
        request,
      );
    }

    // 4) Ejecutar
    let updated = 0;
    const rowErrors = [...errors];

    for (const op of updates) {
      const current = existing.find((p) => p.id === op.productId)!;
      const data: Record<string, unknown> = { externalCode: op.key, isActive: true };

      if (op.row.name !== current.name) data.name = op.row.name;
      const currentPrice = Number(current.price);
      if (op.row.price !== null && Math.round(op.row.price * 100) / 100 !== Math.round(currentPrice * 100) / 100) {
        data.price = op.row.price;
      }
      if (op.row.stockRaw !== null) {
        const st = parseStockCell(op.row.stockRaw);
        if (st !== null && st !== current.stock) data.stock = st;
      }
      if (op.row.description && op.row.description !== current.description) data.description = op.row.description;
      if (op.row.category && op.row.category !== current.category) data.category = op.row.category;

      // Solo escribir si cambió algo real (cuida updatedAt y el registro de auditoría)
      if (Object.keys(data).length > 2) {
        await db.storeProduct.update({ where: { id: current.id }, data });
      }
      updated++;
    }

    // Crear en bloques (rápido y sin agotar conexiones con catálogos grandes)
    let created = 0;
    const CHUNK = 50;
    for (let i = 0; i < creates.length; i += CHUNK) {
      const chunk = creates.slice(i, i + CHUNK).map((op) => ({
        name: op.row.name,
        price: op.row.price ?? 0,
        stock: op.row.stockRaw !== null ? (parseStockCell(op.row.stockRaw) ?? -1) : -1,
        description: op.row.description || '',
        category: op.row.category || '',
        externalCode: op.key,
        isActive: true,
        storeId,
      }));
      const res = await db.storeProduct.createMany({ data: chunk });
      created += res.count;
    }

    // 5) Ausentes: productos que VENÍAN del Excel y ya no están en el archivo
    const managedBefore = existing.filter((p) => p.externalCode);
    const orphans = managedBefore.filter((p) => !seenKeys.has(p.externalCode!));
    let deactivated = 0;
    let keptMissing = 0;
    if (orphans.length > 0) {
      if (missingAction === 'deactivate') {
        const res = await db.storeProduct.updateMany({
          where: { storeId, id: { in: orphans.map((p) => p.id) }, isActive: true },
          data: { isActive: false },
        });
        deactivated = res.count;
      } else {
        keptMissing = orphans.length;
      }
    }

    // 6) Recordar el mapeo para que la próxima importación sea de UN click
    if (saveMapping) {
      const dataToSave = {
        mapping: mapping as unknown as Record<string, string>,
        missingAction,
        lastFileName: file.name,
        lastImportAt: new Date(),
      };
      await db.storeImportMapping.upsert({ where: { storeId }, create: { storeId, ...dataToSave }, update: dataToSave });
      savedRecord = null;
    }

    return apiSuccess(
      {
        created,
        updated,
        deactivated,
        keptMissing,
        totalRows: rows.length,
        fileName: file.name,
        errors: rowErrors.slice(0, 10),
        errorCount: rowErrors.length,
        duplicateWarnings: duplicateWarnings.slice(0, 5),
        duplicateCount: duplicateWarnings.length,
      },
      200,
      request,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo importar el archivo';
    console.error('Import apply error:', error);
    return apiError(message, 400, undefined, request);
  }
}
