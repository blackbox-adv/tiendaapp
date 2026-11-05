import { db } from '@/lib/db'
import { sendSubscriptionExpiringEmail } from '@/lib/email'

// ============================================================
// CORREOS DE VENCIMIENTO — avisos escalonados 7 / 3 / 1 día
//
// Lo llama el cron diario (/api/cron/billing). Los dedupe se
// guardan en la tabla EmailLog con clave única (kind, subscriptionId):
// el INSERT con ON CONFLICT DO NOTHING devuelve fila solo la PRIMERA
// vez que se intenta enviar ese aviso para esa suscripción — así jamás
// se duplica un correo aunque el cron corra dos veces o compita con
// otra instancia.
//
// El correo "venció" (entrada a los 7 días de gracia) se dispara
// desde src/lib/billing-sweep.ts en la transición active → past_due.
// ============================================================

export interface ReminderResult {
  checkedAt: string
  sent7: number
  sent3: number
  sent1: number
}

// Intenta RESERVAR el envío de forma atómica. Devuelve true si esta
// llamada ganó el derecho a enviar (primera vez); false si ya existía.
// Exportado: billing-sweep.ts lo usa para el correo "venció".
export async function claimEmailOnce(kind: string, subscriptionId: string, userId: string, email: string): Promise<boolean> {
  try {
    const rows = await db.$queryRawUnsafe(
      `INSERT INTO "EmailLog" (id, kind, "subscriptionId", "userId", email, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, now())
       ON CONFLICT ("kind", "subscriptionId") DO NOTHING
       RETURNING id`,
      kind, subscriptionId, userId, email
    ) as unknown[]
    return Array.isArray(rows) && rows.length > 0
  } catch (err) {
    // Tabla inexistente u otro problema de BD: NO enviar (fail-safe,
    // preferimos perder un aviso a spamear). Se loguea para diagnóstico.
    console.error('[BILLING-EMAILS] claimEmailOnce failed:', err instanceof Error ? err.message : String(err))
    return false
  }
}

export async function sendExpiringReminderEmails(): Promise<ReminderResult> {
  const now = new Date()
  const result: ReminderResult = { checkedAt: now.toISOString(), sent7: 0, sent3: 0, sent1: 0 }

  // Suscripciones de pago activas que vencen dentro de los próximos 7 días.
  // daysLeft = ceil: faltan 7.2 días → 8 (aún no), 6.8 → 7 (enviar hoy).
  const rows = await db.$queryRawUnsafe(`
    SELECT sub.id, sub."nextBillingDate", u.id AS "userId", u.name AS "userName",
           u.email AS "userEmail", p.name AS "planName", p.price::float8 AS "planPrice"
    FROM "Subscription" sub
    JOIN "User" u ON u.id = sub."userId"
    JOIN "Plan" p ON p.id = sub."planId"
    WHERE sub.status = 'active'
      AND sub."nextBillingDate" IS NOT NULL
      AND sub."nextBillingDate" > now()
      AND sub."nextBillingDate" <= now() + interval '7 days'
      AND p.type != 'free'
      AND u."isActive" = true
      AND NOT EXISTS (
        SELECT 1 FROM "Subscription" s2
        WHERE s2."userId" = sub."userId"
          AND s2."storeId" = sub."storeId"
          AND s2.status = 'active'
          AND s2."createdAt" > sub."createdAt"
      )
  `) as Array<{
    id: string; nextBillingDate: string | Date; userId: string; userName: string
    userEmail: string; planName: string; planPrice: number
  }>

  for (const r of rows) {
    try {
      const due = new Date(r.nextBillingDate)
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86_400_000)
      if (daysLeft !== 7 && daysLeft !== 3 && daysLeft !== 1) continue

      const kind = `expiring-${daysLeft}`
      const claimed = await claimEmailOnce(kind, r.id, r.userId, r.userEmail)
      if (!claimed) continue

      await sendSubscriptionExpiringEmail(
        r.userName, r.userEmail, r.planName, Number(r.planPrice),
        daysLeft as 7 | 3 | 1, due
      )
      if (daysLeft === 7) result.sent7++
      else if (daysLeft === 3) result.sent3++
      else result.sent1++
    } catch (err) {
      console.error(`[BILLING-EMAILS] Error procesando sub ${r.id}:`, err instanceof Error ? err.message : String(err))
    }
  }

  return result
}
