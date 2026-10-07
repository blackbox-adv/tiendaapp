'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, Crown, ArrowRight, Search, Sparkles, Gem, Sun, Minimize2, ShoppingBasket, UtensilsCrossed, Shirt, BookOpen, Cpu, ShoppingBag, Newspaper, Flower2, Hand, Cake, Zap, Armchair, Dumbbell, Coffee, Flower, LayoutGrid, ChefHat, Fish, Croissant, Beer, Store } from 'lucide-react'
import { PLAN_PRICES } from '@/lib/plans'
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
    id: 'dulce',
    name: 'Dulce',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Pastelería y postres: lila pastel, stickers y precios amigables. Encargos para cumpleaños y eventos.',
    bestFor: ['Pastelerías', 'Postres', 'Cafeterías'],
    tags: ['comida'],
    isNew: true,
    icon: Cake,
  },
  {
    id: 'calle',
    name: 'Calle',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Streetwear urbano: negro y lima ácido, tipografía gigante y drops en edición limitada.',
    bestFor: ['Polos', 'Gorras', 'Sneakers'],
    tags: ['moda'],
    isNew: true,
    icon: Zap,
  },
  {
    id: 'aura',
    name: 'Aura',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Joyería fina: champán y oro, serif editorial y líneas doradas. Piezas que se sienten de marca.',
    bestFor: ['Joyería', 'Relojes', 'Accesorios'],
    tags: ['belleza'],
    isNew: true,
    icon: Gem,
  },
  {
    id: 'teca',
    name: 'Teca',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Hogar y decoración: verde salvia, madera cálida y ambiente acogedor para renovar rincones.',
    bestFor: ['Decoración', 'Textil', 'Cocina'],
    tags: ['hogar'],
    isNew: true,
    icon: Armchair,
  },
  {
    id: 'volt',
    name: 'Volt',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Deporte y fitness: azul marino y naranja eléctrico, stats de confianza y envío 24h protagonista.',
    bestFor: ['Gym', 'Deporte', 'Suplementos'],
    tags: ['general'],
    isNew: true,
    icon: Dumbbell,
  },
  {
    id: 'grano',
    name: 'Grano',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Café de especialidad y pan artesanal: crema y espresso, con carta estilo menú con líneas punteadas.',
    bestFor: ['Cafeterías', 'Panaderías', 'Deli'],
    tags: ['comida'],
    isNew: true,
    icon: Coffee,
  },
  {
    id: 'flora',
    name: 'Flora',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Florería y regalos: aireado, verde botánico y rosa empolvado. Ramos que se regalan con el corazón.',
    bestFor: ['Flores', 'Regalos', 'Detalles'],
    tags: ['general'],
    isNew: true,
    icon: Flower,
  },
  {
    id: 'mesa',
    name: 'Mesa',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Restaurante de casa: menú del día, carta elegante con serif y reservas por WhatsApp. Sazón que se nota.',
    bestFor: ['Restaurantes', 'Menú del día', 'Delivery'],
    tags: ['comida'],
    isNew: true,
    icon: ChefHat,
  },
  {
    id: 'sushi',
    name: 'Nikkei',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Sushi bar claro y moderno: rojo japonés, círculos tipo nigiri y tablas protagonistas. Fresco de verdad.',
    bestFor: ['Sushi', 'Nikkei', 'Ceviches'],
    tags: ['comida'],
    isNew: true,
    icon: Fish,
  },
  {
    id: 'cafe',
    name: 'Barista',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Cafetería moderna y amigable: lattes, frappés y postres con stickers y promos 2x1.',
    bestFor: ['Cafeterías', 'Postres', 'Frappés'],
    tags: ['comida'],
    isNew: true,
    icon: Croissant,
  },
  {
    id: 'bar',
    name: 'Barra',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Bar de barrio con carácter: verde botella, ámbar, happy hour y piqueos que se comparten.',
    bestFor: ['Bares', 'Piqueos', 'Cantinas'],
    tags: ['comida'],
    isNew: true,
    icon: Beer,
  },
  {
    id: 'pop',
    name: 'Pop',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'E-commerce multi-rubro claro y directo: ofertas protagonistas, envío gratis y catálogo veloz.',
    bestFor: ['Tiendas variadas', 'Hogar', 'Tech'],
    tags: ['general', 'tech', 'hogar'],
    isNew: true,
    icon: Store,
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
    name: 'Tech',
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Blanco premium con banner y acento azul. Ideal para celulares y gadgets.',
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
    description: 'Limpia y profesional. Perfecta para empezar hoy mismo.',
    bestFor: ['Cualquier rubro'],
    tags: ['general'],
    icon: Gem,
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    plan: 'free',
    planLabel: 'Gratis',
    description: 'Colores llamativos, buscador y promociones que se notan.',
    bestFor: ['Streetwear', 'Tecnología'],
    tags: ['general', 'tech'],
    icon: Sparkles,
  },
  {
    id: 'clasica',
    name: 'Clásica',
    plan: 'free',
    planLabel: 'Gratis',
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

        {/* Muro estilo Pinterest: cada ficha es una tienda distinta */}
        <div className="columns-2 md:columns-3 xl:columns-4 gap-4 md:gap-5">
          {visible.map((tpl, i) => {
            const style = planStyles[tpl.plan]
            const pinAspects = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[1/1]', 'aspect-[4/5]', 'aspect-[4/3]']
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.06, ease: 'easeOut' }}
                className="break-inside-avoid mb-4 md:mb-5"
              >
                <a href={`/demo/${tpl.id}`} className="group block" aria-label={`Ver demo de la tienda ${tpl.name}`}>
                  <div className={`relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-xl transition-shadow duration-300 ${pinAspects[i % pinAspects.length]}`}>
                    <Image
                      src={`/templates/${tpl.id}-preview.png`}
                      alt={`Tienda de ejemplo con la plantilla ${tpl.name} de Kyllari`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    {tpl.featured && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-900/85 backdrop-blur-sm text-white shadow-md">
                        El favorito para tiendas de ropa
                      </div>
                    )}
                    {/* Hover CTA */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold shadow-xl">
                        <Eye className="w-4 h-4" />
                        Ver tienda
                      </span>
                    </div>
                    {/* Nombre y plan siempre visibles (móvil no tiene hover) */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pt-8 pb-2.5 px-3 flex items-end justify-between gap-2">
                      <h3 className="font-display font-bold text-white text-sm md:text-base leading-tight drop-shadow-sm">
                        {tpl.name}
                      </h3>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${style.badge}`}>
                        {tpl.plan === 'premium' && <Crown className="w-2.5 h-2.5" />}
                        {tpl.planLabel}
                      </span>
                    </div>
                  </div>
                </a>
              </motion.div>
            )
          })}
        </div>

        {/* CTA final */}
        <div className="text-center mt-12">
          <p className="text-stone-500 mb-4 text-sm">
            Todos los diseños incluyen carrito, pedidos por WhatsApp, Yape/Plin y envíos. Cada mes sumamos un diseño nuevo.
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
