import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Find free plan for initial subscription
    const freePlan = await db.plan.findFirst({ where: { type: 'free' } });

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        onboardingDone: false,
      },
    });

    // Test A/B: atribuir el registro a la variante del visitante (cookie)
    try {
      const abMatch = request.headers.get('cookie')?.match(/(?:^|;\s*)tiendapp_ab=([AB])/);
      if (abMatch) {
        await db.auditLog.create({
          data: {
            action: 'AB_EVENT',
            details: { event: 'register', variant: abMatch[1] },
            success: true,
          },
        });
      }
    } catch {
      // el tracking nunca rompe el registro
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(name, email).catch((err) => {
      console.error('[REGISTER] Welcome email failed (non-blocking):', err);
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingDone: user.onboardingDone,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    );
  }
}
