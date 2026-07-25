import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeDecimals } from '@/lib/utils';
import { validateBody, updateProductSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.storeProduct.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeDecimals(product));
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateBody(updateProductSchema, body);
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request);
    }

    // Verify product ownership
    const product = await db.storeProduct.findUnique({ where: { id }, select: { storeId: true } });
    if (!product) {
      return apiError('Producto no encontrado', 404, undefined, request);
    }
    const store = await db.store.findUnique({ where: { id: product.storeId }, select: { ownerId: true } });
    if (!store || (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin')) {
      return apiError('No tienes permisos para editar este producto', 403, undefined, request);
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'price', 'originalPrice', 'imageUrl', 'category', 'color', 'isActive', 'featured'];
    const data = validation.data;

    for (const field of allowedFields) {
      if (data[field as keyof typeof data] !== undefined) {
        updateData[field] = data[field as keyof typeof data];
      }
    }

    const updatedProduct = await db.storeProduct.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(serializeDecimals(updatedProduct), 200, request);
  } catch (error) {
    console.error('Update product error:', error);
    return apiError('Error al actualizar producto', 500, undefined, request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { id } = await params;

    // Verify ownership before delete
    const product = await db.storeProduct.findUnique({ where: { id }, select: { storeId: true } });
    if (!product) {
      return apiError('Producto no encontrado', 404, undefined, request);
    }
    const store = await db.store.findUnique({ where: { id: product.storeId }, select: { ownerId: true } });
    if (!store || (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin')) {
      return apiError('No tienes permisos', 403, undefined, request);
    }

    await db.storeProduct.delete({ where: { id } });

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
