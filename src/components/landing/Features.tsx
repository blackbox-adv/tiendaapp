'use client'

import { motion } from 'framer-motion'
import {
  Layout, Smartphone, MessageCircle, BarChart3, Globe, ShieldCheck,
  Palette, Rocket, Package
} from 'lucide-react'

const features = [
  { icon: Layout, title: 'Plantillas Profesionales', description: 'Elige entre plantillas diseñadas por expertos que se adaptan a tu marca y estilo.' },
  { icon: Smartphone, title: '100% Responsive', description: 'Tu tienda se verá perfecta en celulares, tablets y computadoras automáticamente.' },
  { icon: MessageCircle, title: 'Integración WhatsApp', description: 'Tus clientes pueden contactarte y realizar pedidos directamente por WhatsApp.' },
  { icon: BarChart3, title: 'Estadísticas Avanzadas', description: 'Conoce el rendimiento de tu tienda con métricas y reportes en tiempo real.' },
  { icon: Globe, title: 'Dominio Personalizado', description: 'Usa tu propio dominio para darle un toque profesional a tu tienda online.' },
  { icon: ShieldCheck, title: 'Seguridad SSL', description: 'Tus datos y los de tus clientes están protegidos con certificado SSL gratuito.' },
  { icon: Palette, title: 'Personalización Total', description: 'Colores, fuentes y diseños personalizables para que tu tienda sea única.' },
  { icon: Rocket, title: 'Configuración Rápida', description: 'En menos de 5 minutos tendrás tu tienda lista para recibir pedidos.' },
  { icon: Package, title: 'Catálogo de Productos', description: 'Gestiona tus productos con imágenes, precios, categorías y stock ilimitado.' },
]

const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
}

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Funciones</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Todo lo que necesitas para vender online
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Herramientas profesionales para que tu tienda online destaque y genere más ventas.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
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
