import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeDecimals } from '@/lib/utils';
import { checkTemplatePermission } from '@/lib/plan-gating';

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

    // Increment visit count (fire-and-forget)
    db.store.update({ where: { slug }, data: { visitCount: { increment: 1 } } }).catch(() => {});

    return NextResponse.json(serializeDecimals(store));
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
    });

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    // Check ownership: store.ownerId must match auth.user.userId (or super_admin)
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No tienes permisos para editar esta tienda' }, { status: 403 });
    }

    // ── Gating: plantillas premium solo para plan Premium ──
    if (body.template !== undefined) {
      const templateError = await checkTemplatePermission(auth.user.userId, body.template, auth.user.role);
      if (templateError) {
        return NextResponse.json(
          { error: templateError.error, code: templateError.code },
          { status: templateError.status }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'template', 'primaryColor', 'secondaryColor', 'category', 'logo', 'bannerUrl', 'whatsappNumber', 'hasShipping', 'hasSecurePayment', 'hasReturns', 'popupEnabled', 'popupType', 'popupProductId', 'popupCustomImage', 'popupTitle', 'popupButtonText', 'yapeQrUrl', 'plinQrUrl', 'yapeNumber', 'plinNumber'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedStore = await db.store.update({
      where: { slug },
      data: updateData,
    });

    return apiSuccess(serializeDecimals(updatedStore), 200, request);
  } catch (error) {
    console.error('Update store error:', error);
    return NextResponse.json({ error: 'Error al actualizar la tienda' }, { status: 500 });
  }
}
