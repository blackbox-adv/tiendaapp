import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError } from '@/lib/api-response';

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

    return NextResponse.json({ message: 'Onboarding completado' });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar onboarding' },
      { status: 500 }
    );
  }
}
