'use client'

import { useAppStore } from '@/lib/store'
import { PLANS, CATEGORIES } from '@/lib/mock-data'
import { Package, Eye, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardOverview() {
  const { currentUser, currentStore, products, navigate } = useAppStore()

  if (!currentUser || !currentStore) return null

  const storeProducts = products.filter((p) => p.storeId === currentStore.id && p.isActive)
  const currentPlan = PLANS.find((p) => p.id === currentUser.planId)
  const recentProducts = storeProducts.slice(-4)

  const visitDisplay = (currentStore as unknown as Record<string, unknown>)?.visitCount
    ? String((currentStore as unknown as Record<string, unknown>).visitCount)
    : String(storeProducts.length)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido, {currentUser.name}! 👋</h1>
        <p className="text-gray-500 mt-1">Aquí tienes un resumen de tu tienda {currentStore.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Productos', value: storeProducts.length, icon: Package, color: 'bg-violet-100 text-violet-600' },
          { label: 'Categorías', value: new Set(storeProducts.map(p => p.categoryId)).size, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
          { label: 'Plan', value: currentPlan?.name || 'Gratis', icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
          { label: 'Visitas', value: visitDisplay, icon: Eye, color: 'bg-green-100 text-green-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <Card className="border-violet-100 bg-violet-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600 font-medium">Plan actual</p>
                <p className="text-xl font-bold text-gray-900">{currentPlan.name} - S/{currentPlan.price.toFixed(2)}/mes</p>
                <p className="text-sm text-gray-500 mt-1">
                  {currentPlan.productLimit === -1 ? 'Productos ilimitados' : `${storeProducts.length}/${currentPlan.productLimit} productos usados`}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ page: 'dashboard-plan' })}
                className="border-violet-200 text-violet-600 hover:bg-violet-100"
              >
                Cambiar plan
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Products */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Productos recientes</h2>
            <Button variant="ghost" onClick={() => navigate({ page: 'dashboard-products' })} className="text-violet-600 text-sm">
              Ver todos <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          {recentProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aún no tienes productos</p>
              <Button
                onClick={() => navigate({ page: 'dashboard-product-form' })}
                className="mt-3 bg-violet-600 hover:bg-violet-700 text-white"
              >
                Agregar producto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProducts.map((product) => {
                const category = CATEGORIES.find((c) => c.id === product.categoryId)
                return (
                  <div key={product.id} className="group rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 bg-gray-100 relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-violet-600">S/{product.price.toFixed(2)}</span>
                        {category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
