import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StorePublicClient } from './StorePublicClient'
import { serializeDecimals } from '@/lib/utils'

// force-dynamic: ISR (revalidate) + notFound() devuelve 200 en vez de 404 (soft-404, mal SEO).
// Con dynamic, las tiendas inactivas/borradas dan 404 real, el catálogo siempre está fresco
// y visitCount se incrementa en cada visita real (con ISR solo contaba en revalidaciones).
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

// Generate static params for known stores (ISR-friendly)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let store: {
    name: string
    description: string | null
    logo: string
    primaryColor: string
    isActive: boolean
  } | null = null
  try {
    store = await db.store.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        logo: true,
        primaryColor: true,
        isActive: true,
      },
    })
  } catch {
    return { title: `${slug} | TiendApp` }
  }

  // notFound() aquí (en generateMetadata) y NO en el page: generateMetadata se resuelve
  // FUERA del boundary Suspense de loading.tsx, así la respuesta conserva el HTTP 404.
  // Desde el page llega tarde — el shell ya se envió con 200 (soft-404, mal SEO).
  // Debe estar FUERA del try/catch de arriba porque notFound() lanza y el catch lo tragaría.
  if (!store || store.isActive === false) {
    notFound()
  }

  const title = store.name
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

  // Franja de anuncio: columnas nuevas leídas con SQL crudo para no
  // depender del esquema de Prisma (si aún no existen → null, sin romper).
  let announcementText: string | null = null
  let announcementLink: string | null = null
  try {
    const rows = await db.$queryRawUnsafe(
      `SELECT "announcementText", "announcementLink" FROM "Store" WHERE id = $1 LIMIT 1`,
      store.id as string
    ) as Array<{ announcementText?: string | null; announcementLink?: string | null }>
    announcementText = rows?.[0]?.announcementText ?? null
    announcementLink = rows?.[0]?.announcementLink ?? null
  } catch {
    // migración pendiente: sin aviso
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
      <StorePublicClient
        store={serializeDecimals(store)}
        products={serializeDecimals(products)}
        announcementText={announcementText}
        announcementLink={announcementLink}
      />
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
