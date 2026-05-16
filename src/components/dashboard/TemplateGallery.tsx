'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Check, Lock, LayoutTemplate, Palette, Sparkles, Sun, Crown, Minimize2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type TemplateId = 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist'

interface TemplateItem {
  id: TemplateId
  name: string
  icon: typeof Palette
  desc: string
  color: string
  gradient: string
  requiredPlan: 'free' | 'pro' | 'premium'
  planLabel: string
}

const templateList: TemplateItem[] = [
  {
    id: 'moderna',
    name: 'Moderna',
    icon: Palette,
    desc: 'Diseño limpio y minimalista, perfecto para marcas sofisticadas.',
    color: '#7C3AED',
    gradient: 'from-violet-500 to-purple-600',
    requiredPlan: 'free',
    planLabel: '',
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    icon: Sparkles,
    desc: 'Colores vibrantes y dinámicos para tiendas con personalidad.',
    color: '#EC4899',
    gradient: 'from-pink-500 to-orange-400',
    requiredPlan: 'pro',
    planLabel: 'Pro',
  },
  {
    id: 'clasica',
    name: 'Clásica',
    icon: Sun,
    desc: 'Elegancia atemporal con tonos cálidos para tiendas tradicionales.',
    color: '#D97706',
    gradient: 'from-amber-500 to-yellow-500',
    requiredPlan: 'pro',
    planLabel: 'Pro',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: Crown,
    desc: 'Diseño de alta gama con tonos oscuros y acentos dorados para marcas premium.',
    color: '#c8a456',
    gradient: 'from-gray-900 via-gray-800 to-amber-900',
    requiredPlan: 'premium',
    planLabel: 'Premium',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: Minimize2,
    desc: 'Ultra limpio al estilo Apple. Espacios amplios, tipografía ligera y sin distracciones.',
    color: '#374151',
    gradient: 'from-gray-50 via-white to-gray-100',
    requiredPlan: 'premium',
    planLabel: 'Premium',
  },
]

const PLAN_ACCESS: Record<string, TemplateItem['requiredPlan'][]> = {
  free: ['free'],
  pro: ['free', 'pro'],
  premium: ['free', 'pro', 'premium'],
}

export function TemplateGallery() {
  const { currentStore, currentUser, navigate, updateStoreSettings } = useAppStore()

  const userPlanId = currentUser?.planId || 'free'
  const allowedPlans = PLAN_ACCESS[userPlanId] || PLAN_ACCESS.free

  if (!currentStore) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const [changingTemplate, setChangingTemplate] = useState<string | null>(null)

  const handleSelect = async (templateId: TemplateId) => {
    setChangingTemplate(templateId)
    try {
      const result = await updateStoreSettings({ template: templateId })
      if (result.success) {
        toast.success('Plantilla actualizada', { description: `Tu tienda ahora usa la plantilla ${templateList.find(t => t.id === templateId)?.name || templateId}.` })
      } else {
        toast.error('Error al cambiar plantilla', { description: result.error || 'No se pudo guardar el cambio. Intenta de nuevo.' })
      }
    } catch {
      toast.error('Error de conexión', { description: 'No se pudo cambiar la plantilla. Intenta de nuevo.' })
    } finally {
      setChangingTemplate(null)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
        <p className="text-gray-500 mt-1">Elige la plantilla que mejor represente tu marca</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templateList.map((tpl) => {
          const isActive = currentStore.template === tpl.id
          const isLocked = !allowedPlans.includes(tpl.requiredPlan)

          return (
            <Card
              key={tpl.id}
              className={`overflow-hidden transition-all relative ${
                isActive
                  ? 'border-violet-500 ring-2 ring-violet-200 shadow-lg'
                  : isLocked
                  ? 'border-gray-200 opacity-90'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              {/* Template preview */}
              <div className={`h-48 bg-gradient-to-br ${tpl.gradient} flex items-center justify-center relative`}>
                <LayoutTemplate className="w-16 h-16 text-white/30" />

                {/* Premium badge */}
                {tpl.requiredPlan !== 'free' && (
                  <div className="absolute top-3 left-3">
                    <Badge
                      className="text-[10px] font-bold border-0 shadow-sm"
                      style={{
                        backgroundColor: tpl.requiredPlan === 'premium' ? '#c8a456' : '#8B5CF6',
                        color: tpl.requiredPlan === 'premium' ? '#1a1a2e' : '#fff',
                      }}
                    >
                      {tpl.requiredPlan === 'premium' ? '✨ Premium' : '⭐ Pro'}
                    </Badge>
                  </div>
                )}

                {isActive && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md z-10">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}

                {/* Lock overlay for premium templates */}
                {isLocked && !isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 cursor-pointer"
                    onClick={() => navigate({ page: 'dashboard-plan' })}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-900/80 flex items-center justify-center mb-3 shadow-lg">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      Disponible en plan {tpl.planLabel}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Actualmente en plan {userPlanId === 'free' ? 'Gratuito' : userPlanId === 'pro' ? 'Pro' : 'Premium'}
                    </p>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <tpl.icon className="w-5 h-5" style={{ color: tpl.color }} />
                  <h3 className="text-lg font-bold text-gray-900">{tpl.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">{tpl.desc}</p>

                <div className="flex gap-2">
                  {isLocked && !isActive ? (
                    <Button
                      onClick={() => navigate({ page: 'dashboard-plan' })}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {tpl.requiredPlan === 'premium' ? 'Mejorar a Premium' : 'Mejorar a Pro'}
                    </Button>
                  ) : isActive ? (
                    <div className="w-full text-center py-2 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
                      ✓ Plantilla activa
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSelect(tpl.id)}
                        disabled={changingTemplate !== null}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {changingTemplate === tpl.id ? 'Cambiando...' : 'Usar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/demo/${tpl.id}`, '_blank')}
                        className="text-gray-500"
                      >
                        Vista previa
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
