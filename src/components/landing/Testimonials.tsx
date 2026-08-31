'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Pizza, Shirt, Smartphone, Store } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { supportWhatsappUrl } from '@/lib/support'

// Tiendas demo reales que existen en la plataforma (slugs de producción).
// Al entrar, el visitante puede tocar el botón de WhatsApp y vivir el flujo
// completo de pedido: así se demuestra el producto sin testimonios inventados.
const REAL_STORES = [
  {
    slug: 'pizzeria-napoli',
    name: 'Pizzería Napoli',
    industry: 'Pizzería · Comida',
    template: 'Plantilla Vibrante',
    description: 'Carta completa con fotos, promociones del día y pedidos que llegan directo al WhatsApp del negocio.',
    icon: Pizza,
    accent: 'text-orange-600 bg-orange-50',
  },
  {
    slug: 'boutique-elegance',
    name: 'Boutique Elegance',
    industry: 'Moda · Accesorios',
    template: 'Plantilla Clásica',
    description: 'Catálogo por categorías con diseños claros y consultas de tallas o disponibilidad en un toque.',
    icon: Shirt,
    accent: 'text-blue-700 bg-blue-50',
  },
  {
    slug: 'techstore-peru',
    name: 'TechStore Perú',
    industry: 'Tecnología',
    template: 'Plantilla Moderna',
    description: 'Productos con especificaciones y precios destacados, con clientes que preguntan el stock al instante.',
    icon: Smartphone,
    accent: 'text-violet-600 bg-violet-50',
  },
]

export function Testimonials() {
  const navigate = useAppStore((s) => s.navigate)
  const waHref = supportWhatsappUrl('Hola! Quiero saber si TiendApp funciona para mi negocio')

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Tiendas reales</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Entra a estas tiendas y pruébalo tú mismo
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Nada de capturas de pantalla: estas tiendas están funcionando ahora mismo.
            Elige un producto, toca el botón verde y mira cómo llega el pedido por
            WhatsApp — así de fácil le compra la gente a tus clientes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {REAL_STORES.map((store, i) => {
            const Icon = store.icon
            return (
              <motion.a
                key={store.slug}
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-violet-200 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${store.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                    {store.template}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg">{store.name}</h3>
                <p className="text-xs text-violet-600 font-medium mb-3">{store.industry}</p>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">{store.description}</p>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-violet-700 group-hover:text-violet-800">
                    Ver tienda en vivo
                  </span>
                  <span className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.a>
            )
          })}
        </div>

        {/* Franja de confianza: prueba el producto o habla con nosotros */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-10 sm:px-12 sm:py-12 text-center relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <Store className="w-4 h-4" />
              100% peruano · Sin tarjeta · Sin comisión por venta
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              ¿Dudas que funcione para tu negocio?
            </h3>
            <p className="text-violet-100 max-w-2xl mx-auto mb-8">
              Crea tu tienda gratis en minutos, sube tus productos y comparte tu catálogo
              por WhatsApp hoy mismo. Si necesitas ayuda para configurarla, escríbenos:
              te respondemos en minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate({ page: 'register' })}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-violet-700 font-semibold rounded-xl hover:bg-violet-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Crear mi tienda gratis
              </button>
              <a
                href={waHref ?? '/contact'}
                target={waHref ? '_blank' : undefined}
                rel={waHref ? 'noopener noreferrer' : undefined}
                className="w-full sm:w-auto px-8 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/60 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {waHref ? 'Escríbenos por WhatsApp' : 'Contáctanos'}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
