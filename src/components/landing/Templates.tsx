'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eye, Crown, Minimize2, Gem, Sparkles, Sun, ArrowRight, Check } from 'lucide-react'

/* ─── Realistic mini-store preview components ─── */

function ModernaPreview() {
  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden" style={{ fontSize: '5px' }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded bg-violet-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 text-white font-bold" style={{ fontSize: '4px' }}>⚡</div>
          </div>
          <span className="font-bold text-gray-900" style={{ fontSize: '5.5px' }}>Mi Tienda</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500" style={{ fontSize: '4px' }}>Ropa</span>
          <span className="text-gray-500" style={{ fontSize: '4px' }}>Accesorios</span>
          <span className="text-violet-600 font-semibold" style={{ fontSize: '4px' }}>Contacto</span>
        </div>
      </div>
      {/* Hero banner */}
      <div className="relative h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="font-bold tracking-wide" style={{ fontSize: '7px' }}>NUEVA COLECCIÓN</span>
          <span className="font-light mt-0.5" style={{ fontSize: '4px' }}>Primavera 2025</span>
        </div>
      </div>
      {/* Products grid */}
      <div className="px-2.5 py-2 grid grid-cols-2 gap-2">
        {[
          { name: 'Vestido Floral', price: 'S/89', bg: 'from-violet-100 to-violet-50' },
          { name: 'Blazer Negro', price: 'S/149', bg: 'from-gray-100 to-gray-50' },
          { name: 'Top Crochet', price: 'S/65', bg: 'from-pink-100 to-pink-50' },
          { name: 'Pantalón Wide', price: 'S/110', bg: 'from-indigo-100 to-indigo-50' },
        ].map((p, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-gray-100">
            <div className={`h-12 bg-gradient-to-br ${p.bg} flex items-center justify-center`}>
              <div className="w-6 h-8 rounded bg-white/60 border border-white/80"></div>
            </div>
            <div className="px-1.5 py-1.5">
              <span className="font-semibold text-gray-900 block" style={{ fontSize: '4.5px' }}>{p.name}</span>
              <span className="text-violet-600 font-bold" style={{ fontSize: '4px' }}>{p.price}</span>
            </div>
          </div>
        ))}
      </div>
      {/* WhatsApp button */}
      <div className="px-2.5 py-1.5">
        <div className="flex items-center gap-1 bg-green-500 rounded px-2 py-1 text-white">
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
          <span className="font-medium" style={{ fontSize: '3.5px' }}>Pedir por WhatsApp</span>
        </div>
      </div>
    </div>
  )
}

function VibrantePreview() {
  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden" style={{ fontSize: '5px' }}>
      {/* Nav with gradient */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-400 to-pink-500">
        <span className="font-bold text-white" style={{ fontSize: '5.5px' }}>🔥 La Tienda</span>
        <div className="flex gap-2">
          <span className="text-white/80" style={{ fontSize: '4px' }}>Inicio</span>
          <span className="text-white/80" style={{ fontSize: '4px' }}>Catálogo</span>
        </div>
      </div>
      {/* Categories pills */}
      <div className="px-2.5 py-1.5 flex gap-1 overflow-hidden">
        {['Todo', 'Ropa', 'Accesorios', 'Zapatos'].map((c, i) => (
          <div key={i} className={`px-1.5 py-0.5 rounded-full ${i === 0 ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`} style={{ fontSize: '3.5px' }}>{c}</div>
        ))}
      </div>
      {/* Product cards - colorful */}
      <div className="px-2.5 py-1.5 grid grid-cols-3 gap-1.5">
        {[
          { name: 'Polera', price: 'S/45', color: 'bg-pink-200' },
          { name: 'Gorra', price: 'S/25', color: 'bg-teal-200' },
          { name: 'Zapatillas', price: 'S/120', color: 'bg-yellow-200' },
        ].map((p, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <div className={`h-10 ${p.color} flex items-center justify-center`}>
              <div className="w-5 h-7 rounded bg-white/50 border border-white/60"></div>
            </div>
            <div className="px-1 py-1">
              <span className="font-semibold text-gray-900 block" style={{ fontSize: '4px' }}>{p.name}</span>
              <span className="text-orange-600 font-bold" style={{ fontSize: '3.5px' }}>{p.price}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Banner promo */}
      <div className="px-2.5 py-1.5">
        <div className="h-7 rounded-lg bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-400 flex items-center justify-center text-white">
          <span className="font-bold" style={{ fontSize: '4.5px' }}>¡DESCUENTO 20% HOY!</span>
        </div>
      </div>
      {/* WhatsApp */}
      <div className="px-2.5 py-1">
        <div className="flex items-center gap-1 bg-green-500 rounded px-1.5 py-0.5 text-white">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
          <span style={{ fontSize: '3px' }}>WhatsApp</span>
        </div>
      </div>
    </div>
  )
}

function ClasicaPreview() {
  return (
    <div className="w-full h-full bg-amber-50/30 rounded-lg overflow-hidden" style={{ fontSize: '5px' }}>
      {/* Nav warm */}
      <div className="flex items-center justify-between px-3 py-2 bg-amber-900 border-b border-amber-800">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-700 flex items-center justify-center">
            <span className="text-amber-200 font-bold" style={{ fontSize: '4px' }}>T</span>
          </div>
          <span className="font-bold text-amber-100" style={{ fontSize: '5.5px' }}>Artesanías PE</span>
        </div>
        <div className="flex gap-2">
          <span className="text-amber-300" style={{ fontSize: '4px' }}>Productos</span>
          <span className="text-amber-300" style={{ fontSize: '4px' }}>Sobre</span>
        </div>
      </div>
      {/* Warm banner */}
      <div className="h-14 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 flex flex-col items-center justify-center text-amber-100">
        <span className="font-bold" style={{ fontSize: '6px' }}>HECHO CON AMOR</span>
        <span className="font-light mt-0.5" style={{ fontSize: '4px' }}>Artesanía peruana directa del artesano</span>
      </div>
      {/* Products - list style */}
      <div className="px-2.5 py-2 space-y-1.5">
        {[
          { name: 'Cerámica Navideña', price: 'S/35', bg: 'bg-amber-100' },
          { name: 'Manta Alpaca', price: 'S/180', bg: 'bg-amber-200/50' },
          { name: 'Joyería Silver', price: 'S/95', bg: 'bg-amber-100/80' },
        ].map((p, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-amber-200/60 bg-white p-1.5">
            <div className={`w-8 h-8 rounded ${p.bg} flex items-center justify-center`}>
              <div className="w-4 h-5 rounded bg-amber-300/40 border border-amber-400/30"></div>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-amber-900 block" style={{ fontSize: '4.5px' }}>{p.name}</span>
              <span className="text-amber-600 font-bold" style={{ fontSize: '4px' }}>{p.price}</span>
            </div>
            <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center">
              <span className="text-green-600" style={{ fontSize: '3px' }}>📱</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LuxuryPreview() {
  return (
    <div className="w-full h-full bg-[#0f0f1a] rounded-lg overflow-hidden" style={{ fontSize: '5px' }}>
      {/* Nav dark luxury */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0a15] border-b border-[#c8a456]/20">
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded border border-[#c8a456]/40 flex items-center justify-center">
            <span className="text-[#c8a456] font-bold" style={{ fontSize: '4px' }}>L</span>
          </div>
          <span className="font-bold text-[#c8a456]" style={{ fontSize: '5.5px' }}>LUXE STORE</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#c8a456]/60" style={{ fontSize: '4px' }}>Colección</span>
          <span className="text-[#c8a456]/60" style={{ fontSize: '4px' }}>Exclusivo</span>
        </div>
      </div>
      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c8a456] to-transparent" />
      {/* Banner */}
      <div className="h-14 bg-[#0f0f1a] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#c8a456]/5 to-transparent"></div>
        <span className="text-[#c8a456] font-bold tracking-widest" style={{ fontSize: '6px' }}>EXCLUSIVO</span>
        <span className="text-[#f0d078]/70 font-light mt-0.5" style={{ fontSize: '3.5px' }}>Colección Privada 2025</span>
      </div>
      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c8a456]/40 to-transparent" />
      {/* Products - elegant */}
      <div className="px-2.5 py-2 grid grid-cols-2 gap-2">
        {[
          { name: 'Bolso Dorado', price: 'S/580', border: 'border-[#c8a456]/30' },
          { name: 'Vestido Gala', price: 'S/890', border: 'border-[#c8a456]/20' },
        ].map((p, i) => (
          <div key={i} className={`rounded-lg border ${p.border} bg-[#1a1a2e]/50 overflow-hidden`}>
            <div className="h-10 bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] flex items-center justify-center">
              <div className={`w-5 h-7 rounded border ${p.border} bg-[#c8a456]/10`}></div>
            </div>
            <div className="px-1.5 py-1">
              <span className="text-[#c8a456]/80 font-medium block" style={{ fontSize: '4px' }}>{p.name}</span>
              <span className="text-[#f0d078] font-bold" style={{ fontSize: '3.5px' }}>{p.price}</span>
            </div>
          </div>
        ))}
      </div>
      {/* WhatsApp gold */}
      <div className="px-2.5 py-1">
        <div className="flex items-center gap-1 bg-[#c8a456]/10 border border-[#c8a456]/20 rounded px-1.5 py-0.5 text-[#c8a456]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c8a456]/30"></div>
          <span style={{ fontSize: '3px' }}>Consultar</span>
        </div>
      </div>
    </div>
  )
}

function MinimalistPreview() {
  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden" style={{ fontSize: '5px' }}>
      {/* Nav - ultra clean */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="font-bold text-gray-900 tracking-tight" style={{ fontSize: '5.5px' }}>store.</span>
        <div className="flex gap-2">
          <span className="text-gray-400" style={{ fontSize: '4px' }}>Shop</span>
          <span className="text-gray-400" style={{ fontSize: '4px' }}>About</span>
        </div>
      </div>
      {/* Hero - minimal */}
      <div className="h-14 bg-gray-50 flex flex-col items-center justify-center">
        <span className="font-bold text-gray-900" style={{ fontSize: '6.5px' }}>Essentials</span>
        <div className="h-px w-8 bg-gray-900 mt-1"></div>
      </div>
      {/* Grid - clean squares */}
      <div className="px-2.5 py-2 grid grid-cols-4 gap-1">
        {[0,1,2,3].map((i) => (
          <div key={i} className="aspect-square rounded-sm bg-gray-100 flex items-center justify-center">
            <div className="w-3 h-4 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
      {/* Product detail - minimal */}
      <div className="px-2.5 py-1.5 space-y-0.5">
        <span className="font-medium text-gray-900 block" style={{ fontSize: '4.5px' }}>White Tee</span>
        <span className="text-gray-500" style={{ fontSize: '3.5px' }}>S/45</span>
      </div>
      {/* Button minimal */}
      <div className="px-2.5 py-1">
        <div className="bg-gray-900 rounded px-2 py-0.5 text-white text-center">
          <span style={{ fontSize: '3px' }}>Agregar</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Template data ─── */

const templates: Array<{
  id: string
  name: string
  icon: typeof Gem
  badge: string | null
  description: string
  bestFor: string
  accentColor: string
  PreviewComponent: React.ComponentType
}> = [
  {
    id: 'moderna',
    name: 'Moderna',
    icon: Gem,
    badge: null,
    description: 'Diseño limpio y profesional con navegación intuitiva, banner destacado y productos en grid. Ideal para tiendas de moda, tecnología y lifestyle.',
    bestFor: 'Moda · Tech · Lifestyle',
    PreviewComponent: ModernaPreview,
    accentColor: 'violet',
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    icon: Sparkles,
    badge: null,
    description: 'Colores llamativos, categorías visuales y promociones destacadas. Perfecto para tiendas juveniles, streetwear y productos con personalidad.',
    bestFor: 'Streetwear · Youth · Pop Culture',
    PreviewComponent: VibrantePreview,
    accentColor: 'orange',
  },
  {
    id: 'clasica',
    name: 'Clásica',
    icon: Sun,
    badge: null,
    description: 'Tonos cálidos, diseño en lista y estilo artesanal. Transmite confianza y tradición, ideal para artesanías, food y productos locales.',
    bestFor: 'Artesanías · Food · Local',
    PreviewComponent: ClasicaPreview,
    accentColor: 'amber',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: Crown,
    badge: 'Premium',
    description: 'Elegancia oscura con acabados dorados y separadores visualmente exclusivos. Para marcas que quieren proyectar lujo y sofisticación.',
    bestFor: 'Joyería · Alta Moda · Exclusive',
    PreviewComponent: LuxuryPreview,
    accentColor: 'gold',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: Minimize2,
    badge: 'Premium',
    description: 'Ultra limpio, estilo Apple. Espacios amplios, tipografía precisa y zero distracciones. Para marcas modernas que comunican con simplicidad.',
    bestFor: 'Design · Cosmetics · Modern',
    PreviewComponent: MinimalistPreview,
    accentColor: 'gray',
  },
]

/* ─── Color helpers ─── */

function getAccentClasses(id: string) {
  switch (id) {
    case 'luxury':
      return {
        cardBorder: 'border-[#c8a456]/40 hover:border-[#c8a456]/60',
        iconColor: 'text-[#c8a456]',
        btnClass: 'border-[#c8a456] text-[#c8a456] hover:bg-[#c8a456]/5',
        badgeClass: 'from-[#c8a456] to-[#f0d078] text-[#1a1a2e]',
        bestForBg: 'bg-[#c8a456]/10 text-[#c8a456]',
      }
    case 'minimalist':
      return {
        cardBorder: 'border-gray-200 hover:border-gray-300',
        iconColor: 'text-gray-700',
        btnClass: 'border-gray-300 text-gray-600 hover:bg-gray-50',
        badgeClass: 'from-gray-500 to-gray-700 text-white',
        bestForBg: 'bg-gray-100 text-gray-600',
      }
    case 'vibrante':
      return {
        cardBorder: 'border-orange-200 hover:border-orange-300',
        iconColor: 'text-orange-500',
        btnClass: 'border-orange-200 text-orange-600 hover:bg-orange-50',
        badgeClass: 'from-orange-400 to-pink-500 text-white',
        bestForBg: 'bg-orange-50 text-orange-700',
      }
    case 'clasica':
      return {
        cardBorder: 'border-amber-200 hover:border-amber-300',
        iconColor: 'text-amber-600',
        btnClass: 'border-amber-200 text-amber-700 hover:bg-amber-50',
        badgeClass: 'from-amber-500 to-amber-700 text-white',
        bestForBg: 'bg-amber-50 text-amber-700',
      }
    default: // moderna
      return {
        cardBorder: 'border-violet-200 hover:border-violet-300',
        iconColor: 'text-violet-600',
        btnClass: 'border-violet-200 text-violet-600 hover:bg-violet-50',
        badgeClass: 'from-violet-500 to-violet-700 text-white',
        bestForBg: 'bg-violet-50 text-violet-700',
      }
  }
}

export function Templates() {
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
            No son solo colores. Cada plantilla es una tienda completa con navegación, productos, WhatsApp y todo listo para vender desde el día uno.
          </p>
        </motion.div>

        {/* Template cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((tpl, i) => {
            const accent = getAccentClasses(tpl.id)
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="group"
              >
                {/* Card container */}
                <div className={`rounded-2xl overflow-hidden border-2 bg-white shadow-sm group-hover:shadow-xl transition-all duration-300 relative ${accent.cardBorder}`}>
                  {/* Premium badge */}
                  {tpl.badge && (
                    <div className={`absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r ${accent.badgeClass} text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5`}>
                      <Crown className="w-3.5 h-3.5" />
                      {tpl.badge}
                    </div>
                  )}

                  {/* Browser chrome - address bar */}
                  <div className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-100 bg-gray-50/80">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="rounded-md px-3 py-1 text-xs border bg-white text-gray-400 border-gray-200 flex items-center gap-1 font-mono">
                        mitienda.tiendapp.pe
                      </div>
                    </div>
                  </div>

                  {/* Realistic store preview */}
                  <div className="h-52 overflow-hidden relative">
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/demo/${tpl.id}`}
                        className={`gap-1.5 bg-white/95 backdrop-blur-sm border-0 shadow-lg ${accent.btnClass}`}
                      >
                        <Eye className="w-4 h-4" />
                        Ver tienda en vivo
                        {tpl.badge && <Crown className="w-3.5 h-3.5 opacity-60" />}
                      </Button>
                    </div>
                    <tpl.PreviewComponent />
                  </div>
                </div>

                {/* Info below card */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <tpl.icon className={`w-5 h-5 ${accent.iconColor}`} />
                    <h3 className="text-lg font-bold text-gray-900">{tpl.name}</h3>
                    {tpl.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${accent.badgeClass}`}>
                        {tpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tpl.description}</p>
                  {/* Best for tags */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${accent.bestForBg}`}>
                      <Check className="w-3 h-3" />
                      {tpl.bestFor}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/demo/${tpl.id}`}
                    className={`gap-2 ${accent.btnClass}`}
                  >
                    <Eye className="w-4 h-4" />
                    Ver demo
                    {tpl.badge && <Crown className="w-3.5 h-3.5 opacity-60" />}
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
