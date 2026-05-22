'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, MessageCircle } from 'lucide-react'
import type { Store, Product } from '@/lib/types'

const CATEGORIES = [
  { id: 'ropa', name: 'Ropa' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'electronica', name: 'Electronica' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'belleza', name: 'Belleza' },
  { id: 'deportes', name: 'Deportes' },
  { id: 'alimentos', name: 'Alimentos' },
  { id: 'juguetes', name: 'Juguetes' },
  { id: 'otros', name: 'Otros' },
]

interface Combo {
  categoryId: string
  categoryName: string
  products: Product[]
  totalPrice: number
  packPrice: number
  discount: number
}

interface CombosSectionProps {
  products: Product[]
  store: Store
  storeSlug: string
  primaryColor?: string
}

function getCombos(products: Product[]): Combo[] {
  // Group products by category
  const grouped: Record<string, Product[]> = {}
  for (const p of products) {
    if (!p.isActive) continue
    const cat = p.categoryId || 'otros'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(p)
  }

  const combos: Combo[] = []
  for (const [catId, catProducts] of Object.entries(grouped)) {
    // Only create combos for categories with 3+ products
    if (catProducts.length < 3) continue

    // Take the first 3 products (sorted by featured, then newest)
    const sorted = [...catProducts].sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    const comboProducts = sorted.slice(0, 3)
    const totalPrice = comboProducts.reduce((sum, p) => sum + Number(p.price), 0)
    const packPrice = Math.round(totalPrice * 0.95 * 100) / 100 // 5% discount
    const discount = totalPrice - packPrice

    const cat = CATEGORIES.find((c) => c.id === catId)
    combos.push({
      categoryId: catId,
      categoryName: cat?.name || catId,
      products: comboProducts,
      totalPrice,
      packPrice,
      discount,
    })
  }

  return combos
}

export function CombosSection({ products, store, storeSlug, primaryColor }: CombosSectionProps) {
  const [expandedCombo, setExpandedCombo] = useState<string | null>(null)
  const color = primaryColor || store.colors.primary

  const combos = getCombos(products)

  if (combos.length === 0) return null

  const openPackWhatsApp = async (combo: Combo) => {
    const productNames = combo.products.map((p) => `• ${p.name} (S/${Number(p.price).toFixed(2)})`).join('\n')
    const message = `Hola! Me interesa el Pack ${combo.categoryName}:\n\n${productNames}\n\nTotal original: S/${combo.totalPrice.toFixed(2)}\nPrecio pack: S/${combo.packPrice.toFixed(2)}\nAhorro: S/${combo.discount.toFixed(2)}\n\nTienen disponibilidad?`

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerMessage: message,
        }),
      })
      const data = await res.json()
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank')
        return
      }
    } catch {
      // Fallback
    }
    const msg = encodeURIComponent(message)
    window.open(`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-5 h-5" style={{ color }} />
        <h3 className="text-lg font-bold text-gray-900">Packs especiales</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {combos.map((combo) => (
          <motion.div
            key={combo.categoryId}
            layout
            className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Stacked product images */}
            <div className="relative h-36 bg-gray-50 overflow-hidden">
              {combo.products.map((p, i) => (
                <div
                  key={p.id}
                  className="absolute w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md"
                  style={{
                    left: i === 0 ? '12px' : i === 1 ? 'calc(50% - 40px)' : 'calc(100% - 92px)',
                    top: i === 1 ? '8px' : '28px',
                    zIndex: i === 1 ? 3 : i === 0 ? 2 : 1,
                    transform: i === 0 ? 'rotate(-6deg)' : i === 2 ? 'rotate(6deg)' : 'rotate(0deg)',
                  }}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23f5f5f5" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="%23ccc">IMG</text></svg>'
                    }}
                  />
                </div>
              ))}
              {/* Discount badge */}
              <div
                className="absolute top-2 right-2 px-2 py-1 rounded-lg text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: color }}
              >
                -5% pack
              </div>
            </div>

            {/* Combo info */}
            <div className="p-4">
              <h4 className="font-bold text-gray-900">
                Pack {combo.categoryName}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {combo.products.length} productos
              </p>

              {/* Product list (expandable) */}
              <button
                onClick={() => setExpandedCombo(expandedCombo === combo.categoryId ? null : combo.categoryId)}
                className="text-xs font-medium mt-2 hover:underline"
                style={{ color }}
              >
                {expandedCombo === combo.categoryId ? 'Ocultar productos' : 'Ver productos'}
              </button>

              {expandedCombo === combo.categoryId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-1"
                >
                  {combo.products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate flex-1">{p.name}</span>
                      <span className="text-gray-400 ml-2">S/{Number(p.price).toFixed(2)}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Price section */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold" style={{ color }}>
                    S/{combo.packPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    S/{combo.totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs mt-1 font-medium" style={{ color }}>
                  Ahorras S/{combo.discount.toFixed(2)}
                </p>
              </div>

              {/* WhatsApp CTA */}
              <button
                onClick={() => openPackWhatsApp(combo)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4" />
                Pedir Pack por WhatsApp
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
