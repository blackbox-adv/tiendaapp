// Tiendas demo sembradas en producción (ver src/app/api/seed/route.ts) que se
// muestran en la landing como "tiendas reales" para que el visitante pruebe el
// flujo completo de pedido por WhatsApp.
//
// ⚠️ SEO: estas páginas NO deben indexarse en Google. Son contenido propio de
// demostración y canibalizarían la marca Kyllari en los buscadores (ej. alguien
// busca "Kyllari" y Google muestra "Boutique Elegance | Kyllari").
// Se excluyen del sitemap y llevan meta robots noindex.
//
// Si agregas una tienda demo nueva aquí, los enlaces del home siguen
// funcionando igual (noindex NO bloquea el acceso de visitantes).
export const DEMO_STORE_SLUGS = ['pizzeria-napoli', 'boutique-elegance', 'techstore-peru'] as const

export function isDemoStore(slug: string): boolean {
  return (DEMO_STORE_SLUGS as readonly string[]).includes(slug)
}
