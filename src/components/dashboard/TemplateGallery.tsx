'use client'

import { useAppStore } from '@/lib/store'
import { Check, LayoutTemplate, Palette, Sparkles, Sun } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const templateList = [
  {
    id: 'moderna' as const,
    name: 'Moderna',
    icon: Palette,
    desc: 'Diseño limpio y minimalista, perfecto para marcas sofisticadas.',
    color: '#7C3AED',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'vibrante' as const,
    name: 'Vibrante',
    icon: Sparkles,
    desc: 'Colores vibrantes y dinámicos para tiendas con personalidad.',
    color: '#EC4899',
    gradient: 'from-pink-500 to-orange-400',
  },
  {
    id: 'clasica' as const,
    name: 'Clásica',
    icon: Sun,
    desc: 'Elegancia atemporal con tonos cálidos para tiendas tradicionales.',
    color: '#D97706',
    gradient: 'from-amber-500 to-yellow-500',
  },
]

export function TemplateGallery() {
  const { currentStore, navigate, updateStoreSettings } = useAppStore()

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

  const handleSelect = (templateId: 'moderna' | 'vibrante' | 'clasica') => {
    updateStoreSettings({ template: templateId })
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
          return (
            <Card
              key={tpl.id}
              className={`overflow-hidden transition-all ${
                isActive ? 'border-violet-500 ring-2 ring-violet-200 shadow-lg' : 'border-gray-200 hover:shadow-md'
              }`}
            >
              {/* Template preview */}
              <div className={`h-48 bg-gradient-to-br ${tpl.gradient} flex items-center justify-center relative`}>
                <LayoutTemplate className="w-16 h-16 text-white/30" />
                {isActive && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                    <Check className="w-5 h-5 text-green-600" />
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
                  {isActive ? (
                    <div className="w-full text-center py-2 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
                      ✓ Plantilla activa
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSelect(tpl.id)}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        Usar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ page: 'store', slug: currentStore.slug })}
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
