import { APP_URL } from '@/lib/env'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/wizard/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
