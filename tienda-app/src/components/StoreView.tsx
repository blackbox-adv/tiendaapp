'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'
import MinimalTemplate from './templates/MinimalTemplate'
import SaborTemplate from './templates/SaborTemplate'
import EleganceTemplate from './templates/EleganceTemplate'

interface StoreFeatures {
  showSearch: boolean
  showWhatsApp: boolean
  showRatings: boolean
  showDiscountBadge: boolean
  showShareButton: boolean
  showWatermark: boolean
  showInstagram: boolean
  animations: boolean
}

const featuresByPlan: Record<string, StoreFeatures> = {
  free: {
    showSearch: false,
    showWhatsApp: false,
    showRatings: false,
    showDiscountBadge: false,
    showShareButton: false,
    showWatermark: true,
    showInstagram: false,
    animations: false,
  },
  pro: {
    showSearch: true,
    showWhatsApp: true,
    showRatings: true,
    showDiscountBadge: true,
    showShareButton: false,
    showWatermark: false,
    showInstagram: true,
    animations: true,
  },
  premium: {
    showSearch: true,
    showWhatsApp: true,
    showRatings: true,
    showDiscountBadge: true,
    showShareButton: true,
    showWatermark: false,
    showInstagram: true,
    animations: true,
  },
}

export default function StoreView() {
  const { route } = useStore()
  const storeSlug = route.page === 'view-store' ? route.storeSlug : null
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeSlug) return
    setLoading(true)
    fetch(`/api/stores/${storeSlug}`)
      .then(r => r.json())
      .then(data => { setStore(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [storeSlug])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Skeleton className="w-64 h-8" /></div>
  if (!store) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Tienda no encontrada</p></div>

  const plan = store.user?.plan || 'free'
  const features = featuresByPlan[plan] || featuresByPlan.free

  // WhatsApp: show if the store has a number AND the plan allows it
  const showWhatsApp = features.showWhatsApp && !!store.whatsapp

  const Template = store.template === 'sabor' ? SaborTemplate : store.template === 'elegance' ? EleganceTemplate : MinimalTemplate

  return <Template store={store} products={store.products || []} showWhatsApp={showWhatsApp} features={features} />
}
