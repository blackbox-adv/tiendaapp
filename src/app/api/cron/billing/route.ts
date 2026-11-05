import { NextRequest } from 'next/server'
import { runBillingSweep } from '@/lib/billing-sweep'
import { sendExpiringReminderEmails } from '@/lib/billing-emails'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================
// CRON DIARIO DE FACTURACIÓN — /api/cron/billing
//
// Vercel Cron lo llama 1 vez al día (vercel.json → 13:00 UTC =
// 08:00 hora Perú) con header "Authorization: Bearer $CRON_SECRET".
//
// Hace dos cosas:
//   1) runBillingSweep(): corte automático de planes vencidos
//      (active→past_due con 7 días de gracia; past_due+7d→expired
//      y baja a Free, sin borrar datos). Si un vendedor ya pasó por
//      aquí de forma perezosa, no re-procesa nada.
//   2) sendExpiringReminderEmails(): correos "vence en 7/3/1 días",
//      deduplicados por EmailLog (cada aviso se manda UNA vez).
//      El correo "venció" sale del propio sweep (transición a past_due).
//
// Protegido por CRON_SECRET. Nunca devuelve 500 por un correo
// fallido: los envíos son best-effort y se registran en logs.
// ============================================================

function unauthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') || ''
  if (!secret) {
    return { ok: false as const, reason: 'CRON_SECRET no configurada en el proyecto (Vercel → Environment Variables)' }
  }
  if (auth !== `Bearer ${secret}`) {
    return { ok: false as const, reason: 'Authorization invalida' }
  }
  return { ok: true as const }
}

export async function GET(request: NextRequest) {
  const check = unauthorized(request)
  if (!check.ok) {
    return Response.json({ success: false, error: check.reason }, { status: 401 })
  }

  const startedAt = Date.now()
  try {
    // 1) Corte automático de vencidos (idempotente)
    const sweep = await runBillingSweep()

    // 2) Correos escalonados de vencimiento (7/3/1 días antes)
    const reminders = await sendExpiringReminderEmails()

    // Cobertura: suscripciones activas de pago que siguen vencidas
    // (deberían ser 0 tras el sweep; útil como alerta en el log)
    const stuck = await db.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS c FROM "Subscription" sub
       JOIN "Plan" p ON p.id = sub."planId"
       WHERE sub.status = 'active' AND sub."nextBillingDate" IS NOT NULL
         AND sub."nextBillingDate" <= now() AND p.type != 'free'`
    ) as Array<{ c?: number }>

    const body = {
      success: true,
      ranAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      sweep: { pastDue: sweep.pastDueCount, expired: sweep.expiredCount },
      reminders: { sent7: reminders.sent7, sent3: reminders.sent3, sent1: reminders.sent1 },
      activeOverdueRemaining: Number(stuck?.[0]?.c ?? 0),
    }
    console.log('[CRON-BILLING]', JSON.stringify(body))
    return Response.json(body, { status: 200 })
  } catch (error: unknown) {
    console.error('[CRON-BILLING] error:', error instanceof Error ? error.message : String(error))
    return Response.json({ success: false, error: 'Error interno del cron' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
