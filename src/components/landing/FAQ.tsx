'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { supportWhatsappUrl } from '@/lib/support'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: '¿TiendApp cobra comisión por cada venta?',
    answer:
      'No. A diferencia de otras plataformas que cobran entre 5% y 15% por venta, TiendApp no se queda con nada de tus ventas. Solo pagas la mensualidad del plan que elijas (o nada si usas el plan gratis). Todo lo que cobres por Yape, Plin o transferencia es 100% tuyo.',
  },
  {
    question: '¿Necesito RUC para crear mi tienda?',
    answer:
      'No es obligatorio. Puedes empezar con el plan gratis usando solo tu nombre. Si más adelante quieres emitir boletas o facturas, puedes agregar tu RUC cuando lo tengas. Muchos emprendedores empiezan sin RUC y lo agregan cuando su negocio crece.',
  },
  {
    question: '¿Cómo recibo los pagos de mis clientes? ¿Funciona con Yape y Plin?',
    answer:
      'Sí. Desde el panel de tu tienda configuras tu número de Yape y Plin (y subes el código QR de tu app bancaria). Cuando un cliente hace un pedido, ve los QR directamente en la tienda y te paga al instante. El dinero llega a tu cuenta de Yape/Plin, no pasa por TiendApp. También funciona con transferencias bancarias.',
  },
  {
    question: '¿Funciona bien desde el celular de mis clientes?',
    answer:
      'Sí, todas las plantillas están diseñadas mobile-first. La mayoría de tus clientes verán tu tienda desde su celular, y la experiencia está optimizada para eso: carga rápida, botones grandes, WhatsApp en un toque, y los QR de Yape/Plin se ven perfectos en pantalla móvil.',
  },
  {
    question: '¿Puedo cancelar cuando quiera? ¿Hay permanencia?',
    answer:
      'No hay permanencia ni contratos. Cancelas cuando quieras desde el panel de tu tienda con un clic. Si cancelas el plan Pro o Premium, tu tienda pasa automáticamente al plan gratis y sigues vendiendo con las funciones básicas. No te cobramos nada por cancelar.',
  },
  {
    question: '¿Necesito tarjeta de crédito para registrarme?',
    answer:
      'No. El plan gratis no pide tarjeta. Te registras con tu correo, creas tu tienda y empiezas a vender. Solo si decides pasar a Pro o Premium necesitarás un método de pago, y puedes pagar con Yape, Plin o transferencia bancaria desde Perú.',
  },
]

export function FAQ() {
  const waHref = supportWhatsappUrl('Hola! Tengo una duda sobre TiendApp')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
            Preguntas frecuentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Resolvemos tus dudas
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Lo que más preguntan los emprendedores peruanos antes de crear su tienda.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                className={`rounded-2xl border transition-colors ${
                  isOpen
                    ? 'border-violet-200 bg-violet-50/40'
                    : 'border-gray-200 bg-white hover:border-violet-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-violet-600 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-600 leading-relaxed text-sm sm:text-base">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          ¿Tienes otra duda?{' '}
          <a
            href={waHref ?? '/contact'}
            target={waHref ? '_blank' : undefined}
            rel={waHref ? 'noopener noreferrer' : undefined}
            className="text-violet-600 font-medium hover:underline"
          >
            {waHref ? 'Escríbenos por WhatsApp' : 'Contáctanos'}
          </a>{' '}
          y te respondemos en minutos.
        </motion.p>
      </div>
    </section>
  )
}
