'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown } from 'lucide-react'
import DashboardLayout from '../DashboardLayout'

const plans = [
  { id: 'free', name: 'Gratis', price: 'S/ 0', icon: Star, color: 'bg-gray-100 text-gray-600', features: ['10 productos', '3 plantillas', 'Catálogo básico', 'Subir imágenes', 'Vista móvil'] },
  { id: 'pro', name: 'Pro', price: 'S/ 49/mes', icon: Zap, color: 'bg-violet-100 text-violet-700', features: ['100 productos', '6 plantillas', 'Botón WhatsApp', 'Colores personalizados', 'Sin marca de agua', 'Dominio personalizado'] },
  { id: 'premium', name: 'Premium', price: 'S/ 99/mes', icon: Crown, color: 'bg-amber-100 text-amber-700', features: ['Productos ilimitados', 'Todas las plantillas', 'WhatsApp + redes', 'SEO avanzado', 'Estadísticas', 'Soporte prioritario'] },
]

export default function PlanManager() {
  const { currentUser } = useStore()
  const currentPlan = currentUser?.plan || 'free'

  return (
    <DashboardLayout activePage="plan">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Plan</h1>
          <p className="text-gray-500">Tu plan actual: <Badge className={plans.find(p => p.id === currentPlan)?.color}>{currentPlan.toUpperCase()}</Badge></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(p => (
            <Card key={p.id} className={`border-2 transition-all ${currentPlan === p.id ? 'border-violet-500 shadow-lg' : 'border-gray-200'}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${p.color} flex items-center justify-center`}><p.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-lg font-extrabold">{p.price}</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500 flex-shrink-0" />{f}</li>
                  ))}
                </ul>
                {currentPlan === p.id ? (
                  <Button className="w-full" variant="secondary" disabled>Plan actual</Button>
                ) : (
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">Mejorar a {p.name}</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
