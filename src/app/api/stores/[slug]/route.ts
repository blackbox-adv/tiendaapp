import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = await db.store.findUnique({
      where: { slug },
      include: {
        products: true,
        categories: true,
        _count: {
          select: { products: true, categories: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { slug } = await params;
    const body = await request.json();

    const store = await db.store.findUnique({
      where: { slug },
      include: { users: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    const userId = auth.user.userId;
    const isOwner = store.users.some((u) => u.userId === userId && u.role === 'owner');

    if (!isOwner) {
      return NextResponse.json({ error: 'No tienes permisos para editar esta tienda' }, { status: 403 });
    }

    const updateData: any = {};
    const allowedFields = ['name', 'description', 'template', 'whatsapp', 'email', 'address', 'logo', 'banner'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedStore = await db.store.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Update store error:', error);
    return NextResponse.json({ error: 'Error al actualizar la tienda' }, { status: 500 });
  }
}
