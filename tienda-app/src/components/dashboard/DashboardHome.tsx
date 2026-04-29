'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Eye, Palette, Plus, ArrowRight } from 'lucide-react'
import DashboardLayout from '../DashboardLayout'

export default function DashboardHome() {
  const { navigate, currentUser, setStore } = useStore()
  const [store, setLocalStore] = useState<Record<string, unknown> | null>(null)
  const [stats, setStats] = useState({ products: 0, active: 0, featured: 0 })

  useEffect(() => {
    if (!currentUser) return
    fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id }) })
      .then(r => r.json()).then(data => { if (data.id) { setLocalStore(data); setStore(data) } })
    fetch(`/api/products?storeId=${currentUser.id}`).then(r => r.json()).then(data => setStats({ products: data.length, active: data.filter((p: { isActive: boolean }) => p.isActive).length, featured: data.filter((p: { isFeatured: boolean }) => p.isFeatured).length }))
  }, [currentUser])

  const storeName = (store?.name as string) || 'Mi Tienda'
  const template = (store?.template as string) || 'minimal'
  const plan = currentUser?.plan || 'free'

  return (
    <DashboardLayout activePage="dashboard" title="Mi Tienda">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">¡Hola, {currentUser?.name}!</h1>
            <p className="text-gray-500">Gestiona tu tienda <span className="font-semibold text-violet-600">{storeName}</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ page: 'dashboard-appearance' })}>
              <Palette className="h-4 w-4 mr-1.5" /> Personalizar
            </Button>
            <Button size="sm" onClick={() => navigate({ page: 'dashboard-product-form' })} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" /> Producto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Productos', value: stats.products, icon: Package, color: 'bg-violet-100 text-violet-600' },
            { label: 'Activos', value: stats.active, icon: Eye, color: 'bg-green-100 text-green-600' },
            { label: 'Destacados', value: stats.featured, icon: Palette, color: 'bg-amber-100 text-amber-600' },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="h-5 w-5" /></div>
                <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plan Info */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Plan actual</p>
              <p className="text-xl font-bold capitalize">{plan}</p>
              {plan === 'free' && <p className="text-xs text-white/60 mt-1">Actualmente {stats.products}/10 productos</p>}
            </div>
            <Button variant="secondary" onClick={() => navigate({ page: 'dashboard-plan' })} className="bg-white text-violet-600 hover:bg-white/90">
              {plan === 'free' ? 'Mejorar plan' : 'Ver planes'} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
