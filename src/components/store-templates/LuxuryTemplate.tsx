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
import { Star, ShoppingBag, Search, X, Diamond, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

const GOLD = '#c8a456'
const GOLD_LIGHT = '#f0d078'
const DARK_BG = '#0f0f1a'
const DARK_CARD = '#1a1a2e'
const DARK_SURFACE = '#16213e'

interface LuxuryTemplateProps {
  store: Store
  products: Product[]
  storeSlug: string
  planId?: string
}

export function LuxuryTemplate({ store, products, storeSlug, planId }: LuxuryTemplateProps) {
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
      <div className="flex items-center gap-1 mt-1.5">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-600'}
            />
          ))}
        </div>
        <span className="text-[11px] text-amber-300/70 ml-0.5">{rating}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: DARK_BG }}>
      {/* Elegant Header — centered, gold accents */}
      <header className="relative pt-14 pb-10 text-center">
        {/* Subtle gold gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {store.logo && (
              <div
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
                style={{
                  border: `2px solid ${GOLD}40`,
                  boxShadow: `0 0 30px ${GOLD}15`,
                }}
              >
                <StoreLogo logo={store.logo} size={56} />
              </div>
            )}
            <h1
              className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase"
              style={{
                fontFamily: 'Georgia, "Times New Roman", "Playfair Display", serif',
                color: '#f5f0e8',
              }}
            >
              {store.name}
            </h1>
            {/* Gold gradient divider */}
            <div className="flex items-center justify-center mt-5 mb-4 gap-3">
              <div className="h-px w-12" style={{ backgroundColor: GOLD + '40' }} />
              <Diamond size={14} style={{ color: GOLD }} />
              <div className="h-px w-12" style={{ backgroundColor: GOLD + '40' }} />
            </div>
            <p
              className="text-sm leading-relaxed max-w-md mx-auto"
              style={{ color: '#8a8a9a', fontFamily: 'Georgia, serif' }}
            >
              {store.description}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Search + Filters — Dark elegant bar */}
      <nav
        className="sticky top-[53px] z-30"
        style={{
          backgroundColor: DARK_SURFACE + 'E0',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${GOLD}15`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6a6a7a' }} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all"
              style={{
                backgroundColor: DARK_BG,
                border: `1px solid ${GOLD}20`,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#2a2a3e' }}
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>

          {/* Category scroll — horizontal with gold underline active state */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className="relative px-4 py-2 text-xs font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300"
              style={{ color: selectedCategory === 'all' ? GOLD : '#6a6a7a' }}
            >
              Todos
              {selectedCategory === 'all' && (
                <motion.div
                  layoutId="luxury-cat-underline"
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
            {storeCategories.map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId)
              if (!cat) return null
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className="relative px-4 py-2 text-xs font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300"
                  style={{ color: selectedCategory === catId ? GOLD : '#6a6a7a' }}
                >
                  {cat.name}
                  {selectedCategory === catId && (
                    <motion.div
                      layoutId="luxury-cat-underline"
                      className="absolute bottom-0 left-0 right-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a7a' }}>
              <span>S/</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1"
                style={{ backgroundColor: DARK_BG, border: `1px solid ${GOLD}20` }}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1"
                style={{ backgroundColor: DARK_BG, border: `1px solid ${GOLD}20` }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded text-xs text-gray-300 focus:outline-none"
              style={{ backgroundColor: DARK_BG, border: `1px solid ${GOLD}20` }}
            >
              <option value="newest">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name">Nombre A-Z</option>
            </select>
            {(searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceRange({ min: null, max: null }); setSortBy('newest') }}
                className="text-xs hover:underline"
                style={{ color: GOLD + '90' }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Products Grid — 2 col mobile, 3 desktop, bigger cards */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: '#2a2a3e' }} />
            <p className="text-sm" style={{ color: '#4a4a5a' }}>
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos en esta categoría'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs hover:underline" style={{ color: GOLD + '90' }}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-sm mb-4" style={{ color: '#6a6a7a' }}>
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para &ldquo;{searchQuery}&rdquo;
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="group cursor-pointer"
                    onClick={() => navigate({ page: 'product-detail', slug: storeSlug, productId: product.id })}
                  >
                    {/* Card with thin gold border */}
                    <div
                      className="rounded-lg overflow-hidden relative transition-all duration-500"
                      style={{
                        backgroundColor: DARK_CARD,
                        border: `1px solid ${GOLD}18`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }}
                    >
                      {/* Hero-style product image */}
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533"><rect fill="%231a1a2e" width="400" height="533"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="14" fill="%234a4a5a">Imagen no disponible</text></svg>'
                          }}
                        />
                        {product.originalPrice && (
                          <div
                            className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-semibold tracking-widest uppercase"
                            style={{ backgroundColor: GOLD, color: DARK_BG }}
                          >
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}
                        {product.featured && (
                          <div
                            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase"
                            style={{ backgroundColor: DARK_BG + 'CC', color: GOLD }}
                          >
                            <Crown size={10} />
                            Destacado
                          </div>
                        )}
                        {/* Hover overlay — "Ver detalle" gold button */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                          <motion.span
                            initial={{ y: 10, opacity: 0 }}
                            whileHover={{ y: 0, opacity: 1 }}
                            className="text-xs font-semibold tracking-[0.15em] uppercase px-6 py-2.5 rounded-sm"
                            style={{
                              backgroundColor: GOLD,
                              color: DARK_BG,
                              boxShadow: `0 4px 15px ${GOLD}40`,
                            }}
                          >
                            Ver detalle
                          </motion.span>
                        </div>
                      </div>

                      {/* Card info */}
                      <div className="p-4">
                        <h3
                          className="text-sm font-medium truncate"
                          style={{
                            fontFamily: 'Georgia, serif',
                            color: '#e0dcd0',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {product.name}
                        </h3>
                        {renderStars(product.rating)}
                        <div className="flex items-center gap-2.5 mt-2">
                          <span
                            className="text-base font-semibold"
                            style={{ color: GOLD }}
                          >
                            S/{product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs line-through" style={{ color: '#4a4a5a' }}>
                              S/{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
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
      <footer className="mt-auto" style={{ borderTop: `1px solid ${GOLD}12` }}>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8" style={{ backgroundColor: GOLD + '30' }} />
            <Diamond size={10} style={{ color: GOLD + '60' }} />
            <div className="h-px w-8" style={{ backgroundColor: GOLD + '30' }} />
          </div>
          <p
            className="text-xs"
            style={{ fontFamily: 'Georgia, serif', color: '#4a4a5a' }}
          >
            {store.name} — Todos los derechos reservados
          </p>
          {planId === 'free' && (
            <p className="mt-3">
              <a
                href="/"
                className="text-[11px] transition-colors hover:underline"
                style={{ color: GOLD + '50' }}
              >
                Creado con TiendApp
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
