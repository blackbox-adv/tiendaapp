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
import { Star, ShoppingBag, Search, X, ChevronRight, Lock } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

interface MinimalistTemplateProps {
  store: Store
  products: Product[]
  storeSlug: string
  planId?: string
  onProductClick?: (productId: string) => void
}

export function MinimalistTemplate({ store, products, storeSlug, planId, onProductClick }: MinimalistTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })
  const [sortBy, setSortBy] = useState<string>('newest')
  const navigate = useAppStore((s) => s.navigate)

  const accentColor = store.colors.primary

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

    if (priceRange.min !== null) {
      result = result.filter((p) => p.price >= priceRange.min!)
    }
    if (priceRange.max !== null) {
      result = result.filter((p) => p.price <= priceRange.max!)
    }

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

  const renderStars = (rating: number) => {
    if (rating <= 0) return null
    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={11}
            className={star <= Math.round(rating)
              ? 'fill-gray-400 text-gray-400'
              : 'text-gray-200'}
          />
        ))}
        <span className="text-[11px] text-gray-400 ml-0.5">{rating}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Banner */}
      {store.bannerUrl && (
        <div className="relative h-44 md:h-56 overflow-hidden">
          <img src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}
      {/* Store Header — Clean, left-aligned, lots of whitespace */}
      <header className={store.bannerUrl ? 'pt-8 pb-8' : 'pt-16 pb-10'}>
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {store.logo && (
              <div className="mb-4 flex justify-center"><StoreLogo logo={store.logo} size={64} /></div>
            )}
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
              {store.name}
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-md font-light leading-relaxed">
              {store.description}
            </p>
            <div className="mt-4">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="minimalist"
                primaryColor={store.colors.primary}
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        <div className="flex items-center gap-1.5 text-xs text-gray-300 py-3">
          <span className="text-gray-400">Inicio</span>
          <ChevronRight className="w-3 h-3 text-gray-200" />
          <span style={{ color: accentColor }}>{store.name}</span>
        </div>
      </div>

      {/* Search + Filters — Ultra clean */}
      <nav className="sticky top-[53px] z-30 bg-white border-b border-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-5 space-y-4">
          {/* Search — Pro & Premium only */}
          {planId !== 'free' ? (
            <div className="relative max-w-sm">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-8 py-2 text-sm text-gray-700 placeholder-gray-300 bg-transparent border-b border-gray-100 focus:outline-none focus:border-gray-300 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/#pricing'}
              className="flex items-center gap-2 py-2 text-sm text-gray-300 hover:text-gray-500 border-b border-gray-100 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Buscador disponible en Plan Pro
            </button>
          )}

          {/* Category pills — minimal style */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-1.5 rounded-full text-xs font-normal whitespace-nowrap transition-all duration-200"
              style={{
                backgroundColor: selectedCategory === 'all' ? accentColor : '#fafafa',
                color: selectedCategory === 'all' ? '#fff' : '#999',
                border: selectedCategory === 'all' ? 'none' : '1px solid #f0f0f0',
              }}
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
                  className="px-4 py-1.5 rounded-full text-xs font-normal whitespace-nowrap transition-all duration-200"
                  style={{
                    backgroundColor: selectedCategory === catId ? accentColor : '#fafafa',
                    color: selectedCategory === catId ? '#fff' : '#999',
                    border: selectedCategory === catId ? 'none' : '1px solid #f0f0f0',
                  }}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>

          {/* Filters row — very subtle */}
          {planId !== 'free' && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>S/</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                className="w-16 px-2 py-1 text-xs text-gray-600 bg-transparent border-b border-gray-100 focus:outline-none focus:border-gray-300 transition-colors"
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                className="w-16 px-2 py-1 text-xs text-gray-600 bg-transparent border-b border-gray-100 focus:outline-none focus:border-gray-300 transition-colors"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs text-gray-400 bg-transparent border-b border-gray-100 focus:outline-none focus:border-gray-300 py-1 transition-colors cursor-pointer"
            >
              <option value="newest">Recientes</option>
              <option value="price-asc">Precio ↑</option>
              <option value="price-desc">Precio ↓</option>
              <option value="name">A-Z</option>
            </select>
            {(searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceRange({ min: null, max: null }); setSortBy('newest') }}
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          )}
        </div>
      </nav>

      {/* Product Grid — 2 col mobile, 4 desktop, lots of whitespace */}
      <main className="flex-1 max-w-6xl mx-auto px-8 md:px-12 py-12 w-full">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-gray-100" />
            <p className="text-sm text-gray-300">
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-gray-300 hover:text-gray-500 transition-colors">
                Limpiar
              </button>
            )}
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-xs text-gray-300 mb-6">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => onProductClick ? onProductClick(product.id) : navigate({ page: 'product-detail', slug: storeSlug, productId: product.id })}
                  >
                    {/* Image — square, no border */}
                    <div className="aspect-square overflow-hidden relative bg-gray-50">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23fafafa" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="13" fill="%23ddd">No image</text></svg>'
                        }}
                      />
                      {product.originalPrice && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black text-white">
                          -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                        </div>
                      )}
                      {/* "Ver detalle" — simple text link on hover, not button */}
                      <div className="absolute bottom-3 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs font-medium text-white/80 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                          Ver detalle
                        </span>
                      </div>
                    </div>

                    {/* Info — minimal: just name + price */}
                    <div className="mt-3.5">
                      <h3 className="text-sm font-normal text-gray-700 truncate">
                        {product.name}
                      </h3>
                      {renderStars(product.rating)}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-semibold text-gray-900">
                          S/{Number(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-300 line-through">
                            S/{Number(product.originalPrice).toFixed(2)}
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

      {/* Footer — minimal */}
      <footer className="mt-auto border-t border-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-10">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-300">
              © {new Date().getFullYear()} {store.name}
            </p>
            {planId === 'free' && (
              <a
                href="/"
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
              >
                Creado con TiendApp
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
