'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, X, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { WhatsAppButton } from './WhatsAppButton'
import { ModernaTemplate } from './ModernaTemplate'
import { VibranteTemplate } from './VibranteTemplate'
import { ClasicaTemplate } from './ClasicaTemplate'
import type { Product, Store as StoreType } from '@/lib/types'

export function StoreView({ slug }: { slug: string }) {
  const { stores, products, navigate, goBack } = useAppStore()

  const store = stores.find((s) => s.slug === slug && s.isActive)

  // Sort: featured first, then by createdAt desc
  const storeProducts = store
    ? products
        .filter((p) => p.storeId === store.id && p.isActive)
        .sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    : []

  // API fallback: if store not found locally, try fetching from API
  const [apiLoading, setApiLoading] = useState(!store)
  const [apiProducts, setApiProducts] = useState<Product[]>([])
  const [apiStore, setApiStore] = useState<StoreType | null>(null)

  useEffect(() => {
    if (store) return
    const fetchFromApi = async () => {
      try {
        const res = await fetch(`/api/stores?slug=${slug}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.id) {
            setApiStore({
              id: data.id,
              name: data.name,
              slug: data.slug,
              description: data.description || '',
              logo: data.logo || '🛍️',
              categoryId: data.category || '',
              planId: '',
              colors: {
                primary: data.primaryColor || '#7C3AED',
                secondary: data.secondaryColor || '#10B981',
              },
              whatsappNumber: data.whatsappNumber || '',
              template: (data.template as 'moderna' | 'vibrante' | 'clasica') || 'moderna',
              userId: data.ownerId || '',
              isActive: data.isActive ?? true,
              createdAt: data.createdAt || new Date().toISOString(),
            })
            if (data.products && Array.isArray(data.products)) {
              const mapped: Product[] = data.products.map((p: Record<string, unknown>) => ({
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
              }))
              // Sort featured first
              mapped.sort((a, b) => {
                if (a.featured && !b.featured) return -1
                if (!a.featured && b.featured) return 1
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              })
              setApiProducts(mapped)
            }
          }
        }
      } catch {
        // API fallback failed
      }
      setApiLoading(false)
    }
    fetchFromApi()
  }, [slug, store])

  const displayStore = store || apiStore
  const displayProducts = store ? storeProducts : apiProducts

  if (!displayStore && !apiLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tienda no encontrada</h1>
          <p className="text-gray-500 mb-6">Esta tienda no existe o está desactivada.</p>
          <Button onClick={() => navigate({ page: 'landing' })} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  if (apiLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Cargando tienda...</div>
      </div>
    )
  }

  return (
    <>
      {/* Top nav bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Volver</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{displayStore!.logo}</span>
          <span className="font-semibold text-gray-900">{displayStore!.name}</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Render template */}
      {displayStore!.template === 'moderna' && <ModernaTemplate store={displayStore!} products={displayProducts} storeSlug={slug} />}
      {displayStore!.template === 'vibrante' && <VibranteTemplate store={displayStore!} products={displayProducts} storeSlug={slug} />}
      {displayStore!.template === 'clasica' && <ClasicaTemplate store={displayStore!} products={displayProducts} storeSlug={slug} />}

      {/* WhatsApp Float */}
      <WhatsAppButton whatsappNumber={displayStore!.whatsappNumber} />
    </>
  )
}
