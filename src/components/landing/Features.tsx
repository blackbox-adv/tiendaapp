'use client'

import { motion } from 'framer-motion'
import {
  Smartphone, MessageCircle, Wallet, Clock, Rocket, Package, Gift,
} from 'lucide-react'

// Features escritas como BENEFICIOS (qué gana el emprendedor),
// no como características técnicas. Lenguaje claro y enfocado en
// casos de uso reales del emprendedor peruano.
const features = [
  {
    icon: Wallet,
    title: 'Cobra con Yape y Plin al instante',
    description:
      'Tus clientes ven tu QR de Yape o Plin directo en la tienda y te pagan al toque. El dinero llega a tu cuenta, no pasa por nosotros. Sin comisión por venta, sin esperas, sin trámites.',
  },
  {
    icon: MessageCircle,
    title: 'Pedidos directos por WhatsApp',
    description:
      'El cliente toca un botón y te escribe por WhatsApp con el pedido listo. Tú despachas. Es el mismo flujo que ya usas con tus clientes, solo que ahora lo hacen desde una tienda profesional.',
  },
  {
    icon: Clock,
    title: 'Tu tienda lista en 5 minutos',
    description:
      'Sin programar, sin contratar diseñador. Registras, eliges plantilla, subes tus productos y compartes el link. Hoy mismo puedes estar recibiendo tu primer pedido.',
  },
  {
    icon: Smartphone,
    title: 'Tus clientes compran desde el celular',
    description:
      'Tus clientes compran desde su celular, y la tienda carga rápido con botones grandes y claros. El 90% de tus ventas vendrán del móvil, y todo está optimizado para esa experiencia.',
  },
  {
    icon: Package,
    title: 'Catálogo ilimitado con fotos',
    description:
      'Sube todos los productos que quieras con foto, precio, descripción y stock. Organízalos por categorías. Tus clientes ven todo ordenado, no andan preguntando "¿qué tienes?" por WhatsApp.',
  },
  {
    icon: Gift,
    title: 'Packs y promociones que se venden solos',
    description:
      'TiendApp arma packs con descuento automáticamente (ej. pollo + gaseosa + papas) y resalta tus ofertas. El cliente toca un botón y te pide el pack completo por WhatsApp.',
  },
  {
    icon: Rocket,
    title: 'Vende en todo el Perú',
    description:
      'Comparte tu link por WhatsApp, Instagram, Facebook o TikTok. Llegas a clientes fuera de tu ciudad sin pagar envíos ni intermediarios. Tú despachas, tú cobras, tú decides.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
            Beneficios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Todo lo que necesitas para vender online
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Hecho para emprendedores peruanos. Sin código, sin comisiones por venta y sin
            complicaciones. Tú te enfocas en vender, nosotros en la tecnología.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-600 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-violet-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
