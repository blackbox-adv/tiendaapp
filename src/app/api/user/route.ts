import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingDone: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            template: true,
            logo: true,
            whatsappNumber: true,
            category: true,
            primaryColor: true,
            secondaryColor: true,
            hasShipping: true,
            hasSecurePayment: true,
            hasReturns: true,
            popupEnabled: true,
            popupType: true,
            popupButtonText: true,
            isDemo: true,
            isActive: true,
            _count: {
              select: {
                products: true,
                categories: true,
              },
            },
          },
        },
        subscriptions: {
          where: { status: 'active' },
          select: {
            id: true,
            status: true,
            plan: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true,
                maxProducts: true,
                features: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return apiSuccess({
      ...user,
      subscriptions: user.subscriptions.map(sub => ({
        ...sub,
        plan: {
          ...sub.plan,
          price: Number(sub.plan.price),
          features: sub.plan.features,
        },
      })),
    }, 200, request);
  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Error al obtener usuario', 500, undefined, request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'phone', 'avatar'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingDone: true,
        avatar: true,
        phone: true,
      },
    });

    return apiSuccess(user, 200, request);
  } catch (error) {
    console.error('Update user error:', error);
    return apiError('Error al actualizar usuario', 500, undefined, request);
  }
}
