import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tiendapp.pe'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Dynamic store pages
  let storePages: MetadataRoute.Sitemap = []
  try {
    const stores = await db.store.findMany({
      where: { isActive: true },
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
