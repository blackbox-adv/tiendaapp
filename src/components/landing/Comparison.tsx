'use client'

import { motion } from 'framer-motion'
import { Check, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

const ROWS = [
  { label: 'Catálogo con fotos, precios y stock', wa: false, ta: true },
  { label: 'Pedido armado automáticamente en el mensaje', wa: false, ta: true },
  { label: 'Tu QR de Yape y Plin visible en la tienda', wa: false, ta: true },
  { label: 'Packs con descuento y ofertas resaltadas', wa: false, ta: true },
  { label: 'Clientes de todo el Perú te encuentran con un link', wa: false, ta: true },
  { label: 'Sabes cuántos productos tienes y tus ofertas al día', wa: false, ta: true },
  { label: 'Sigues cobrando y atendiendo por WhatsApp', wa: true, ta: true },
]

export function Comparison() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <section id="comparativa" className="py-20 sm:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
            La diferencia
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            ¿No es lo mismo que usar WhatsApp Business solo?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            WhatsApp Business es tu canal de atención. TiendApp es tu tienda que lo
            alimenta con pedidos ordenados. Se complementan — mira la diferencia:
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_180px_180px] border-b border-gray-100 bg-gray-50/80">
            <div className="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Función
            </div>
            <div className="px-4 py-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center mb-1">
                <span className="text-emerald-600 font-bold text-lg">W</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-600">WhatsApp solo</p>
            </div>
            <div className="px-4 py-4 text-center bg-violet-50/60">
              <div className="w-10 h-10 mx-auto rounded-xl bg-violet-600 flex items-center justify-center mb-1">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-violet-700">Con TiendApp</p>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_180px_180px] items-center ${
                i < ROWS.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="px-4 sm:px-6 py-3.5 text-sm text-gray-700 font-medium">
                {row.label}
              </div>
              <div className="px-4 py-3.5 flex justify-center">
                {row.wa ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="px-4 py-3.5 flex justify-center bg-violet-50/40">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-violet-700 font-bold" />
                </div>
              </div>
            </div>
          ))}

          {/* Footer CTA */}
          <div className="px-4 sm:px-6 py-5 bg-gradient-to-r from-violet-50 to-purple-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-semibold text-gray-800 text-center sm:text-left">
              Todo esto en el plan gratis. Tu primer pedido pagado paga meses de Pro.
            </p>
            <Button
              onClick={() => navigate({ page: 'register' })}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shrink-0"
            >
              Empezar gratis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
