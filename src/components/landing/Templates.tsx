'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eye, Crown, ArrowRight, Check, Sparkles, Gem, Sun, Minimize2 } from 'lucide-react'

const templates = [
  {
    id: 'moderna',
    name: 'Moderna',
    badge: null,
    description: 'Diseño limpio y profesional con navegación intuitiva, banner hero y productos en grid. La plantilla más popular para tiendas de moda, tecnología y lifestyle.',
    bestFor: ['Moda', 'Tech', 'Lifestyle'],
    icon: Gem,
    accentColor: 'violet',
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    badge: null,
    description: 'Colores llamativos, categorías visuales y promociones destacadas. Perfecto para tiendas juveniles, streetwear y productos con personalidad única.',
    bestFor: ['Streetwear', 'Youth', 'Pop Culture'],
    icon: Sparkles,
    accentColor: 'orange',
  },
  {
    id: 'clasica',
    name: 'Clásica',
    badge: null,
    description: 'Tonos cálidos, diseño en lista y estilo artesanal. Transmite confianza y tradición, ideal para artesanías, food y productos locales peruanos.',
    bestFor: ['Artesanías', 'Food', 'Local'],
    icon: Sun,
    accentColor: 'amber',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    badge: 'Premium',
    description: 'Elegancia oscura con acabados dorados y separadores visualmente exclusivos. Para marcas que quieren proyectar lujo y sofisticación absoluta.',
    bestFor: ['Joyería', 'Alta Moda', 'Exclusive'],
    icon: Crown,
    accentColor: 'gold',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    badge: 'Premium',
    description: 'Ultra limpio, estilo Apple. Espacios amplios, tipografía precisa y zero distracciones. Para marcas modernas que comunican con simplicidad.',
    bestFor: ['Design', 'Cosmetics', 'Modern'],
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
      }
    default: // moderna
      return {
        cardBorder: 'border-violet-200 hover:border-violet-300',
        iconColor: 'text-violet-600',
        btnClass: 'border-violet-200 text-violet-600 hover:bg-violet-50',
        btnPrimary: 'bg-violet-600 hover:bg-violet-700 text-white',
        badgeClass: 'from-violet-500 to-violet-700 text-white',
        bestForBg: 'bg-violet-50 text-violet-700',
        tagBg: 'bg-violet-50/50 border-violet-100',
      }
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
            Cada plantilla es una tienda completa con navegación, productos, WhatsApp y todo listo para vender. No son solo colores, son tiendas de verdad.
          </p>
        </motion.div>

        {/* Template showcase - Shopify style */}
        <div className="space-y-10">
          {templates.map((tpl, i) => {
            const accent = getAccentClasses(tpl.id)
            const isEven = i % 2 === 0

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
                    {/* Premium badge */}
                    {tpl.badge && (
                      <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 bg-gradient-to-r ${accent.badgeClass} text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5`}>
                        <Crown className="w-3.5 h-3.5" />
                        {tpl.badge}
                      </div>
                    )}
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
                    {tpl.badge && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${accent.badgeClass}`}>
                        {tpl.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{tpl.description}</p>

                  {/* Best for tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
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

                  {/* Features list */}
                  <div className="space-y-2.5 mb-6">
                    {[
                      'Productos con fotos, precios y descripción',
                      'Botón de WhatsApp integrado',
                      'Categorías y búsqueda',
                      '100% responsive (se ve perfecto en celular)',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${accent.bestForBg}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      onClick={() => window.location.href = `/demo/${tpl.id}`}
                      className={`gap-2 ${accent.btnPrimary}`}
                    >
                      <Eye className="w-5 h-5" />
                      Ver demo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.location.href = '/auth/register'}
                      className={`gap-2 ${accent.btnClass}`}
                    >
                      Usar esta plantilla
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
