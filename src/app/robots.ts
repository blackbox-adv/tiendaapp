import { APP_URL } from '@/lib/env'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 🔒 No anunciamos rutas privadas (/admin, /dashboard, /wizard): robots.txt
        // es público y enlistarlas solo le entrega un mapa del sitio al atacante.
        // Las páginas privadas ya exigen sesión; /api/ sí se oculta (no debe indexarse).
        disallow: ['/api/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
