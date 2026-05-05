'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Store, Users, CreditCard, TrendingUp, ArrowUpRight, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Stats {
  totalUsers: number; activeUsers: number; totalStores: number; activeStores: number
  totalProducts: number; newUsersThisMonth: number; newStoresThisMonth: number
  planDistribution: Record<string, number>; mrr: number
  monthlyRevenue: number; verifiedRevenue: number; pendingPayments: number
  topStores: { id: string; name: string; slug: string; visitCount: number; _count: { products: number } }[]
  recentStores: { id: string; name: string; slug: string; createdAt: string; owner: { name: string; email: string }; subscriptions: { plan: { name: string; price: number } }[] }[]
  expiringSubscriptions: number; pastDueCount: number
}

export function AdminOverview() {
  const { navigate } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [billing, setBilling] = useState<{ pendingPayments: number; pastDueSubscriptions: any[]; expiringSoon: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tiendapp_token') : null
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

        const [statsRes, billingRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/billing/check', { headers }),
        ])

        if (statsRes.ok) setStats(await statsRes.json())
        if (billingRes.ok) setBilling(await billingRes.json())
      } catch (err) {
        console.error('Error loading admin stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full" /></div>

  const s = stats
  const b = billing

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        <p className="text-gray-500 mt-1">Resumen general de la plataforma TiendApp</p>
      </div>

      {/* Alerts */}
      {(b?.pastDueSubscriptions?.length || 0) > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {b!.pastDueSubscriptions.length} suscripción(es) vencida(s)
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {b!.pastDueSubscriptions.map(ps => `${ps.user.name} (${ps.store.name}) - S/${ps.plan.price}`).join(' | ')}
                </p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => navigate({ page: 'admin-payments' })}>
                Ver pagos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tiendas activas', value: s?.activeStores || 0, sub: `de ${s?.totalStores || 0} totales`, icon: Store, color: 'bg-violet-100 text-violet-600' },
          { label: 'Usuarios activos', value: s?.activeUsers || 0, sub: `${s?.newUsersThisMonth || 0} nuevos este mes`, icon: Users, color: 'bg-blue-100 text-blue-600' },
          { label: 'Productos totales', value: s?.totalProducts || 0, sub: 'en todas las tiendas', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
          { label: 'Ingresos del mes', value: `S/${(s?.verifiedRevenue || 0).toFixed(2)}`, sub: `${b?.pendingPayments || 0} pagos pendientes`, icon: CreditCard, color: 'bg-amber-100 text-amber-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MRR + Billing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
          <CardContent className="p-5">
            <p className="text-sm text-violet-200">MRR (Ingresos Recurrentes)</p>
            <p className="text-3xl font-bold mt-2">S/{(s?.mrr || 0).toFixed(2)}</p>
            <p className="text-xs text-violet-200 mt-1">Basado en suscripciones activas</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="text-sm font-medium text-orange-800">Por vencer (3 días)</p>
            </div>
            <p className="text-2xl font-bold text-orange-700 mt-2">{s?.expiringSubscriptions || 0}</p>
            <p className="text-xs text-orange-600 mt-1">Suscripciones que requieren atención</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">Pagos pendientes</p>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-2">{b?.pendingPayments || 0}</p>
            <p className="text-xs text-red-600 mt-1">Requieren verificación</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución de planes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s?.planDistribution ? Object.entries(s.planDistribution).map(([name, count]) => {
                const total = Object.values(s.planDistribution).reduce((a, b) => a + b, 0)
                const colors: Record<string, string> = { Free: 'bg-gray-200 text-gray-700', Pro: 'bg-violet-100 text-violet-700', Premium: 'bg-amber-100 text-amber-700' }
                const barColors: Record<string, string> = { Free: 'bg-gray-400', Pro: 'bg-violet-500', Premium: 'bg-amber-500' }
                return (
                  <div key={name} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[name] || 'bg-gray-100 text-gray-600'}`}>{name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColors[name] || 'bg-violet-500'}`} style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
                    </div>
                  </div>
                )
              }) : null}
            </div>
          </CardContent>
        </Card>

        {/* Top Stores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Top tiendas por visitas</CardTitle>
              <button onClick={() => navigate({ page: 'admin-stores' })} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                Ver todas <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s?.topStores?.map((store, i) => (
                <div key={store.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-400">{store._count.products} productos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{store.visitCount}</p>
                    <p className="text-xs text-gray-400">visitas</p>
                  </div>
                </div>
              )) || <p className="text-sm text-gray-400">No hay tiendas aún</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Stores */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tiendas recientes</CardTitle>
              <button onClick={() => navigate({ page: 'admin-stores' })} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                Ver todas <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Tienda</th>
                  <th className="pb-2 font-medium">Propietario</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr></thead>
                <tbody>
                  {s?.recentStores?.map((store) => (
                    <tr key={store.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3">
                        <button onClick={() => navigate({ page: 'store', slug: store.slug })} className="hover:text-violet-600 font-medium">
                          {store.name}
                        </button>
                      </td>
                      <td className="py-3 text-gray-600">{store.owner.name}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs">{store.subscriptions[0]?.plan?.name || 'Free'}</Badge>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">{new Date(store.createdAt).toLocaleDateString('es-PE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
