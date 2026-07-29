'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eye, Crown, ArrowRight, Check, Sparkles, Gem, Sun, Minimize2, Lock, Search, Filter, X } from 'lucide-react'

type PlanType = 'free' | 'pro' | 'premium'

interface Template {
  id: string
  name: string
  plan: PlanType
  planLabel: string
  planPrice: string
  description: string
  bestFor: string[]
  features: { text: string; included: boolean }[]
  icon: React.ElementType
  accentColor: string
}

const templates: Template[] = [
  {
    id: 'moderna',
    name: 'Moderna',
    plan: 'free',
    planLabel: 'Gratis',
    planPrice: 'S/0.00',
    description: 'Diseño limpio y profesional con navegación intuitiva, banner hero y productos en grid. La plantilla incluida en el plan gratuito para empezar a vender hoy mismo.',
    bestFor: ['Moda', 'Tech', 'Lifestyle'],
    features: [
      { text: 'Hasta 5 productos', included: true },
      { text: 'Botón de WhatsApp integrado', included: true },
      { text: '100% responsive', included: true },
      { text: 'Buscador de productos', included: false },
      { text: 'Categorías y filtros', included: false },
      { text: 'Sin badge TiendApp', included: false },
    ],
    icon: Gem,
    accentColor: 'violet',
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    plan: 'pro',
    planLabel: 'Pro',
    planPrice: 'S/29.90',
    description: 'Colores llamativos, categorías visuales, buscador integrado y promociones destacadas. Perfecto para tiendas juveniles, streetwear y productos con personalidad.',
    bestFor: ['Streetwear', 'Youth', 'Pop Culture'],
    features: [
      { text: 'Hasta 20 productos', included: true },
      { text: 'Buscador de productos', included: true },
      { text: 'Categorías y filtros', included: true },
      { text: 'Botón de WhatsApp integrado', included: true },
      { text: 'Promociones y descuentos', included: true },
      { text: 'Sin badge TiendApp', included: true },
      { text: 'Filtros avanzados', included: false },
    ],
    icon: Sparkles,
    accentColor: 'orange',
  },
  {
    id: 'clasica',
    name: 'Clásica',
    plan: 'pro',
    planLabel: 'Pro',
    planPrice: 'S/29.90',
    description: 'Tonos cálidos, diseño en lista con buscador y estilo artesanal. Transmite confianza y tradición, ideal para artesanías, food y productos locales peruanos.',
    bestFor: ['Artesanías', 'Food', 'Local'],
    features: [
      { text: 'Hasta 20 productos', included: true },
      { text: 'Buscador de productos', included: true },
      { text: 'Categorías y filtros', included: true },
      { text: 'Botón de WhatsApp integrado', included: true },
      { text: 'Sin badge TiendApp', included: true },
      { text: 'Filtros avanzados', included: false },
    ],
    icon: Sun,
    accentColor: 'amber',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    plan: 'premium',
    planLabel: 'Premium',
    planPrice: 'S/59.90',
    description: 'Elegancia oscura con acabados dorados, buscador avanzado, filtros y consultas privadas. Para marcas que quieren proyectar lujo y sofisticación absoluta.',
    bestFor: ['Joyería', 'Alta Moda', 'Exclusive'],
    features: [
      { text: 'Hasta 100 productos', included: true },
      { text: 'Buscador y filtros avanzados', included: true },
      { text: 'Categorías y subcategorías', included: true },
      { text: 'Botón de WhatsApp integrado', included: true },
      { text: 'Sin badge TiendApp', included: true },
      { text: 'Hasta 3 tiendas', included: true },
      { text: 'Soporte 24/7', included: true },
    ],
    icon: Crown,
    accentColor: 'gold',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    plan: 'premium',
    planLabel: 'Premium',
    planPrice: 'S/59.90',
    description: 'Ultra limpio, estilo Apple. Buscador avanzado, filtros, espacios amplios y tipografía precisa. Para marcas modernas que comunican con simplicidad.',
    bestFor: ['Design', 'Cosmetics', 'Modern'],
    features: [
      { text: 'Hasta 100 productos', included: true },
      { text: 'Buscador y filtros avanzados', included: true },
      { text: 'Categorías y subcategorías', included: true },
      { text: 'Botón de WhatsApp integrado', included: true },
      { text: 'Sin badge TiendApp', included: true },
      { text: 'Hasta 3 tiendas', included: true },
      { text: 'Soporte 24/7', included: true },
    ],
    icon: Minimize2,
    accentColor: 'gray',
  },
]

function getAccentClasses(id: string) {
  switch (id) {
    case 'luxury':
      return {
        cardBorder: 'border-[#c8a456]/30 hover:border-[#c8a456]/50',
        iconColor: 'text-[#c8a456]',
        btnClass: 'border-[#c8a456] text-[#c8a456] hover:bg-[#c8a456]/5',
        btnPrimary: 'bg-[#c8a456] hover:bg-[#c8a456]/90 text-[#0f0f1a]',
        badgeClass: 'from-[#c8a456] to-[#f0d078] text-[#0f0f1a]',
        bestForBg: 'bg-[#c8a456]/10 text-[#c8a456]',
        tagBg: 'bg-[#c8a456]/5 border-[#c8a456]/10',
        planBg: 'bg-[#c8a456]/10 text-[#c8a456] border-[#c8a456]/20',
      }
    case 'minimalist':
      return {
        cardBorder: 'border-gray-200 hover:border-gray-300',
        iconColor: 'text-gray-700',
        btnClass: 'border-gray-300 text-gray-600 hover:bg-gray-50',
        btnPrimary: 'bg-gray-900 hover:bg-gray-800 text-white',
        badgeClass: 'from-gray-500 to-gray-700 text-white',
        bestForBg: 'bg-gray-100 text-gray-600',
        tagBg: 'bg-gray-50 border-gray-100',
        planBg: 'bg-gray-100 text-gray-700 border-gray-200',
      }
    case 'vibrante':
      return {
        cardBorder: 'border-orange-200 hover:border-orange-300',
        iconColor: 'text-orange-500',
        btnClass: 'border-orange-200 text-orange-600 hover:bg-orange-50',
        btnPrimary: 'bg-orange-500 hover:bg-orange-600 text-white',
        badgeClass: 'from-orange-400 to-pink-500 text-white',
        bestForBg: 'bg-orange-50 text-orange-700',
        tagBg: 'bg-orange-50/50 border-orange-100',
        planBg: 'bg-orange-50 text-orange-700 border-orange-200',
      }
    case 'clasica':
      return {
        cardBorder: 'border-amber-200 hover:border-amber-300',
        iconColor: 'text-amber-600',
        btnClass: 'border-amber-200 text-amber-700 hover:bg-amber-50',
        btnPrimary: 'bg-amber-700 hover:bg-amber-800 text-white',
        badgeClass: 'from-amber-500 to-amber-700 text-white',
        bestForBg: 'bg-amber-50 text-amber-700',
        tagBg: 'bg-amber-50/50 border-amber-100',
        planBg: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    default: // moderna (free)
      return {
        cardBorder: 'border-violet-200 hover:border-violet-300',
        iconColor: 'text-violet-600',
        btnClass: 'border-violet-200 text-violet-600 hover:bg-violet-50',
        btnPrimary: 'bg-violet-600 hover:bg-violet-700 text-white',
        badgeClass: 'from-violet-500 to-violet-700 text-white',
        bestForBg: 'bg-violet-50 text-violet-700',
        tagBg: 'bg-violet-50/50 border-violet-100',
        planBg: 'bg-violet-50 text-violet-700 border-violet-200',
      }
  }
}

function getPlanBadge(plan: PlanType, label: string) {
  switch (plan) {
    case 'free':
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: null }
    case 'pro':
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Search }
    case 'premium':
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Crown }
  }
}

export function Templates() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section id="templates" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Plantillas</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Tu tienda se verá así de profesional
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Cada plan incluye plantillas con diferentes funcionalidades. Mientras más avanzado el plan, más herramientas para vender.
          </p>
          {/* Plan legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Gratis
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
              <Search className="w-3.5 h-3.5" />
              Pro · S/29.90/mes
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium text-amber-700">
              <Crown className="w-3.5 h-3.5" />
              Premium · S/59.90/mes
            </div>
          </div>
        </motion.div>

        {/* Template showcase */}
        <div className="space-y-12">
          {templates.map((tpl, i) => {
            const accent = getAccentClasses(tpl.id)
            const isEven = i % 2 === 0
            const planBadge = getPlanBadge(tpl.plan, tpl.planLabel)

            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image side */}
                <div className="flex-1 w-full">
                  <div className={`relative rounded-2xl overflow-hidden border-2 shadow-lg transition-all duration-500 ${accent.cardBorder} ${hoveredId === tpl.id ? 'shadow-2xl scale-[1.02]' : ''}`}>
                    {/* Plan badge */}
                    <div className={`absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg ${planBadge.bg}`}>
                      {planBadge.icon && <planBadge.icon className="w-3.5 h-3.5" />}
                      {tpl.planLabel}
                    </div>
                    {/* Browser chrome */}
                    <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100 bg-gray-50/80">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="rounded-md px-4 py-1 text-xs border bg-white text-gray-400 border-gray-200 font-mono">
                          mitienda.tiendapp.pe
                        </div>
                      </div>
                    </div>
                    {/* Store screenshot */}
                    <div className="relative bg-white overflow-hidden">
                      <Image
                        src={`/templates/${tpl.id}-preview.png`}
                        alt={`Plantilla ${tpl.name} - TiendApp`}
                        width={800}
                        height={900}
                        className="w-full h-auto"
                        priority={i < 2}
                      />
                      {/* Hover overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${hoveredId === tpl.id ? 'opacity-100' : 'opacity-0'}`}>
                        <Button
                          size="lg"
                          onClick={() => window.location.href = `/demo/${tpl.id}`}
                          className={`gap-2 shadow-xl ${accent.btnPrimary}`}
                        >
                          <Eye className="w-5 h-5" />
                          Ver tienda en vivo
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info side */}
                <div className="flex-1 w-full lg:max-w-md">
                  <div className="flex items-center gap-3 mb-3">
                    <tpl.icon className={`w-6 h-6 ${accent.iconColor}`} />
                    <h3 className="text-2xl font-bold text-gray-900">{tpl.name}</h3>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${planBadge.bg}`}>
                      {planBadge.icon && <planBadge.icon className="w-3 h-3" />}
                      {tpl.planLabel}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{tpl.description}</p>

                  {/* Best for tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {tpl.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${accent.tagBg}`}
                      >
                        <Check className={`w-3.5 h-3.5 ${accent.iconColor}`} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Features list with included/excluded */}
                  <div className="space-y-2.5 mb-6">
                    {tpl.features.map((feature) => (
                      <div key={feature.text} className="flex items-center gap-2.5">
                        {feature.included ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${accent.bestForBg}`}>
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                        {!feature.included && (
                          <span className="text-xs text-gray-400 ml-auto">Pro / Premium</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {tpl.plan === 'free' ? (
                      <Button
                        size="lg"
                        onClick={() => window.location.href = '/auth/register'}
                        className={`gap-2 ${accent.btnPrimary}`}
                      >
                        Crear tienda gratis
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={() => window.location.href = `/demo/${tpl.id}`}
                        className={`gap-2 ${accent.btnPrimary}`}
                      >
                        <Eye className="w-5 h-5" />
                        Ver demo
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.location.href = '/auth/register'}
                      className={`gap-2 ${accent.btnClass}`}
                    >
                      {tpl.plan === 'free' ? 'Ver demo' : 'Usar esta plantilla'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
