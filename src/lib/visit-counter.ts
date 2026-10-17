// ── Contador de visitas anti-contención ──
// Antes: cada visita hacía UPDATE Store SET visitCount+1. Con mucho público
// simultáneo, todas las updates de la MISMA fila se serializan (lock de fila),
// generando latencia y churn en la BD. Además 5 endpoints distintos contaban
// la misma visita varias veces (página, API, WhatsApp...).
//
// Ahora: escritura best-effort con .catch() (nunca rompe la respuesta) y
// acelerón por instancia: como máximo 1 escritura por tienda cada 30s por
// servidor. La métrica sigue siendo útil para "tiendas populares" (ya era
// aproximada) y la BD deja de ser el cuello de botella del hot path.

const THROTTLE_MS = 30_000
const lastCountedAt = new Map<string, number>()

// Limpieza periódica para que el Map no crezca indefinidamente
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, ts] of lastCountedAt) {
      if (now - ts > 10 * 60_000) lastCountedAt.delete(key)
    }
  }, 5 * 60_000)
}

/**
 * Registra una visita si no se registró otra de esta instancia hace menos de
 * 30s para el mismo recurso. Fire-and-forget: nunca lanza, nunca bloquea.
 */
export function countStoreVisit(
  update: () => Promise<unknown>,
  resourceKey: string
): void {
  try {
    const now = Date.now()
    const last = lastCountedAt.get(resourceKey) ?? 0
    if (now - last < THROTTLE_MS) return
    lastCountedAt.set(resourceKey, now)
    update().catch(() => {})
  } catch {
    /* el contador nunca debe romper la ruta que lo llama */
  }
}
