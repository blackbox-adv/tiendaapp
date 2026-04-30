'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { StoreView } from '@/components/store-templates/StoreView'
import type { Store, Product } from '@/lib/types'

// Transform server Prisma store to frontend Store type
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
    template: (s.template as 'moderna' | 'vibrante' | 'clasica') || 'moderna',
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

interface StorePublicClientProps {
  store: Record<string, unknown>
  products: Record<string, unknown>[]
}

export function StorePublicClient({ store, products }: StorePublicClientProps) {
  useEffect(() => {
    const ts = transformStore(store)
    const tp = products
      .map(transformProduct)
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

    // Populate Zustand so existing components can find the data
    useAppStore.setState({
      stores: [ts],
      products: tp,
      currentStore: ts,
    })
  }, [store, products])

  return <StoreView slug={store.slug as string} />
}
