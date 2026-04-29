'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { CATEGORIES } from '@/lib/mock-data'
import { ArrowLeft, MessageCircle, X, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { WhatsAppButton } from './WhatsAppButton'
import { ModernaTemplate } from './ModernaTemplate'
import { VibranteTemplate } from './VibranteTemplate'
import { ClasicaTemplate } from './ClasicaTemplate'

export function StoreView({ slug }: { slug: string }) {
  const { stores, products, navigate, goBack } = useAppStore()

  const store = stores.find((s) => s.slug === slug && s.isActive)
  const storeProducts = store ? products.filter((p) => p.storeId === store.id && p.isActive) : []

  if (!store) {
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

  return (
    <>
      {/* Top nav bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Volver</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{store.logo}</span>
          <span className="font-semibold text-gray-900">{store.name}</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Render template */}
      {store.template === 'moderna' && <ModernaTemplate store={store} products={storeProducts} storeSlug={slug} />}
      {store.template === 'vibrante' && <VibranteTemplate store={store} products={storeProducts} storeSlug={slug} />}
      {store.template === 'clasica' && <ClasicaTemplate store={store} products={storeProducts} storeSlug={slug} />}

      {/* WhatsApp Float */}
      <WhatsAppButton whatsappNumber={store.whatsappNumber} />
    </>
  )
}
