// ============================================================
// FUENTE ÚNICA DE VERDAD de los planes de Kyllari.
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
    maxProducts: 6,
    description: 'Perfecto para comenzar',
    features: [
      'Hasta 6 productos',
      '1 tienda online',
      '1 plantilla básica (Moderna)',
      'Botón de WhatsApp',
      'Reportes básicos de visitas en tu panel',
      'Badge "Creado con Kyllari"',
      'Soporte por email',
    ],
    popular: false,
  },
  {
    type: 'pro',
    name: 'Pro',
    price: 29.99,
    maxProducts: 50,
    description: 'Para tiendas en crecimiento',
    features: [
      'Hasta 50 productos',
      '1 tienda online',
      '3 plantillas base',
      'Packs y combos con descuento',
      'Importa y exporta tu catálogo (Excel/Sheets)',
      'Reportes de ventas en Excel',
      'Buscador de productos',
      'Popup de ofertas y banner de anuncios',
      'Notificaciones en tu panel',
      'Dominio personalizado (muy pronto)',
      'Estadísticas avanzadas',
      'Sin badge Kyllari',
      'Copys y descripciones con IA (muy pronto)',
      'Soporte prioritario',
    ],
    popular: true,
  },
  {
    type: 'premium',
    name: 'Premium',
    price: 79.99,
    maxProducts: -1,
    description: 'Para negocios establecidos',
    features: [
      'Productos ilimitados',
      'Hasta 3 tiendas',
      'Las 26 plantillas (un diseño por rubro)',
      'Packs y combos con descuento',
      'Importa y exporta tu catálogo (Excel/Sheets)',
      'Reportes de ventas en Excel',
      'Buscador y filtros avanzados',
      'Popup de ofertas y banner de anuncios',
      'Chat con tus clientes dentro de la tienda',
      'Hasta 5 empleados con su propio login y WhatsApp',
      'Landing IA para tus lanzamientos',
      'Notificaciones en tu panel',
      'Copys y descripciones con IA (muy pronto)',
      'Dominio personalizado (muy pronto)',
      'Tarjeta de marca al compartir en WhatsApp',
      'Sin marca Kyllari',
      'Soporte 24/7',
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
