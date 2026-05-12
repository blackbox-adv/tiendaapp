'use client'

import { Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Product, Store } from '@/lib/types'

interface ProductBadgesProps {
  product: Product
  primaryColor?: string
  store?: Store
}

export function ProductBadges({ product, primaryColor = '#7C3AED', store }: ProductBadgesProps) {
  const isNew = () => {
    const created = new Date(product.createdAt)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  // Store feature badges (shown when store prop is provided)
  const storeFeatures: { icon: typeof Truck; label: string; active: boolean }[] = store
    ? [
        { icon: Truck, label: 'Envio', active: !!store.hasShipping },
        { icon: ShieldCheck, label: 'Pago seguro', active: !!store.hasSecurePayment },
        { icon: RotateCcw, label: 'Devoluciones', active: !!store.hasReturns },
      ]
    : []

  const activeStoreFeatures = storeFeatures.filter((f) => f.active)

  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
      {product.featured && (
        <Badge
          className="text-white text-[10px] font-bold border-0 rounded-md px-2 py-0.5 shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          Destacado
        </Badge>
      )}
      {isNew() && (
        <Badge className="bg-green-500 text-white text-[10px] font-bold border-0 rounded-md px-2 py-0.5 shadow-md">
          Nuevo
        </Badge>
      )}
      {product.originalPrice && Number(product.price) < Number(product.originalPrice) && (
        <Badge className="bg-red-500 text-white text-[10px] font-bold border-0 rounded-md px-2 py-0.5 shadow-md">
          -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
        </Badge>
      )}
      {activeStoreFeatures.map((f) => (
        <Badge
          key={f.label}
          className="bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] font-semibold border-0 rounded-md px-1.5 py-0.5 shadow-sm flex items-center gap-1"
        >
          <f.icon className="w-2.5 h-2.5" style={{ color: primaryColor }} />
          {f.label}
        </Badge>
      ))}
    </div>
  )
}
