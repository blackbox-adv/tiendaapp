import { APP_URL } from '@/lib/env'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StorePublicClient } from './StorePublicClient'
import { serializeDecimals } from '@/lib/utils'
import { isDemoStore } from '@/lib/demo-stores'
import { countStoreVisit } from '@/lib/visit-counter'

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
    return { title: `${slug} | Kyllari` }
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
      ? `${store.description} - Visita la tienda online de ${store.name} en Kyllari.`
      : `Visita la tienda online de ${store.name} en Kyllari. Productos y precios increibles.`

    // OG dinámica por tienda: tarjeta de marca con el nombre y color de la tienda.
    // Si el generador falla, las redes sociales simplemente no muestran imagen (no rompe la página).
    const ogImage = `/api/og/store/${slug}`

    return {
      title,
      description,
      // Tiendas demo: noindex para que Google no las publique como resultados
      // de la marca (canibalización SEO). Los visitantes siguen entrando igual.
      ...(isDemoStore(slug) ? { robots: { index: false, follow: true } } : {}),
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'Kyllari',
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

    // Increment visit count — fire-and-forget + acelerón anti-contención
    // (ver src/lib/visit-counter.ts)
    const storeId = store?.id as string | undefined
    if (storeId) {
      countStoreVisit(
        () => db.store.update({
          where: { id: storeId },
          data: { visitCount: { increment: 1 } },
        }),
        `store:${storeId}`
      )
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

  // Plan activo de la tienda (para gating de funciones premium en la tienda
  // pública, ej: packs/combos solo Pro-Premium) y franja de anuncio: son
  // independientes entre sí → se piden EN PARALELO (antes eran ~2 RTT en serie).
  // SQL crudo, tolerante a fallos cada uno por separado.
  const [planRows, announcementRows] = await Promise.all([
    db
      .$queryRawUnsafe(
        `SELECT pl.type FROM "Subscription" sub
         JOIN "Plan" pl ON pl.id = sub."planId"
         WHERE sub."storeId" = $1 AND sub.status = 'active'
         ORDER BY sub."createdAt" DESC LIMIT 1`,
        store.id as string
      )
      .catch(() => [] as Array<{ type?: string }>),
    db
      .$queryRawUnsafe(
        `SELECT "announcementText", "announcementLink" FROM "Store" WHERE id = $1 LIMIT 1`,
        store.id as string
      )
      .catch(() => [] as Array<{ announcementText?: string | null; announcementLink?: string | null }>),
  ])
  let planType: string | null = (planRows as Array<{ type?: string }>)?.[0]?.type ?? null
  if (!planType) planType = null // sin plan detectable → null (la tienda pública lo trata como free)
  const announcementText = (announcementRows as Array<{ announcementText?: string | null }>)?.[0]?.announcementText ?? null
  const announcementLink = (announcementRows as Array<{ announcementLink?: string | null }>)?.[0]?.announcementLink ?? null

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
        planType={planType}
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
    url: `${APP_URL}/store/${store.slug}`,
    image: `${APP_URL}/api/og/store/${store.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PE',
    },
    priceRange: '$$',
  }
}
