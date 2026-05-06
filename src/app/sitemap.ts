import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BUILD_DATE = '2026-05-06'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tiendapp.pe'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(BUILD_DATE),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(BUILD_DATE),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(BUILD_DATE),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(BUILD_DATE),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(BUILD_DATE),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(BUILD_DATE),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(BUILD_DATE),
      changeFrequency: 'yearly',
      priority: 0.3,
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
