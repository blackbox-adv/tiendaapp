// ============================================================
// Crea productos de ejemplo para una tienda según su rubro.
// Usado por: wizard de onboarding (al crear la tienda) y banner
// "tienda vacía" del dashboard.
// Detiene la carga si la API rechaza (p.ej. límite de productos
// del plan alcanzado) — así se adapta a Gratis (5) solo creando
// los que quepan.
// ============================================================

import { getRubro } from './rubros'

export async function createDemoProducts(
  storeId: string,
  categoryId?: string | null,
  opts?: { onProgress?: (created: number, total: number) => void }
): Promise<number> {
  if (typeof window === 'undefined') return 0
  const rubro = getRubro(categoryId)
  if (!rubro.products.length) return 0

  const token = localStorage.getItem('tiendapp_token') || ''
  let created = 0

  for (const p of rubro.products) {
    try {
      const res = await fetch('/api/store-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
        },
        body: JSON.stringify({
          storeId,
          name: p.name,
          description: `${p.name} — disponible para entrega inmediata. ¡Pide por WhatsApp!`,
          price: p.price,
          originalPrice: null,
          imageUrl: '',
          images: [],
          category: rubro.name,
          color: null,
          stock: 25,
          isActive: true,
          featured: created === 0,
          rating: 5,
        }),
      })
      if (!res.ok) break // límite del plan u otro error → no insistir
      created++
      opts?.onProgress?.(created, rubro.products.length)
    } catch {
      break
    }
  }
  return created
}
