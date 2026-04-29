'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from '@/lib/mock-data'
import { ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

export function ModernaTemplate({ store, products, storeSlug }: { store: Store; products: Product[]; storeSlug: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const navigate = useAppStore((s) => s.navigate)

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.categoryId === selectedCategory)

  const storeCategories = [...new Set(products.map((p) => p.categoryId))]

  return (
    <div className="min-h-screen bg-white">
      {/* Header — ultra-minimal, centered */}
      <header className="pt-16 pb-12 text-center">
        <div className="max-w-xl mx-auto px-6">
          {store.logo && (
            <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl grayscale opacity-80">
              {store.logo}
            </div>
          )}
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {store.name}
          </h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">
            {store.description}
          </p>
        </div>
      </header>

      {/* Category Pills — small, understated */}
      <nav className="sticky top-[53px] z-30 bg-white/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            style={
              selectedCategory === 'all'
                ? { backgroundColor: store.colors.primary }
                : { backgroundColor: '#f5f5f5' }
            }
          >
            Todos
          </button>
          {storeCategories.map((catId) => {
            const cat = CATEGORIES.find((c) => c.id === catId)
            if (!cat) return null
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === catId
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={
                  selectedCategory === catId
                    ? { backgroundColor: store.colors.primary }
                    : { backgroundColor: '#f5f5f5' }
                }
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Product Grid — 2/3/4 cols, square images */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-300 text-sm">No hay productos en esta categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="group cursor-pointer"
                  onClick={() => navigate({ page: 'product-detail', slug: storeSlug, productId: product.id })}
                >
                  {/* Square image with very subtle border */}
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23fafafa" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ccc">Imagen no disponible</text></svg>'
                      }}
                    />
                    {product.originalPrice && (
                      <div
                        className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-white text-[10px] font-semibold tracking-wide uppercase"
                        style={{ backgroundColor: store.colors.primary }}
                      >
                        -
                        {Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100
                        )}
                        %
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <span
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-semibold px-4 py-2 rounded-full"
                        style={{ backgroundColor: store.colors.primary + 'CC' }}
                      >
                        Ver detalle
                      </span>
                    </div>
                  </div>

                  {/* Name + Price only */}
                  <div className="mt-3 px-0.5">
                    <h3 className="text-sm font-medium text-gray-800 truncate tracking-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: store.colors.primary }}
                      >
                        S/{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-300 line-through">
                          S/{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
