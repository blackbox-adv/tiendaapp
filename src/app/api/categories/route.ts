import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

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

    const category = await db.category.create({
      data: {
        name,
        icon: icon || null,
        storeId,
      },
    });

    return apiSuccess(category, 201, request);
  } catch (error) {
    console.error('Create category error:', error);
    return apiError('Error al crear categoria', 500, undefined, request);
  }
}
