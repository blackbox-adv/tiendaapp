import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError } from '@/lib/api-response';

// Acceso a una categoria: verificar que pertenece a una tienda del usuario
// (dueno o super_admin). Cierra IDOR multi-tenant en PUT/DELETE.
async function canManageCategory(userId: string, role: string, categoryId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: { id: true, storeId: true, store: { select: { ownerId: true } } },
  });
  if (!category) return { category: null, allowed: false };
  if (role === 'super_admin') return { category, allowed: true };
  return { category, allowed: category.store.ownerId === userId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { id } = await params;
    const category = await db.category.findUnique({ where: { id } });

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    if (auth.user.role !== 'super_admin') {
      const store = await db.store.findUnique({
        where: { id: category.storeId },
        select: { ownerId: true },
      });
      const isOwner = !!store && store.ownerId === auth.user.userId;
      let isEmployee = false;
      if (!isOwner && auth.user.role === 'store_employee' && store) {
        const member = await db.storeMember.findFirst({
          where: { userId: auth.user.userId, storeId: category.storeId, isActive: true },
          select: { id: true },
        });
        isEmployee = !!member;
      }
      if (!isOwner && !isEmployee) {
        return apiError('No tienes permisos para esta categoria', 403, undefined, request);
      }
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json({ error: 'Error al obtener categoría' }, { status: 500 });
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
    const { category, allowed } = await canManageCategory(auth.user.userId, auth.user.role, id);

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    if (!allowed) {
      return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request);
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'icon'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (typeof updateData.name === 'string') updateData.name = updateData.name.trim().slice(0, 60);
    if (typeof updateData.icon === 'string') updateData.icon = updateData.icon.slice(0, 16);

    const updated = await db.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
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
    const { category, allowed } = await canManageCategory(auth.user.userId, auth.user.role, id);

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    if (!allowed) {
      return apiError('Acceso denegado. No eres dueno de esta tienda.', 403, undefined, request);
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}
