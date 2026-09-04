'use client'

import { motion } from 'framer-motion'
import { Check, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

const ROWS = [
  { label: 'Catálogo con fotos, precios y stock', wa: false, ta: true },
  { label: 'Pedido armado automáticamente en el mensaje', wa: false, ta: true },
  { label: 'Tus métodos de pago visibles (Yape, Plin, Mercado Pago y más)', wa: false, ta: true },
  { label: 'Packs con descuento y ofertas resaltadas', wa: false, ta: true },
  { label: 'Clientes de todo tu país te encuentran con un link', wa: false, ta: true },
  { label: 'Sabes cuántos productos tienes y tus ofertas al día', wa: false, ta: true },
  { label: 'Sigues cobrando y atendiendo por WhatsApp', wa: true, ta: true },
]

export function Comparison() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <section id="comparativa" className="py-20 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-[#BC5A38] uppercase tracking-wider">
            La diferencia
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-4">
            ¿No es lo mismo que usar WhatsApp Business solo?
          </h2>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            WhatsApp Business es tu canal de atención. TiendApp es tu tienda que lo
            alimenta con pedidos ordenados. Se complementan — mira la diferencia:
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="bg-white rounded-3xl shadow-xl border border-[#E5DCCB] overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_180px_180px] border-b border-[#E5DCCB] bg-[#FAF6EF]">
            <div className="px-4 sm:px-6 py-4 text-sm font-semibold text-stone-400 uppercase tracking-wide">
              Función
            </div>
            <div className="px-4 py-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 flex items-center justify-center mb-1">
                <span className="text-emerald-600 font-bold text-lg">W</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-600">WhatsApp solo</p>
            </div>
            <div className="px-4 py-4 text-center bg-[#F6E7DE]/70">
              <div className="w-10 h-10 mx-auto rounded-xl bg-stone-900 flex items-center justify-center mb-1">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#BC5A38]">Con TiendApp</p>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_180px_180px] items-center ${
                i < ROWS.length - 1 ? 'border-b border-[#F0E9DC]' : ''
              }`}
            >
              <div className="px-4 sm:px-6 py-3.5 text-sm text-stone-700 font-medium">
                {row.label}
              </div>
              <div className="px-4 py-3.5 flex justify-center">
                {row.wa ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#FAF6EF] flex items-center justify-center">
                    <X className="w-4 h-4 text-stone-300" />
                  </div>
                )}
              </div>
              <div className="px-4 py-3.5 flex justify-center bg-[#F6E7DE]/50">
                <div className="w-7 h-7 rounded-full bg-[#BC5A38] flex items-center justify-center">
                  <Check className="w-4 h-4 text-white font-bold" />
                </div>
              </div>
            </div>
          ))}

          {/* Footer CTA */}
          <div className="px-4 sm:px-6 py-5 bg-[#FAF6EF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-semibold text-stone-800 text-center sm:text-left">
              Todo esto en el plan gratis. Tu primer pedido pagado paga meses de Pro.
            </p>
            <Button
              onClick={() => navigate({ page: 'register' })}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-full shadow-lg shrink-0"
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
