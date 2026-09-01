import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;

    await db.user.update({
      where: { id: userId },
      data: { onboardingDone: true },
    });

    return apiSuccess({ message: 'Onboarding completado', onboardingDone: true }, 200, request);
  } catch (error) {
    console.error('Onboarding error:', error);
    return apiError('Error al actualizar onboarding', 500, undefined, request);
  }
}
