'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
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
import { Star, ShoppingBag, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

export function ModernaTemplate({ store, products, storeSlug, planId }: { store: Store; products: Product[]; storeSlug: string; planId?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })
  const [sortBy, setSortBy] = useState<string>('newest')
  const navigate = useAppStore((s) => s.navigate)

  const filteredProducts = useMemo(() => {
    let result = selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }

    // Price range filter
    if (priceRange.min !== null) {
      result = result.filter((p) => p.price >= priceRange.min!)
    }
    if (priceRange.max !== null) {
      result = result.filter((p) => p.price <= priceRange.max!)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [products, selectedCategory, searchQuery, priceRange, sortBy])

  const storeCategories = [...new Set(products.map((p) => p.categoryId))]

  return (
    <div className="min-h-screen bg-white">
      {/* Header — ultra-minimal, centered */}
      <header className="pt-16 pb-12 text-center">
        <div className="max-w-xl mx-auto px-6">
          {store.logo && (
            <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl grayscale opacity-80">
              <StoreLogo logo={store.logo} size={56} />
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

      {/* Search bar + Category Pills */}
      <nav className="sticky top-[53px] z-30 bg-white/90 backdrop-blur-sm border-b border-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-4 space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
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

          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Price range */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>S/</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-200"
            >
              <option value="newest">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name">Nombre A-Z</option>
            </select>

            {/* Clear filters */}
            {(searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceRange({ min: null, max: null }); setSortBy('newest') }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Product Grid */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-300 text-sm">
              {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay productos en esta categoria'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-sm text-gray-400 mb-4">{filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para "{searchQuery}"</p>
            )}
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <span
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-semibold px-4 py-2 rounded-full"
                          style={{ backgroundColor: store.colors.primary + 'CC' }}
                        >
                          Ver detalle
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 px-0.5">
                      <h3 className="text-sm font-medium text-gray-800 truncate tracking-tight">
                        {product.name}
                      </h3>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={11}
                                className={star <= Math.round(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-400">{product.rating}</span>
                        </div>
                      )}
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
          </>
        )}
      </main>
      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        {planId === 'free' && (
          <a
            href="/"
            className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
          >
            Creado con TiendApp
          </a>
        )}
      </footer>
    </div>
  )
}
