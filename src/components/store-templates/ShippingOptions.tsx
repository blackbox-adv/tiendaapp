'use client'

import { Truck } from 'lucide-react'
import type { Store } from '@/lib/types'

// Muestra las opciones de envío de la tienda (delivery, recojo, envío nacional, etc.).
// Se renderiza solo si la tienda configuró al menos una opción.
export function ShippingOptions({ store }: { store: Store }) {
  const options = Array.isArray(store.shippingOptions)
    ? store.shippingOptions.filter((o) => o && o.label)
    : []

  if (options.length === 0) return null

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || price === 0) return 'Gratis'
    return `S/ ${price.toFixed(2)}`
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
          Opciones de envío
        </h2>
      </div>
      <div
        className={`grid gap-3 ${options.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}
      >
        {options.map((o, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {o.label}
              </p>
              {o.time ? (
                <p className="text-xs text-gray-500 mt-0.5">⏱ {o.time}</p>
              ) : null}
            </div>
            <span
              className={`text-sm font-bold flex-shrink-0 ${
                !o.price ? 'text-green-600' : 'text-gray-900'
              }`}
            >
              {formatPrice(o.price)}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-3">
        Coordina la entrega con el vendedor al confirmar tu pedido
      </p>
    </section>
  )
}
