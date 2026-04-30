import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StorePublicClient } from './StorePublicClient'

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

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'TiendApp',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
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
        },
      },
    }) as unknown as Record<string, unknown> | null

    if (store && store.isActive !== false) {
      products = (store.products as Record<string, unknown>[]) || []
    }
  } catch {
    // DB not available (dev mode)
  }

  if (!store || store.isActive === false) {
    notFound()
  }

  return <StorePublicClient store={store} products={products} />
}
