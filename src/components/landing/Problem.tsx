'use client'

import { motion } from 'framer-motion'
import { MessageCircleX, HelpCircle, ImageOff } from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon'

const PAINS = [
  {
    icon: MessageCircleX,
    quote: '"¿Cuánto cuesta esto?"',
    description:
      'Respondes lo mismo 20 veces al día. Pedidos que llegan a media noche, mensajes que se pierden entre stickers y audios, y clientes que se cansan de esperar y te compran a otro.',
  },
  {
    icon: ImageOff,
    quote: '"Te mando las fotos por aquí"',
    description:
      'Tu catálogo son capturas sueltas en la galería del celular. El cliente no ve todo lo que tienes, no encuentra lo que busca y tu negocio se ve menos profesional de lo que es.',
  },
  {
    icon: HelpCircle,
    quote: '"¿Cuánto vendí esta semana?"',
    description:
      'No tienes claro cuántos pedidos entraron, cuánto te deben ni qué producto se vende más. Al final del mes, las cuentas no cuadran y no sabes por qué.',
  },
]

export function Problem() {
  return (
    <section id="problema" className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FBEAE4] border border-[#BC5A38]/20 text-[#BC5A38] text-sm font-semibold mb-5">
            <WhatsAppIcon className="w-4 h-4" />
            Vendes por WhatsApp... pero a duras penas
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            WhatsApp te trae clientes,{' '}
            <span className="accent-serif">pero te desorganiza las ventas</span>
          </h2>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Es la mejor herramienta para vender y la peor para administrar. Si te pasa
            alguna de estas, tu negocio está perdiendo dinero todos los días:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAINS.map((pain, i) => (
            <motion.div
              key={pain.quote}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: 'easeOut' }}
              className="relative bg-[#FAF6EF] rounded-2xl p-6 border border-[#E5DCCB] hover:border-[#BC5A38]/40 hover:bg-[#F6E7DE]/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F6E7DE] flex items-center justify-center mb-5">
                <pain.icon className="w-6 h-6 text-[#BC5A38]" />
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900 mb-2 italic">
                {pain.quote}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">{pain.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Transition line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-lg sm:text-xl font-semibold font-display text-stone-900 mt-12"
        >
          Con TiendApp, mismos clientes, mismos WhatsApp —{' '}
          <span className="accent-serif">pero con una tienda que vende sola.</span>
        </motion.p>
      </div>
    </section>
  )
}
