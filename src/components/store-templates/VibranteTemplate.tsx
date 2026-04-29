'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from '@/lib/mock-data'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

export function VibranteTemplate({ store, products, storeSlug }: { store: Store; products: Product[]; storeSlug: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const navigate = useAppStore((s) => s.navigate)

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.categoryId === selectedCategory)

  const storeCategories = [...new Set(products.map((p) => p.categoryId))]
  const primaryRgb = hexToRgb(store.colors.primary)
  const secondaryRgb = hexToRgb(store.colors.secondary)

  const openWhatsApp = async (product: Product) => {
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          productName: product.name,
          productPrice: product.price,
        }),
      })
      const data = await res.json()
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank')
        return
      }
    } catch {
      // Fallback to direct link
    }
    const msg = encodeURIComponent(`Hola, me interesa: ${product.name}`)
    window.open(
      `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`,
      '_blank'
    )
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.04)`,
      }}
    >
      {/* BIG Banner Header with gradient using store colors */}
      <header
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${store.colors.primary}, ${store.colors.secondary})`,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/10 blur-xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-5 flex items-center justify-center text-5xl shadow-lg ring-4 ring-white/30"
          >
            {store.logo}
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            {store.name}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-white/80 mt-3 max-w-lg mx-auto text-lg"
          >
            {store.description}
          </motion.p>
        </div>
      </header>

      {/* Category Chips — colorful with secondary bg */}
      <nav
        className="sticky top-[53px] z-30 backdrop-blur-lg"
        style={{
          backgroundColor: `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.12)`,
          borderBottom: `1px solid rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className="px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-all duration-200"
            style={
              selectedCategory === 'all'
                ? {
                    backgroundColor: store.colors.primary,
                    color: '#fff',
                    boxShadow: `0 4px 14px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`,
                  }
                : {
                    backgroundColor: '#fff',
                    color: '#666',
                  }
            }
          >
            Todos
          </motion.button>
          {storeCategories.map((catId) => {
            const cat = CATEGORIES.find((c) => c.id === catId)
            if (!cat) return null
            return (
              <motion.button
                key={catId}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(catId)}
                className="px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-all duration-200"
                style={
                  selectedCategory === catId
                    ? {
                        backgroundColor: store.colors.primary,
                        color: '#fff',
                        boxShadow: `0 4px 14px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`,
                      }
                    : {
                        backgroundColor: '#fff',
                        color: '#666',
                      }
                }
              >
                {cat.name}
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Products — Large tall cards, bouncy */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 font-semibold">No hay productos aqui</p>
            <p className="text-gray-300 text-sm mt-1">Prueba otra categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: i * 0.06,
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group cursor-pointer rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-shadow duration-300"
                  onClick={() => navigate({ page: 'product-detail', slug: storeSlug, productId: product.id })}
                >
                  {/* Tall image (Instagram-like) */}
                  <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect fill="%23f0f0f0" width="400" height="500"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48">📸</text></svg>'
                      }}
                    />
                    {product.originalPrice && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold rounded-lg px-2.5 py-1 shadow-lg border-0">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                    {/* Hover overlay with "Ver detalle" */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-bold px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                        Ver detalle
                      </span>
                    </div>
                  </div>

                  {/* Card body with description */}
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-xl font-black"
                          style={{ color: store.colors.primary }}
                        >
                          S/{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-300 line-through">
                            S/{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {/* WhatsApp button */}
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          openWhatsApp(product)
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-xs font-bold shadow-lg transition-transform"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Pedir
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Floating WhatsApp Button — always visible */}
      <motion.button
        onClick={async () => {
          try {
            const res = await fetch('/api/whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ storeId: store.id }),
            })
            const data = await res.json()
            if (data.whatsappUrl) {
              window.open(data.whatsappUrl, '_blank')
              return
            }
          } catch {
            // Fallback to direct link
          }
          window.open(`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, quiero mas informacion sobre sus productos')}`, '_blank')
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl"
        style={{ backgroundColor: '#25D366' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        }}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Chatea con nosotros</span>
      </motion.button>
    </div>
  )
}
