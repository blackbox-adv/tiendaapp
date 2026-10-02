'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, Crown, ArrowRight, Search, Sparkles, Gem, Sun, Minimize2, ShoppingBasket, UtensilsCrossed, Shirt, BookOpen, Cpu, ShoppingBag, Newspaper, Flower2, Hand, LayoutGrid } from 'lucide-react'
import { PLAN_PRICES } from '@/lib/plans'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

type PlanType = 'free' | 'pro' | 'premium'
type Rubro = 'todos' | 'moda' | 'belleza' | 'comida' | 'hogar' | 'tech' | 'general'

interface Template {
  id: string
  name: string
  plan: PlanType
  planLabel: string
  description: string
  bestFor: string[]
  tags: Rubro[]
  isNew?: boolean
  featured?: boolean
  icon: React.ElementType
}

// Galería estilo catálogo: los 4 diseños "nivel revista" primero.
const templates: Template[] = [
  {
    id: 'boutique',
    name: 'Boutique',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'El look de las marcas top de ropa: hero editorial a pantalla completa, categorías con foto, oferta destacada y grilla lookbook.',
    bestFor: ['Ropa', 'Moda', 'Boutiques'],
    tags: ['moda'],
    isNew: true,
    featured: true,
    icon: ShoppingBag,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Catálogo estilo revista de moda: portada tipográfica, índice numerado y fichas de producto como en una publicación impresa.',
    bestFor: ['Ropa', 'Urbano', 'Accesorios'],
    tags: ['moda'],
    isNew: true,
    icon: Newspaper,
  },
  {
    id: 'atelier',
    name: 'Atelier',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Delicado y femenino: arcos, serif itálica y rosa empolvado. Piezas que se sienten de una marca de diseño.',
    bestFor: ['Vestidos', 'Belleza', 'Joyería'],
    tags: ['moda', 'belleza'],
    isNew: true,
    icon: Flower2,
  },
  {
    id: 'terracota',
    name: 'Terracota',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Cálido y artesanal: terracota, arena y serif con carácter. Perfecto para lo hecho a mano en el Perú.',
    bestFor: ['Tejidos', 'Artesanía', 'Hogar'],
    tags: ['moda', 'hogar'],
    isNew: true,
    icon: Hand,
  },
  {
    id: 'moda',
    name: 'Pasarela',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Editorial tipo revista: foto grande, minimal y precios sofisticados.',
    bestFor: ['Ropa', 'Gamarra', 'Accesorios'],
    tags: ['moda'],
    isNew: true,
    icon: Shirt,
  },
  {
    id: 'vitrina',
    name: 'Vitrina',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Lookbook editorial claro con serif elegante y producto estrella.',
    bestFor: ['Joyería', 'Flores', 'Belleza'],
    tags: ['belleza', 'moda'],
    isNew: true,
    icon: BookOpen,
  },
  {
    id: 'sabor',
    name: 'Sabores',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Carta digital elegante con favoritos del chef y menú por secciones.',
    bestFor: ['Restaurantes', 'Pollerías', 'Panaderías'],
    tags: ['comida'],
    isNew: true,
    icon: UtensilsCrossed,
  },
  {
    id: 'bodega',
    name: 'Mercadito',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Estilo bodega peruana: ofertas resaltadas y pedido al toque.',
    bestFor: ['Bodegas', 'Abarrotes', 'Mercados'],
    tags: ['comida', 'hogar'],
    isNew: true,
    icon: ShoppingBasket,
  },
  {
    id: 'neon',
    name: 'Neón',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Tech oscura con acentos eléctricos. Ideal para celulares y gadgets.',
    bestFor: ['Celulares', 'Electrónica', 'Gaming'],
    tags: ['tech'],
    isNew: true,
    icon: Cpu,
  },
  {
    id: 'moderna',
    name: 'Moderna',
    plan: 'free',
    planLabel: 'Gratis',
    description: 'Limpia y profesional. La del plan gratis para empezar hoy.',
    bestFor: ['Cualquier rubro'],
    tags: ['general'],
    icon: Gem,
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    plan: 'pro',
    planLabel: 'Pro',
    description: 'Colores llamativos, buscador y promociones que se notan.',
    bestFor: ['Streetwear', 'Tecnología'],
    tags: ['general', 'tech'],
    icon: Sparkles,
  },
  {
    id: 'clasica',
    name: 'Clásica',
    plan: 'pro',
    planLabel: 'Pro',
    description: 'Tonos cálidos que transmiten tradición y confianza.',
    bestFor: ['Artesanías', 'Comida casera'],
    tags: ['hogar', 'general'],
    icon: Sun,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Oscuro con acabados dorados. Para marcas premium.',
    bestFor: ['Joyería', 'Alta gama'],
    tags: ['belleza'],
    icon: Crown,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Estilo Apple: espacios amplios y tipografía precisa.',
    bestFor: ['Cosmética', 'Diseño'],
    tags: ['belleza', 'hogar'],
    icon: Minimize2,
  },
]

const rubroFilters: { id: Rubro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'moda', label: 'Moda y ropa' },
  { id: 'belleza', label: 'Belleza y joyería' },
  { id: 'comida', label: 'Comida' },
  { id: 'hogar', label: 'Hogar y artesanal' },
  { id: 'tech', label: 'Tecnología' },
  { id: 'general', label: 'Cualquier rubro' },
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
  const [rubro, setRubro] = useState<Rubro>('todos')
  const visible = rubro === 'todos' ? templates : templates.filter((t) => t.tags.includes(rubro))

  return (
    <section id="templates" className="py-20 sm:py-28 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <span className="text-sm font-semibold text-[#BC5A38] uppercase tracking-wider">
            Galería de diseños
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-stone-900 mt-3 mb-4">
            Catálogos que se ven <span className="italic text-[#BC5A38]">de revista</span>
          </h2>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-7">
            {templates.length} diseños listos para tu rubro, al nivel de los grandes catálogos.
            Toca cualquiera y recorre una tienda real con WhatsApp y Yape.
          </p>

          {/* Filtros por rubro */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <LayoutGrid className="w-4 h-4 text-stone-400 mr-1 hidden sm:block" />
            {rubroFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setRubro(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  rubro === f.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                    : 'bg-white text-stone-600 border-[#E5DCCB] hover:border-[#BC5A38] hover:text-[#BC5A38]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

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

        {/* Galería de plantillas (todas visibles, estilo mosaico) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((tpl, i) => {
            const style = planStyles[tpl.plan]
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.07, ease: 'easeOut' }}
                className={`group bg-white rounded-2xl border border-[#E5DCCB] shadow-sm hover:shadow-xl ${style.ring} ${style.hover} transition-all duration-300 overflow-hidden flex flex-col ${
                  tpl.featured ? 'sm:col-span-2' : ''
                }`}
              >
                {/* Preview (recortado como portada de catálogo) + link a demo */}
                <a
                  href={`/demo/${tpl.id}`}
                  className={`relative block overflow-hidden bg-gray-100 ${tpl.featured ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[3/4]'}`}
                  aria-label={`Ver demo de la plantilla ${tpl.name}`}
                >
                  <Image
                    src={`/templates/${tpl.id}-preview.png`}
                    alt={`Tienda de ejemplo con la plantilla ${tpl.name} de TiendApp`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                  {tpl.featured && (
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-900/85 backdrop-blur-sm text-white shadow-md">
                      El favorito para tiendas de ropa
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
                    <tpl.icon className="w-4 h-4 text-[#BC5A38] shrink-0" />
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

        {/* CTA final */}
        <div className="text-center mt-12">
          <p className="text-stone-500 mb-4 text-sm">
            Todos los diseños incluyen carrito, pedidos por WhatsApp, Yape/Plin y envíos.
          </p>
          <button
            onClick={() => navigate({ page: 'register' })}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#BC5A38] text-white font-bold hover:bg-[#a84b2d] transition-colors shadow-lg"
          >
            Crear mi tienda gratis
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
