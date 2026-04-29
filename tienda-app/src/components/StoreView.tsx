'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import MinimalTemplate from './templates/MinimalTemplate'
import SaborTemplate from './templates/SaborTemplate'
import EleganceTemplate from './templates/EleganceTemplate'

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

  const showWhatsApp = store.user && ['pro', 'premium'].includes(store.plan) ? false : false
  // Check the store owner's plan (passed through user relation)
  // For simplicity, we'll check if the store has whatsapp set
  const hasWhatsApp = !!store.whatsapp

  const Template = store.template === 'sabor' ? SaborTemplate : store.template === 'elegance' ? EleganceTemplate : MinimalTemplate

  return <Template store={store} products={store.products || []} showWhatsApp={hasWhatsApp} />
}
