import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

// Acceso de LECTURA a categorias: dueno, super_admin o empleado activo
// (mismo criterio que GET /api/orders). Mutaciones: solo dueno o super_admin
// (mismo criterio que POST /api/store-products). Cierra IDOR multi-tenant.
async function hasReadAccess(userId: string, role: string, storeId: string): Promise<boolean> {
  if (role === 'super_admin') return true;
  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  });
  if (!store) return false;
  if (store.ownerId === userId) return true;
  if (role === 'store_employee') {
    const member = await db.storeMember.findFirst({
      where: { userId, storeId, isActive: true },
      select: { id: true },
    });
    return !!member;
  }
  return false;
}

async function hasWriteAccess(userId: string, role: string, storeId: string): Promise<boolean> {
  if (role === 'super_admin') return true;
  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  });
  return !!store && store.ownerId === userId;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request);
    }

    if (!(await hasReadAccess(auth.user.userId, auth.user.role, storeId))) {
      return apiError('No tienes permisos para esta tienda', 403, undefined, request);
    }

    const categories = await db.category.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    });

    return apiSuccess(categories, 200, request);
  } catch (error) {
    console.error('Get categories error:', error);
    return apiError('Error al obtener categorias', 500, undefined, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const body = await request.json();
    const { name, icon, storeId } = body;

    if (!name || !storeId) {
      return apiError('Nombre y tienda son requeridos', 400, undefined, request);
    }

    // Ownership: solo el dueno de la tienda (o super_admin) crea categorias
    if (typeof storeId !== 'string' || !(await hasWriteAccess(auth.user.userId, auth.user.role, storeId))) {
      return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request);
    }

    const category = await db.category.create({
      data: {
        name: String(name).trim().slice(0, 60),
        icon: icon ? String(icon).slice(0, 16) : null,
        storeId,
      },
    });

    return apiSuccess(category, 201, request);
  } catch (error) {
    console.error('Create category error:', error);
    return apiError('Error al crear categoria', 500, undefined, request);
  }
}
