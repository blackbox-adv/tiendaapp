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
import { Star, MessageCircle, ShoppingBag, Search, X, SlidersHorizontal, Lock } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

export function VibranteTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundColor: `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.04)`,
      }}
    >
      {/* BIG Banner Header with gradient using store colors */}
      <header
        className="relative overflow-hidden"
        style={store.bannerUrl ? {
          backgroundImage: `url(${store.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {
          background: `linear-gradient(135deg, ${store.colors.primary}, ${store.colors.secondary})`,
        }}
      >
        {/* Dark overlay when banner is present */}
        {store.bannerUrl && <div className="absolute inset-0 bg-black/40" />}
        {/* Decorative circles */}
        {!store.bannerUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/10 blur-xl" />
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-5 flex items-center justify-center text-5xl shadow-lg ring-4 ring-white/30"
          >
            <StoreLogo logo={store.logo} size={56} />
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
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="mt-5"
          >
            <StoreFeatureBadges
              hasShipping={store.hasShipping}
              hasSecurePayment={store.hasSecurePayment}
              hasReturns={store.hasReturns}
              variant="vibrant"
              primaryColor={store.colors.primary}
            />
          </motion.div>
        </div>
      </header>

      {/* Search bar + Category Chips */}
      <nav
        className="sticky top-[53px] z-30 backdrop-blur-lg"
        style={{
          backgroundColor: `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.12)`,
          borderBottom: `1px solid rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
          {/* Search input — Pro & Premium only */}
          {planId !== 'free' ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border-0 bg-white/80 focus:outline-none focus:ring-2 focus:ring-white shadow-sm transition-all"
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
          ) : (
            <button
              onClick={() => window.location.href = '/#pricing'}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl border-0 bg-white/60 text-gray-400 hover:text-violet-500 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Buscador disponible en Plan Pro
            </button>
          )}

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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

          {/* Filters row — Pro & Premium only */}
          {planId !== 'free' && (
          <div className="flex items-center gap-3 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            {/* Price range */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
              <span>S/</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded-xl border border-gray-200 bg-white/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded-xl border border-gray-200 bg-white/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white/80 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
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
                className="text-xs text-gray-400 hover:text-gray-600 font-bold underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          )}
        </div>
      </nav>

      {/* Products — Large tall cards, bouncy */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 font-semibold">
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos aqui'}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {searchQuery ? 'Intenta con otra busqueda' : 'Prueba otra categoria'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar busqueda
              </button>
            )}
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
                  onClick={() => onProductClick ? onProductClick(product.id) : navigate({ page: 'product-detail', slug: storeSlug, productId: product.id })}
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
                        -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
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
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={star <= Math.round(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{product.rating}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-xl font-black"
                          style={{ color: store.colors.primary }}
                        >
                          S/{Number(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-300 line-through">
                            S/{Number(product.originalPrice).toFixed(2)}
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

      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        {planId === 'free' && (
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Creado con TiendApp
          </a>
        )}
      </footer>
    </div>
  )
}
