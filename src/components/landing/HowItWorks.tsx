'use client'

import { motion } from 'framer-motion'
import { UserPlus, Store, MessageCircle } from 'lucide-react'

const STEPS = [
  {
    icon: UserPlus,
    step: '1',
    title: 'Regístrate gratis',
    description:
      'Crea tu cuenta con tu correo en menos de 1 minuto. Sin tarjeta de crédito y sin compromiso. El plan gratis es para siempre.',
    highlight: 'Sin tarjeta',
  },
  {
    icon: Store,
    step: '2',
    title: 'Arma tu tienda',
    description:
      'Elige una plantilla, sube tus productos con foto y precio, y configura tu número de WhatsApp, Yape y Plin. Todo desde el panel, sin programar.',
    highlight: 'En 5 minutos',
  },
  {
    icon: MessageCircle,
    step: '3',
    title: 'Empieza a vender',
    description:
      'Comparte el link de tu tienda por WhatsApp, Instagram o Facebook. Tus clientes te escriben, te pagan por Yape/Plin y tú despachas. Así de simple.',
    highlight: 'Pedidos hoy mismo',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
            ¿Cómo funciona?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            De cero a vendiendo en 3 pasos
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Sin programar, sin contratos y sin comisiones por venta. Así de fácil es empezar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-violet-200 via-violet-300 to-violet-200" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
              className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="relative inline-flex items-center justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-violet-600" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {step.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{step.description}</p>

              <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
                {step.highlight}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
