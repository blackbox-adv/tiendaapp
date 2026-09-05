// ============================================================
// FUENTE ÚNICA DE VERDAD de los planes de TiendApp.
// Cualquier precio, límite o feature que se muestre al público
// DEBE salir de aquí. La tabla Plan de la BD se sincroniza con
// este archivo (ver scripts/sync-plans.sql); si la BD está
// desactualizada, /api/plans normaliza con estos valores para
// que nunca se muestre (ni cobre) un precio inconsistente.
// ============================================================

export interface CanonicalPlan {
  type: 'free' | 'pro' | 'premium'
  name: string
  price: number
  maxProducts: number
  description: string
  features: string[]
  popular: boolean
}

export const CANONICAL_PLANS: CanonicalPlan[] = [
  {
    type: 'free',
    name: 'Gratis',
    price: 0,
    maxProducts: 5,
    description: 'Perfecto para comenzar',
    features: [
      'Hasta 5 productos',
      '1 tienda online',
      '1 plantilla básica (Moderna)',
      'Botón de WhatsApp',
      'Badge "Creado con TiendApp"',
      'Soporte por email',
    ],
    popular: false,
  },
  {
    type: 'pro',
    name: 'Pro',
    price: 29.99,
    maxProducts: 20,
    description: 'Para tiendas en crecimiento',
    features: [
      'Hasta 20 productos',
      '1 tienda online',
      '3 plantillas (Moderna, Vibrante, Clásica)',
      'Buscador de productos',
      'Botón de WhatsApp',
      'Sin badge TiendApp',
      'Dominio personalizado',
      'Estadísticas avanzadas',
      'Reportes descargables (Excel)',
      'Copys y descripciones con IA (muy pronto)',
      'Soporte prioritario',
    ],
    popular: true,
  },
  {
    type: 'premium',
    name: 'Premium',
    price: 79.99,
    maxProducts: 100,
    description: 'Para negocios establecidos',
    features: [
      'Hasta 100 productos',
      'Hasta 3 tiendas',
      '5 plantillas + 2 exclusivas Premium',
      'Buscador y filtros avanzados',
      'Plantillas Luxury y Minimalist',
      'Botón de WhatsApp',
      'Dominio personalizado',
      'Estadísticas avanzadas',
      'Reportes descargables (Excel)',
      'Copys y descripciones con IA (muy pronto)',
      'Landing IA para tus lanzamientos',
      'Soporte 24/7',
      'Sin marca TiendApp',
    ],
    popular: false,
  },
]

// Lookup rápido por type
export const PLAN_BY_TYPE: Record<string, CanonicalPlan> = Object.fromEntries(
  CANONICAL_PLANS.map((p) => [p.type, p])
)

// Precios canónicos (para JSON-LD, badges, marketing)
export const PLAN_PRICES: Record<string, number> = Object.fromEntries(
  CANONICAL_PLANS.map((p) => [p.type, p.price])
)

export function formatPlanPrice(type: string): string {
  const price = PLAN_PRICES[type] ?? 0
  return price === 0 ? 'Gratis' : `S/${price.toFixed(2)}`
}
