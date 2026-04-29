'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Monitor, Eye, Sparkles, Sun, Gem } from 'lucide-react'

const templates = [
  {
    id: 'moderna',
    name: 'Moderna',
    icon: Gem,
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
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group"
            >
              {/* Browser frame */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-400 border border-gray-200 flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      mitienda.tiendapp.pe
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  {tpl.preview}
                </div>
              </div>

              {/* Info */}
              <div className="mt-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <tpl.icon className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg font-bold text-gray-900">{tpl.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">{tpl.description}</p>
                <Button
                  variant="outline"
                  onClick={() => navigate({ page: 'store', slug: templateSlugMap[tpl.id] || 'dulce-maria-bakery' })}
                  className="gap-2 border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  <Eye className="w-4 h-4" />
                  Vista previa
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
