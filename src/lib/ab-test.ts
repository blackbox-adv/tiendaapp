// Test A/B de la landing — asignación persistente + logging de eventos.
// Variante A: hero actual (mockup + CTA WhatsApp verde)
// Variante B: hero clásico (centrado, gradiente violeta)
// La decisión de qué diseño gana se toma con datos reales: vistas,
// clicks en CTA y registros por variante (ver /api/ab/stats).

export type AbVariant = 'A' | 'B'
export type AbEvent = 'view' | 'cta_click' | 'register'

const COOKIE_NAME = 'tiendapp_ab'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 año

/**
 * Devuelve la variante del visitante. La asigna 50/50 la primera vez
 * y la persiste en localStorage + cookie (para atribución server-side).
 */
export function getAbVariant(): AbVariant {
  if (typeof window === 'undefined') return 'A'

  // 1) Cookie (fuente de verdad, la lee también el server en /register)
  const match = document.cookie.match(/(?:^|;\s*)tiendapp_ab=([AB])/)
  if (match) return match[1] as AbVariant

  // 2) localStorage (backup si la cookie se perdió)
  const stored = localStorage.getItem('tiendapp_ab_variant')
  const variant: AbVariant =
    stored === 'A' || stored === 'B' ? stored : Math.random() < 0.5 ? 'A' : 'B'

  // Persistir en ambos
  try {
    localStorage.setItem('tiendapp_ab_variant', variant)
    document.cookie = `${COOKIE_NAME}=${variant}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
  } catch {
    // storage bloqueado — la variante vive solo en esta página
  }

  return variant
}

/**
 * Registra un evento del test A/B (fire-and-forget).
 * 'view' se registra una sola vez por sesión (sessionStorage) para
 * medir sesiones únicas y no inflar los números.
 */
export function logAbEvent(event: AbEvent, variant?: AbVariant) {
  try {
    const v = variant ?? getAbVariant()

    if (event === 'view') {
      if (sessionStorage.getItem('tiendapp_ab_view_logged')) return
      sessionStorage.setItem('tiendapp_ab_view_logged', '1')
    }

    fetch('/api/ab/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, variant: v }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // nunca romper la página por el tracking
  }
}
