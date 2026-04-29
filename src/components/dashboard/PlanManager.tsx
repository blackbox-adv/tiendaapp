'use client'

import { useAppStore } from '@/lib/store'
import { PLANS } from '@/lib/mock-data'
import { Check, Crown, Zap, Gift, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const iconMap: Record<string, React.ElementType> = { Gift, Zap, Crown }

export function PlanManager() {
  const { currentUser, products, currentStore, navigate, changePlan } = useAppStore()

  if (!currentUser) return null

  const currentPlanId = currentUser.planId
  const currentPlan = PLANS.find((p) => p.id === currentPlanId)
  const storeProducts = currentStore ? products.filter((p) => p.storeId === currentStore.id).length : 0

  const handleChangePlan = (planId: string) => {
    if (confirm('¿Estás seguro de que deseas cambiar de plan?')) {
      changePlan(planId)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Plan</h1>
        <p className="text-gray-500 mt-1">Gestiona tu suscripción y mejora tu plan</p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
                  {(() => { const Icon = iconMap[currentPlan.icon] || Gift; return <Icon className="w-7 h-7 text-violet-600" /> })()}
                </div>
                <div>
                  <p className="text-sm text-violet-600 font-medium">Plan actual</p>
                  <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h2>
                  <p className="text-sm text-gray-500">
                    {currentPlan.productLimit === -1 ? 'Productos ilimitados' : `${storeProducts}/${currentPlan.productLimit} productos`}
                    {' · '}S/{currentPlan.price.toFixed(2)}/mes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparar planes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Función</th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4">
                      <div className={`text-sm font-bold ${plan.id === currentPlanId ? 'text-violet-600' : 'text-gray-900'}`}>
                        {plan.name}
                      </div>
                      <div className="text-lg font-extrabold text-gray-900">S/{plan.price.toFixed(2)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Productos', values: ['10', '100', '∞'] },
                  { label: 'Tiendas', values: ['1', '1', '3'] },
                  { label: 'Plantilla básica', values: [true, true, true] },
                  { label: 'Todas las plantillas', values: [false, true, true] },
                  { label: 'Botón WhatsApp', values: [true, true, true] },
                  { label: 'Dominio personalizado', values: [false, true, true] },
                  { label: 'Estadísticas avanzadas', values: [false, true, true] },
                  { label: 'Soporte prioritario', values: [false, true, true] },
                  { label: 'Soporte 24/7', values: [false, false, true] },
                  { label: 'Sin marca TiendApp', values: [false, false, true] },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{row.label}</td>
                    {row.values.map((val, i) => (
                      <td key={i} className="py-3 px-4 text-center">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )
                        ) : (
                          <span className="text-sm font-medium text-gray-700">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td />
                  {PLANS.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center">
                      {plan.id === currentPlanId ? (
                        <div className="text-sm font-semibold text-violet-600 bg-violet-50 py-2 rounded-lg">Plan actual</div>
                      ) : (
                        <Button
                          onClick={() => handleChangePlan(plan.id)}
                          size="sm"
                          className={
                            plan.isPopular
                              ? 'bg-violet-600 hover:bg-violet-700 text-white'
                              : 'border-violet-200 text-violet-600 hover:bg-violet-50'
                          }
                          variant={plan.isPopular ? 'default' : 'outline'}
                        >
                          {plan.price === 0 ? 'Downgrade' : 'Cambiar'}
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
