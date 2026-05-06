'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ProductDetailView } from '@/components/store-templates/ProductDetailView'
import type { Store, Product } from '@/lib/types'

function transformStore(s: Record<string, unknown>): Store {
  return {
    id: s.id as string,
    name: s.name as string,
    slug: s.slug as string,
    description: (s.description as string) || '',
    logo: (s.logo as string) || '',
    categoryId: (s.category as string) || '',
    planId: '',
    colors: {
      primary: (s.primaryColor as string) || '#7C3AED',
      secondary: (s.secondaryColor as string) || '#10B981',
    },
    whatsappNumber: (s.whatsappNumber as string) || '',
    template: (s.template as 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist') || 'moderna',
    bannerUrl: (s.bannerUrl as string) || '',
    userId: (s.ownerId as string) || '',
    isActive: (s.isActive as boolean) ?? true,
    createdAt: (s.createdAt as string) || new Date().toISOString(),
  }
}

function transformProduct(p: Record<string, unknown>): Product {
  return {
    id: p.id as string,
    name: (p.name as string) || '',
    description: (p.description as string) || '',
    price: (p.price as number) || 0,
    originalPrice: (p.originalPrice as number) || null,
    categoryId: (p.category as string) || '',
    imageUrl: (p.imageUrl as string) || '',
    isActive: (p.isActive as boolean) ?? true,
    featured: (p.featured as boolean) ?? false,
    rating: (p.rating as number) || 0,
    storeId: (p.storeId as string) || '',
    createdAt: (p.createdAt as string) || new Date().toISOString(),
  }
}

interface ProductPublicClientProps {
  store: Record<string, unknown>
  product: Record<string, unknown>
  relatedProducts: Record<string, unknown>[]
}

export function ProductPublicClient({ store, product, relatedProducts }: ProductPublicClientProps) {
  useEffect(() => {
    const ts = transformStore(store)
    const tp = transformProduct(product)
    const rp = relatedProducts.map(transformProduct)

    // Populate Zustand with store, current product, and related products
    useAppStore.setState({
      stores: [ts],
      products: [tp, ...rp],
      currentStore: ts,
    })
  }, [store, product, relatedProducts])

  return <ProductDetailView slug={store.slug as string} productId={product.id as string} />
}
