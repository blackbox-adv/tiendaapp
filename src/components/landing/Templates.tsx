'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, Crown, ArrowRight, Search, Sparkles, Gem, Sun, Minimize2, ShoppingBasket, UtensilsCrossed, Shirt } from 'lucide-react'
import { PLAN_PRICES } from '@/lib/plans'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

type PlanType = 'free' | 'pro' | 'premium'

interface Template {
  id: string
  name: string
  plan: PlanType
  planLabel: string
  description: string
  bestFor: string[]
  isNew?: boolean
  icon: React.ElementType
}

const templates: Template[] = [
  {
    id: 'moderna',
    name: 'Moderna',
    plan: 'free',
    planLabel: 'Gratis',
    description: 'Limpia y profesional. La del plan gratis para empezar hoy.',
    bestFor: ['Cualquier rubro'],
    icon: Gem,
  },
  {
    id: 'bodega',
    name: 'Mercadito',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Estilo bodega peruana: ofertas resaltadas y pedido al toque.',
    bestFor: ['Bodegas', 'Abarrotes', 'Mercados'],
    isNew: true,
    icon: ShoppingBasket,
  },
  {
    id: 'sabor',
    name: 'Sabores',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Carta digital elegante con favoritos del chef y menú por secciones.',
    bestFor: ['Restaurantes', 'Pollerías', 'Panaderías'],
    isNew: true,
    icon: UtensilsCrossed,
  },
  {
    id: 'moda',
    name: 'Pasarela',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Editorial tipo revista: foto grande, minimal y precios sofisticados.',
    bestFor: ['Ropa', 'Gamarra', 'Accesorios'],
    isNew: true,
    icon: Shirt,
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    plan: 'pro',
    planLabel: 'Pro',
    description: 'Colores llamativos, buscador y promociones que se notan.',
    bestFor: ['Streetwear', 'Tecnología'],
    icon: Sparkles,
  },
  {
    id: 'clasica',
    name: 'Clásica',
    plan: 'pro',
    planLabel: 'Pro',
    description: 'Tonos cálidos que transmiten tradición y confianza.',
    bestFor: ['Artesanías', 'Comida casera'],
    icon: Sun,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Oscuro con acabados dorados. Para marcas premium.',
    bestFor: ['Joyería', 'Alta gama'],
    icon: Crown,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Estilo Apple: espacios amplios y tipografía precisa.',
    bestFor: ['Cosmética', 'Diseño'],
    icon: Minimize2,
  },
]

const planStyles: Record<PlanType, { badge: string; ring: string; hover: string }> = {
  free: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ring: 'hover:border-emerald-300',
    hover: 'group-hover:shadow-emerald-100',
  },
  pro: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    ring: 'hover:border-blue-300',
    hover: 'group-hover:shadow-blue-100',
  },
  premium: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    ring: 'hover:border-amber-300',
    hover: 'group-hover:shadow-amber-100',
  },
}

export function Templates() {
  const navigate = useAppStore((s) => s.navigate)
  const [showAll, setShowAll] = useState(false)
  // En móvil mostramos 4 por defecto para no hacer una página interminable
  const visible = showAll ? templates : templates.slice(0, 4)

  return (
    <section id="templates" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-[#BC5A38] uppercase tracking-wider">
            Diseños que venden
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-4">
            Elige un diseño hecho para tu rubro
          </h2>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-6">
            Toca cualquier diseño y mira una tienda real funcionando con WhatsApp y
            Yape. Sin registrarte, sin instalar nada.
          </p>
          {/* Plan legend */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Gratis
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
              <Search className="w-3.5 h-3.5" />
              Pro · S/{PLAN_PRICES.pro?.toFixed(2)}/mes
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium text-amber-700">
              <Crown className="w-3.5 h-3.5" />
              Premium · S/{PLAN_PRICES.premium?.toFixed(2)}/mes
            </div>
          </div>
        </motion.div>

        {/* Grid de plantillas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((tpl, i) => {
            const style = planStyles[tpl.plan]
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: 'easeOut' }}
                className={`group bg-white rounded-2xl border border-[#E5DCCB] shadow-sm hover:shadow-xl ${style.ring} ${style.hover} transition-all duration-300 overflow-hidden flex flex-col`}
              >
                {/* Preview (cropped) + link a demo */}
                <a
                  href={`/demo/${tpl.id}`}
                  className="relative block aspect-[4/5] overflow-hidden bg-gray-100"
                  aria-label={`Ver demo de la plantilla ${tpl.name}`}
                >
                  <Image
                    src={`/templates/${tpl.id}-preview.png`}
                    alt={`Tienda de ejemplo con la plantilla ${tpl.name} de TiendApp`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Plan badge */}
                  <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-md ${style.badge}`}>
                    {tpl.plan === 'premium' && <Crown className="w-3 h-3" />}
                    {tpl.planLabel}
                  </div>
                  {tpl.isNew && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#BC5A38] text-white shadow-md">
                      ⭐ Nuevo
                    </div>
                  )}
                  {/* Hover overlay con CTA */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-bold shadow-xl">
                      <Eye className="w-4 h-4" />
                      Ver tienda en vivo
                    </span>
                  </div>
                </a>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <tpl.icon className="w-4 h-4 text-[#BC5A38]" />
                    <h3 className="font-display font-bold text-stone-900">{tpl.name}</h3>
                  </div>
                  <p className="text-sm text-stone-500 mb-3 flex-1">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tpl.bestFor.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-[#F6E7DE] text-[#BC5A38] text-xs font-medium border border-[#BC5A38]/15">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* CTAs: SIEMPRE visibles (móvil no tiene hover) */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Button
                      size="sm"
                      onClick={() => window.location.href = `/demo/${tpl.id}`}
                      className="flex-1 bg-stone-900 hover:bg-[#BC5A38] text-white font-semibold rounded-full"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver demo
                    </Button>
                    {tpl.plan === 'free' ? (
                      <Button
                        size="sm"
                        onClick={() => navigate({ page: 'register' })}
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-lg"
                      >
                        Usar gratis
                      </Button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Show more / less */}
        <div className="text-center mt-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#BC5A38]/40 text-[#BC5A38] font-semibold hover:bg-[#F6E7DE] transition-colors"
          >
            {showAll ? 'Ver menos diseños' : `Ver los ${templates.length} diseños`}
            <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        </div>
      </div>
    </section>
  )
}
