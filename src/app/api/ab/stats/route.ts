import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError } from '@/lib/api-response';

// Resultados del test A/B de la landing — solo para admins.
// Devuelve por variante: vistas, clicks en CTA, registros y tasas de conversión.
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }
    if (auth.user.role !== 'super_admin' && auth.user.role !== 'admin') {
      return apiError('Solo administradores', 403, undefined, request);
    }

    const rows = await db.$queryRawUnsafe<
      { variant: string; event: string; count: number }[]
    >(
      `SELECT details->>'variant' AS variant, details->>'event' AS event, COUNT(*)::int AS count
       FROM "AuditLog"
       WHERE action = 'AB_EVENT'
       GROUP BY 1, 2`
    );

    const stats: Record<
      string,
      { views: number; ctaClicks: number; registers: number }
    > = {
      A: { views: 0, ctaClicks: 0, registers: 0 },
      B: { views: 0, ctaClicks: 0, registers: 0 },
    };

    for (const row of rows) {
      const v = row.variant === 'B' ? 'B' : 'A';
      if (row.event === 'view') stats[v].views = row.count;
      else if (row.event === 'cta_click') stats[v].ctaClicks = row.count;
      else if (row.event === 'register') stats[v].registers = row.count;
    }

    const result = (['A', 'B'] as const).map((v) => {
      const s = stats[v];
      return {
        variant: v,
        ...s,
        ctaRate: s.views > 0 ? Math.round((s.ctaClicks / s.views) * 1000) / 10 : 0,
        registerRate: s.views > 0 ? Math.round((s.registers / s.views) * 10000) / 100 : 0,
      };
    });

    return NextResponse.json({
      variants: result,
      startedAt: new Date().toISOString(),
      note: 'Gana la variante con mejor registerRate (registros por visita). Mínimo ~100 vistas por variante para decidir.',
    });
  } catch (error) {
    console.error('AB stats error:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
