import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StorePublicClient } from './StorePublicClient'
import { serializeDecimals } from '@/lib/utils'

// ISR: revalidate every 5 minutes instead of force-dynamic
// On-demand revalidation happens via revalidatePath() when store/products are updated
export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

// Generate static params for known stores (ISR-friendly)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const store = await db.store.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        logo: true,
        primaryColor: true,
      },
    })

    if (!store) {
      return { title: 'Tienda no encontrada | TiendApp' }
    }

    const title = `${store.name} | TiendApp`
    const description = store.description
      ? `${store.description} - Visita la tienda online de ${store.name} en TiendApp.`
      : `Visita la tienda online de ${store.name} en TiendApp. Productos y precios increibles.`

    const ogImage = store.logo || 'https://tiendapp.pe/og-image.png'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'TiendApp',
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `/store/${slug}`,
      },
    }
  } catch {
    return { title: `${slug} | TiendApp` }
  }
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    notFound()
  }

  let store: Record<string, unknown> | null = null
  let products: Record<string, unknown>[] = []

  try {
    store = await db.store.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 200, // Limit to prevent OOM with huge catalogs
        },
      },
    }) as unknown as Record<string, unknown> | null

    // Increment visit count (fire-and-forget, non-blocking)
    if (store && store.id) {
      db.store
        .update({
          where: { id: store.id as string },
          data: { visitCount: { increment: 1 } },
        })
        .catch(() => {})
    }

    if (store && store.isActive !== false) {
      products = (store.products as Record<string, unknown>[]) || []
    }
  } catch {
    // DB not available (dev mode)
  }

  if (!store || store.isActive === false) {
    notFound()
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateStoreJsonLd({
              name: store.name as string,
              description: (store.description as string) || '',
              slug: store.slug as string,
              primaryColor: (store.primaryColor as string) || undefined,
              createdAt: (store.createdAt as string) || undefined,
            })
          ),
        }}
      />
      <StorePublicClient store={serializeDecimals(store)} products={serializeDecimals(products)} />
    </>
  )
}

function generateStoreJsonLd(store: {
  name: string
  description: string
  slug: string
  primaryColor?: string
  createdAt?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    description: store.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tiendapp.pe'}/store/${store.slug}`,
    image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tiendapp.pe'}/api/og/store/${store.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PE',
    },
    priceRange: '$$',
  }
}
