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
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tiendapp.pe'}/sitemap.xml`,
  }
}
