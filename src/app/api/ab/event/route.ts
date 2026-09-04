import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Registra eventos del test A/B de la landing (view / cta_click).
// Público (la landing no requiere auth); los 'register' los registra
// directamente /api/auth/register leyendo la cookie tiendapp_ab.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, variant } = body;

    if (event !== 'view' && event !== 'cta_click') {
      return NextResponse.json({ error: 'Evento inválido' }, { status: 400 });
    }
    if (variant !== 'A' && variant !== 'B') {
      return NextResponse.json({ error: 'Variante inválida' }, { status: 400 });
    }

    await db.auditLog.create({
      data: {
        action: 'AB_EVENT',
        details: { event, variant },
        success: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // El tracking nunca debe romper la página
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
