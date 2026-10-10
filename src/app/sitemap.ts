import { APP_URL } from '@/lib/env'
import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { DEMO_STORE_SLUGS } from '@/lib/demo-stores'

// Revalidar cada hora para que las tiendas nuevas/desactivadas
// se reflejen en el sitemap sin necesitar un redeploy.
export const revalidate = 3600

// Dynamic lastModified dates will be used for static pages
// (updatedAt from DB for dynamic pages)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // /auth/login fuera del sitemap: página utilitaria sin valor para buscadores.
    {
      url: `${baseUrl}/gamarra`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic store pages
  let storePages: MetadataRoute.Sitemap = []
  try {
    const stores = await db.store.findMany({
      // Las tiendas demo (pizzeria-napoli, boutique-elegance, techstore-peru) NO
      // van al sitemap: canibalizan la marca Kyllari en Google. Llevan noindex
      // vía generateMetadata (ver src/lib/demo-stores.ts).
      where: { isActive: true, slug: { notIn: [...DEMO_STORE_SLUGS] } },
      select: { slug: true, updatedAt: true },
    })

    storePages = stores.map((store) => ({
      url: `${baseUrl}/store/${store.slug}`,
      lastModified: store.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB might not be available during build
  }

  return [...staticPages, ...storePages]
}
