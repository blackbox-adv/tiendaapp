import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeDecimals } from '@/lib/utils';
import { validateBody, createProductSchema } from '@/lib/validations';

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

    const products = await db.storeProduct.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(serializeDecimals(products), 200, request);
  } catch (error) {
    console.error('Get products error:', error);
    return apiError('Error al obtener productos', 500, undefined, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const body = await request.json();
    const validation = validateBody(createProductSchema, body);
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request);
    }

    const { name, description, price, imageUrl, images, category, storeId, originalPrice, color, isActive, featured } = validation.data;

    // Check store ownership
    const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } });
    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request);
    }
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permisos para esta tienda', 403, undefined, request);
    }

    // Check product limit based on plan
    const productCount = await db.storeProduct.count({ where: { storeId } });
    const subscription = await db.subscription.findFirst({
      where: { userId: auth.user.userId, storeId, status: 'active' },
      include: { plan: true },
    });
    const maxProducts = subscription?.plan?.maxProducts || 10;
    if (productCount >= maxProducts) {
      return apiError(`Limite de productos alcanzado (${maxProducts}). Actualiza tu plan.`, 403, undefined, request);
    }

    const product = await db.storeProduct.create({
      data: {
        name,
        description: description || '',
        price,
        originalPrice: originalPrice || null,
        imageUrl: imageUrl || '',
        images: images || [],
        category: category || '',
        color: color || null,
        isActive: isActive ?? true,
        featured: featured ?? false,
        storeId,
      },
    });

    return apiSuccess(serializeDecimals(product), 201, request);
  } catch (error) {
    console.error('Create product error:', error);
    return apiError('Error al crear producto', 500, undefined, request);
  }
}
