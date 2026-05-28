import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-config';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id;

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
