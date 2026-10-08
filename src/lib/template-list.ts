// ============================================================
// Lista canónica de plantillas de Kyllari (fuente única).
// Usada por el Zod schema (validations.ts), el gating por plan
// (plan-gating.ts) y cualquier otro lugar que valide plantillas.
// Si agregas una plantilla nueva, agrégala AQUÍ y en la galería.
// ============================================================

export const FREE_TEMPLATES: string[] = ['moderna', 'vibrante', 'clasica']

export const PREMIUM_TEMPLATES: string[] = [
  'luxury', 'minimalist', 'bodega', 'sabor', 'moda', 'vitrina', 'neon',
  'boutique', 'editorial', 'atelier', 'terracota', 'dulce', 'calle',
  'aura', 'teca', 'volt', 'grano', 'flora', 'mesa', 'sushi', 'cafe',
  'bar', 'pop',
]

export const VALID_TEMPLATES: string[] = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES]
