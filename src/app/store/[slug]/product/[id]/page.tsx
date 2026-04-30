import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductPublicClient } from './ProductPublicClient'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params

  try {
    const product = await db.storeProduct.findUnique({
      where: { id },
      include: {
        store: {
          select: { name: true, slug: true },
        },
      },
    })

    if (!product || !product.store) {
      return { title: 'Producto no encontrado | TiendApp' }
    }

    const title = `${product.name} | ${product.store.name}`
    const description = product.description
      ? `${product.description.substring(0, 160)} - ${product.store.name} en TiendApp.`
      : `Compra ${product.name} por S/${product.price.toFixed(2)} en ${product.store.name}. Visita la tienda en TiendApp.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: product.imageUrl ? [{ url: product.imageUrl }] : [],
        siteName: 'TiendApp',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.imageUrl ? [product.imageUrl] : [],
      },
      alternates: {
        canonical: `/store/${slug}/product/${id}`,
      },
    }
  } catch {
    return { title: 'Producto | TiendApp' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, id } = await params

  // Validate format
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+$/.test(id)) {
    notFound()
  }

  let store: Record<string, unknown> | null = null
  let product: Record<string, unknown> | null = null
  let relatedProducts: Record<string, unknown>[] = []

  try {
    product = await db.storeProduct.findUnique({
      where: { id },
      include: {
        store: true,
      },
    }) as unknown as Record<string, unknown> | null

    if (product && product.store) {
      store = product.store as Record<string, unknown>

      // Fetch related products (same store, same category, different product)
      if (product.isActive) {
        const allRelated = await db.storeProduct.findMany({
          where: {
            storeId: store.id as string,
            category: (product.category as string) || '',
            isActive: true,
            id: { not: id },
          },
          take: 4,
          orderBy: { createdAt: 'desc' },
        })
        relatedProducts = allRelated as unknown as Record<string, unknown>[]
      }
    }
  } catch {
    // DB not available
  }

  if (!product || !store || !(product.isActive as boolean)) {
    notFound()
  }

  return <ProductPublicClient store={store} product={product} relatedProducts={relatedProducts} />
}
