'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, X, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { WhatsAppButton } from './WhatsAppButton'
import { StoreLogo } from './StoreLogo'
import { ModernaTemplate } from './ModernaTemplate'
import { VibranteTemplate } from './VibranteTemplate'
import { ClasicaTemplate } from './ClasicaTemplate'
import { LuxuryTemplate } from './LuxuryTemplate'
import { MinimalistTemplate } from './MinimalistTemplate'
import { PromoPopup } from './PromoPopup'
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
              template: (data.template as 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist') || 'moderna',
              bannerUrl: data.bannerUrl || '',
              userId: data.ownerId || '',
              isActive: data.isActive ?? true,
              createdAt: data.createdAt || new Date().toISOString(),
              hasShipping: data.hasShipping ?? false,
              hasSecurePayment: data.hasSecurePayment ?? false,
              hasReturns: data.hasReturns ?? false,
            })
            if (data.products && Array.isArray(data.products)) {
              // Helper to safely convert Prisma Decimal / string / number to JS number
              const toNum = (v: unknown): number => {
                if (typeof v === 'number') return v
                if (typeof v === 'string') return parseFloat(v) || 0
                // Prisma Decimal object { s, e, d }
                if (v && typeof v === 'object' && 'd' in (v as object) && 'e' in (v as object) && 's' in (v as object)) {
                  return parseFloat(String(v)) || 0
                }
                return 0
              }
              const mapped: Product[] = data.products.map((p: Record<string, unknown>) => ({
                id: p.id as string,
                name: (p.name as string) || '',
                description: (p.description as string) || '',
                price: toNum(p.price),
                originalPrice: p.originalPrice != null ? toNum(p.originalPrice) : null,
                categoryId: (p.category as string) || '',
                imageUrl: (p.imageUrl as string) || '',
                isActive: (p.isActive as boolean) ?? true,
                featured: (p.featured as boolean) ?? false,
                rating: toNum(p.rating),
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

  // Get planId for template branding
  const storePlanId = displayStore?.planId || ''

  // SEO: Update document title and meta description
  useEffect(() => {
    if (!displayStore) return
    const title = `${displayStore.name} | TiendApp`
    const description = displayStore.description
      ? `${displayStore.description} - Visita la tienda online de ${displayStore.name} en TiendApp.`
      : `Visita la tienda online de ${displayStore.name} en TiendApp. Productos y precios increibles.`

    document.title = title
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description)

    // Update Open Graph
    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', prop)
        document.head.appendChild(el)
      }
      el.content = content
    }
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('og:type', 'website')

    return () => {
      document.title = 'TiendApp | Crea tu tienda online en Perú'
      if (metaDesc) metaDesc.setAttribute('content', 'Crea tu tienda online en minutos con TiendApp. La plataforma #1 en Perú para emprendedores.')
    }
  }, [displayStore])

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
      <div className="min-h-screen bg-white">
        {/* Top nav skeleton */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-16" />
        </div>
        {/* Store header skeleton */}
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="w-72 h-3 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
        {/* Category pills skeleton */}
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2 overflow-hidden">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        {/* Product grid skeleton */}
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
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
          <StoreLogo logo={displayStore!.logo} className="rounded-full" size={28} />
          <span className="font-semibold text-gray-900">{displayStore!.name}</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Render template */}
      {displayStore!.template === 'moderna' && <ModernaTemplate store={displayStore!} products={displayProducts} storeSlug={slug} planId={storePlanId} />}
      {displayStore!.template === 'vibrante' && <VibranteTemplate store={displayStore!} products={displayProducts} storeSlug={slug} planId={storePlanId} />}
      {displayStore!.template === 'clasica' && <ClasicaTemplate store={displayStore!} products={displayProducts} storeSlug={slug} planId={storePlanId} />}
      {displayStore!.template === 'luxury' && <LuxuryTemplate store={displayStore!} products={displayProducts} storeSlug={slug} planId={storePlanId} />}
      {displayStore!.template === 'minimalist' && <MinimalistTemplate store={displayStore!} products={displayProducts} storeSlug={slug} planId={storePlanId} />}

      {/* WhatsApp Float */}
      <WhatsAppButton whatsappNumber={displayStore!.whatsappNumber} />

      {/* Promo Popup */}
      <PromoPopup store={displayStore!} products={displayProducts} />
    </>
  )
}
