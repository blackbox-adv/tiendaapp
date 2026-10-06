import { db } from '@/lib/db'
import { decimalToNumber } from '@/lib/utils'
import { sendSubscriptionEmail } from '@/lib/email'

// ============================================================
// BARRIDO DE FACTURACIÓN (vencimiento de planes) — versión lazy
//
// Reemplaza la dependencia del botón manual en el panel admin:
// el barrido corre automáticamente (guard barato) cuando un
// vendedor entra a su panel, al ver su tienda pública o al
// consultar /api/user. También lo sigue usando el admin en
// /api/billing/check.
//
// Máquina de estados (idéntica a la lógica original):
//   active + nextBillingDate vencida  → past_due (7 días de gracia, todo funciona)
//   past_due + 7 días de mora         → expired + se crea suscripción Free activa
//
// Nunca borra datos: al renovar (pago confirmado) todo vuelve solo.
// ============================================================

export interface SweepResult {
  checkedAt: string
  pastDueCount: number
  expiredCount: number
}

// Guarda barata: ¿hay suscripciones por procesar? Usa el índice [status, nextBillingDate].
export async function hasBillingWork(): Promise<boolean> {
  try {
    const rows = await db.$queryRawUnsafe(`
      SELECT 1 FROM "Subscription"
      WHERE (status = 'active' AND "nextBillingDate" IS NOT NULL AND "nextBillingDate" <= now())
         OR (status = 'past_due' AND "nextBillingDate" IS NOT NULL AND "nextBillingDate" <= now() - interval '7 days')
      LIMIT 1
    `) as unknown[]
    return Array.isArray(rows) && rows.length > 0
  } catch {
    return false
  }
}

// Barrido completo. Normalmente no hay nada que procesar (1 query del guard),
// así que llamarlo tras el guard es barato.
export async function runBillingSweep(): Promise<SweepResult> {
  const now = new Date()
  let pastDueCount = 0
  let expiredCount = 0

  // ── 1) Activas con cobro vencido → past_due ──
  const activeSubscriptions = await db.subscription.findMany({
    where: {
      status: 'active',
      nextBillingDate: { lte: now },
      plan: { type: { not: 'free' } },
    },
    include: { user: true, plan: true },
  })

  for (const sub of activeSubscriptions) {
    try {
      await db.$transaction([
        db.subscription.update({
          where: { id: sub.id },
          data: { status: 'past_due' },
        }),
        db.payment.create({
          data: {
            amount: decimalToNumber(sub.plan.price),
            currency: 'PEN',
            status: 'pending',
            notes: `Facturación automática - ${sub.plan.name} - Vencida`,
            subscriptionId: sub.id,
            userId: sub.userId,
            storeId: sub.storeId,
            planId: sub.planId,
          },
        }),
      ])
      pastDueCount++
    } catch (txError) {
      console.error(`[BILLING] Transaction failed for subscription ${sub.id}:`, txError)
    }
  }

  // ── 2) past_due con 7+ días de mora → expired + baja a Free ──
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const freePlan = await db.plan.findUnique({ where: { type: 'free' } })
  if (!freePlan) {
    return { checkedAt: now.toISOString(), pastDueCount, expiredCount }
  }

  const pastDueSubscriptions = await db.subscription.findMany({
    where: {
      status: 'past_due',
      nextBillingDate: { lte: sevenDaysAgo },
      plan: { type: { not: 'free' } },
    },
    include: { user: true, plan: true },
  })

  for (const sub of pastDueSubscriptions) {
    try {
      await db.$transaction([
        db.subscription.update({
          where: { id: sub.id },
          data: { status: 'expired', endDate: now },
        }),
        db.subscription.create({
          data: {
            userId: sub.userId,
            storeId: sub.storeId,
            planId: freePlan.id,
            status: 'active',
            startDate: now,
            billingCycle: 'monthly',
            amountPaid: 0,
          },
        }),
        db.payment.create({
          data: {
            amount: decimalToNumber(sub.plan.price),
            currency: 'PEN',
            status: 'failed',
            notes: 'Suscripción expirada por falta de pago (7 días). Degradado a Free.',
            subscriptionId: sub.id,
            userId: sub.userId,
            storeId: sub.storeId,
            planId: sub.planId,
          },
        }),
      ])
      expiredCount++

      if (sub.user) {
        sendSubscriptionEmail(sub.user.name, sub.user.email, sub.plan.name, Number(sub.plan.price), 'downgraded').catch(() => {})
      }
    } catch (txError) {
      console.error(`[BILLING] Transaction failed for subscription ${sub.id}:`, txError)
    }
  }

  return { checkedAt: now.toISOString(), pastDueCount, expiredCount }
}

// Ejecución perezosa segura para rutas calientes:
// 1 query del guard; si hay trabajo, aplica transiciones. Nunca lanza.
export async function sweepIfNeeded(): Promise<void> {
  try {
    if (await hasBillingWork()) {
      await runBillingSweep()
    }
  } catch {
    /* el barrido nunca debe romper la ruta que lo llama */
  }
}
