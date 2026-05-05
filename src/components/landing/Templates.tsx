'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Monitor, Eye, Sparkles, Sun, Gem, Crown, Minimize2, Lock } from 'lucide-react'

const templates = [
  {
    id: 'moderna',
    name: 'Moderna',
    icon: Gem,
    badge: null,
    description: 'Diseño limpio y minimalista, perfecto para marcas sofisticadas.',
    colors: ['#1a1a2e', '#ffffff', '#7C3AED'],
    preview: (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-20 bg-violet-100 rounded-lg flex items-center justify-center text-xs text-violet-400">Producto</div>
          <div className="h-20 bg-violet-50 rounded-lg flex items-center justify-center text-xs text-violet-300">Producto</div>
        </div>
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    ),
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    icon: Sparkles,
    badge: null,
    description: 'Colores vibrantes y dinámicos para tiendas con personalidad.',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
    preview: (
      <div className="space-y-3">
        <div className="h-10 rounded-lg bg-gradient-to-r from-pink-400 to-orange-300 flex items-center justify-center text-xs text-white">Tienda</div>
        <div className="flex gap-2">
          <div className="h-5 rounded-full bg-pink-200 px-2 flex items-center justify-center text-xs text-pink-500">Cat 1</div>
          <div className="h-5 rounded-full bg-blue-200 px-2 flex items-center justify-center text-xs text-blue-500">Cat 2</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-orange-100 rounded-lg" />
          <div className="h-16 bg-teal-100 rounded-lg" />
          <div className="h-16 bg-yellow-100 rounded-lg" />
        </div>
      </div>
    ),
  },
  {
    id: 'clasica',
    name: 'Clásica',
    icon: Sun,
    badge: null,
    description: 'Elegancia atemporal con tonos cálidos para tiendas tradicionales.',
    colors: ['#D97706', '#FDE68A', '#78350F'],
    preview: (
      <div className="space-y-3">
        <div className="h-4 bg-amber-200 rounded w-1/2" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-amber-100 rounded" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-amber-200 rounded w-3/4" />
              <div className="h-3 bg-amber-100 rounded w-1/2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-amber-50 rounded" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-amber-100 rounded w-3/4" />
              <div className="h-3 bg-amber-50 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: Crown,
    badge: 'Premium',
    description: 'Diseño exclusivo de alta gama con tonos dorados y elegancia.',
    colors: ['#1a1a2e', '#c8a456', '#f0d078'],
    preview: (
      <div className="space-y-3 bg-[#0f0f1a] rounded-lg p-3">
        <div className="h-px bg-gradient-to-r from-transparent via-[#c8a456] to-transparent" />
        <div className="h-3 bg-[#c8a456]/30 rounded w-2/3" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-20 border border-[#c8a456]/30 rounded-lg flex items-center justify-center text-xs text-[#c8a456]/60">Producto</div>
          <div className="h-20 border border-[#c8a456]/20 rounded-lg flex items-center justify-center text-xs text-[#c8a456]/40">Producto</div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c8a456] to-transparent" />
      </div>
    ),
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: Minimize2,
    badge: 'Premium',
    description: 'Ultra limpio, estilo Apple. Menos es más para marcas modernas.',
    colors: ['#ffffff', '#f5f5f5', '#7C3AED'],
    preview: (
      <div className="space-y-4">
        <div className="h-3 bg-gray-900 rounded w-1/3" />
        <div className="h-px bg-gray-200" />
        <div className="grid grid-cols-4 gap-2">
          <div className="aspect-square bg-gray-100 rounded-sm" />
          <div className="aspect-square bg-gray-50 rounded-sm" />
          <div className="aspect-square bg-gray-100 rounded-sm" />
          <div className="aspect-square bg-gray-50 rounded-sm" />
        </div>
        <div className="space-y-1">
          <div className="h-2 bg-gray-900 rounded w-2/3" />
          <div className="h-2 bg-gray-400 rounded w-1/4" />
        </div>
      </div>
    ),
  },
]

const templateSlugMap: Record<string, string> = {
  moderna: 'dulce-maria-bakery',
  vibrante: 'pizzeria-napoli',
  clasica: 'boutique-elegance',
}

export function Templates() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <section id="templates" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Plantillas</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Elige tu estilo favorito
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Cada plantilla es completamente personalizable. Cambia colores, fuentes y más.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="group"
            >
              {/* Browser frame */}
              <div className={`rounded-2xl overflow-hidden border bg-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 relative ${tpl.id === 'luxury' ? 'border-[#c8a456]/40' : 'border-gray-200'}`}>
                {/* Premium badge */}
                {tpl.badge && (
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-gradient-to-r from-[#c8a456] to-[#f0d078] text-[#1a1a2e] text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {tpl.badge}
                  </div>
                )}
                <div className={`px-4 py-3 flex items-center gap-2 border-b ${tpl.id === 'luxury' ? 'bg-[#1a1a2e] border-[#c8a456]/20' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className={`rounded-md px-4 py-1 text-xs border flex items-center gap-1 ${tpl.id === 'luxury' ? 'bg-[#0f0f1a] text-[#c8a456] border-[#c8a456]/20' : 'bg-white text-gray-400 border-gray-200'}`}>
                      <Monitor className="w-3 h-3" />
                      mitienda.tiendapp.pe
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  {tpl.preview}
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <tpl.icon className={`w-5 h-5 ${tpl.id === 'luxury' ? 'text-[#c8a456]' : 'text-violet-600'}`} />
                  <h3 className="text-base font-bold text-gray-900">{tpl.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{tpl.description}</p>
                {!tpl.badge ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ page: 'store', slug: templateSlugMap[tpl.id] || 'dulce-maria-bakery' })}
                    className="gap-1.5 border-violet-200 text-violet-600 hover:bg-violet-50 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver demo
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/demo/${tpl.id}`}
                    className={`gap-1.5 text-xs ${tpl.id === 'luxury' ? 'border-[#c8a456] text-[#c8a456] hover:bg-[#c8a456]/5' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver demo
                    <Crown className="w-3 h-3 opacity-60" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
