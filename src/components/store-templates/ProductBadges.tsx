'use client'

import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

interface ProductBadgesProps {
  product: Product
  primaryColor?: string
}

export function ProductBadges({ product, primaryColor = '#7C3AED' }: ProductBadgesProps) {
  const isNew = () => {
    const created = new Date(product.createdAt)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

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
      {product.originalPrice && product.price < product.originalPrice && (
        <Badge className="bg-red-500 text-white text-[10px] font-bold border-0 rounded-md px-2 py-0.5 shadow-md">
          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
        </Badge>
      )}
    </div>
  )
}
