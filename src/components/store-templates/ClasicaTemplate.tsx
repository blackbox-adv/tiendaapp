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
import { Star, MessageCircle, ShoppingBag, Heart, Search, X } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

export function ClasicaTemplate({ store, products, storeSlug, planId }: { store: Store; products: Product[]; storeSlug: string; planId?: string }) {
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Banner */}
      {store.bannerUrl && (
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />
        </div>
      )}
      {/* Header — Elegant serif, warm tones */}
      <header
        className="border-b"
        style={{
          backgroundColor: '#FFF5E6',
          borderBottomColor: '#E8D5B7',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-10 text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-2"
            style={{
              backgroundColor: '#FFFBF0',
              borderColor: store.colors.primary + '40',
            }}
          >
            <StoreLogo logo={store.logo} size={56} />
          </div>
          <h1
            className="text-3xl font-bold tracking-wide"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#5D3A1A' }}
          >
            {store.name}
          </h1>
          <div
            className="w-16 h-0.5 mx-auto mt-4 mb-3"
            style={{ backgroundColor: store.colors.primary + '50' }}
          />
          <p
            className="max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#8B6F5C' }}
          >
            {store.description}
          </p>
          <div className="mt-4">
            <StoreFeatureBadges
              hasShipping={store.hasShipping}
              hasSecurePayment={store.hasSecurePayment}
              hasReturns={store.hasReturns}
              variant="classic"
              primaryColor={store.colors.primary}
            />
          </div>
        </div>
      </header>

      {/* Category Buttons — Rectangular with border, not pills */}
      <nav
        className="sticky top-[53px] z-30 border-b"
        style={{
          backgroundColor: '#FFFAF2',
          borderBottomColor: '#EDE0CC',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-3 space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A88B6E' }} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border-2 focus:outline-none transition-all"
              style={{ backgroundColor: '#FFFBF0', borderColor: '#E8D5B7', color: '#3E2A17' }}
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
          {/* Category buttons */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2 text-sm font-medium whitespace-nowrap transition-all border-2 ${
              selectedCategory === 'all'
                ? 'text-white'
                : 'bg-white hover:bg-amber-50'
            }`}
            style={
              selectedCategory === 'all'
                ? { backgroundColor: store.colors.primary, borderColor: store.colors.primary }
                : { borderColor: '#D4B896', color: '#6B4F3A' }
            }
          >
            Todos ({products.length})
          </button>
          {storeCategories.map((catId) => {
            const cat = CATEGORIES.find((c) => c.id === catId)
            if (!cat) return null
            const count = products.filter((p) => p.categoryId === catId).length
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-5 py-2 text-sm font-medium whitespace-nowrap transition-all border-2 ${
                  selectedCategory === catId
                    ? 'text-white'
                    : 'bg-white hover:bg-amber-50'
                }`}
                style={
                  selectedCategory === catId
                    ? { backgroundColor: store.colors.primary, borderColor: store.colors.primary }
                    : { borderColor: '#D4B896', color: '#6B4F3A' }
                }
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>

          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Price range */}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#A88B6E' }}>
              <span>S/</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded-lg border-2 text-xs focus:outline-none"
                style={{ borderColor: '#E8D5B7', backgroundColor: '#FFFBF0', color: '#3E2A17' }}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max ?? ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                className="w-20 px-2 py-1.5 rounded-lg border-2 text-xs focus:outline-none"
                style={{ borderColor: '#E8D5B7', backgroundColor: '#FFFBF0', color: '#3E2A17' }}
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border-2 text-xs focus:outline-none"
              style={{ borderColor: '#E8D5B7', backgroundColor: '#FFFBF0', color: '#6B4F3A' }}
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
                className="text-xs underline"
                style={{ color: '#A88B6E' }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Product List — Horizontal layout (image left, text right) */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-14 h-14 mx-auto mb-4" style={{ color: '#D4B896' }} />
            <p style={{ fontFamily: 'Georgia, serif', color: '#A88B6E' }}>
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos en esta categoria'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs underline"
                style={{ color: '#A88B6E' }}
              >
                Limpiar busqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="group flex flex-col sm:flex-row gap-0 bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                  style={{ borderColor: '#EDE0CC' }}
                  onClick={() => navigate({ page: 'product-detail', slug: storeSlug, productId: product.id })}
                >
                  {/* Image — left side on desktop, top on mobile */}
                  <div
                    className="w-full sm:w-44 lg:w-52 flex-shrink-0 overflow-hidden relative"
                    style={{ backgroundColor: '#FFF8ED' }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="%23FFF5E6" width="300" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48">🏷️</text></svg>'
                      }}
                    />
                    {/* Hover "Ver detalle" overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm">
                        Ver detalle
                      </span>
                    </div>
                  </div>

                  {/* Text — right side */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3
                            className="text-lg font-bold leading-snug"
                            style={{ fontFamily: 'Georgia, serif', color: '#3E2A17' }}
                          >
                            {product.name}
                          </h3>
                          {product.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={star <= Math.round(product.rating)
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <span className="text-xs" style={{ color: '#A88B6E' }}>{product.rating}</span>
                            </div>
                          )}
                        </div>
                        {product.originalPrice && (
                          <Badge
                            className="text-xs font-semibold border-0 flex-shrink-0 rounded-md"
                            style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                          >
                            -
                            {Math.round(
                              ((Number(product.originalPrice) - Number(product.price)) / product.originalPrice) *
                                100
                            )}
                            %
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-2 line-clamp-2 leading-relaxed" style={{ color: '#8B7355' }}>
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: '#F0E6D6' }}>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-xl font-bold"
                          style={{ fontFamily: 'Georgia, serif', color: store.colors.primary }}
                        >
                          S/{Number(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm line-through" style={{ color: '#C4A882' }}>
                            S/{Number(product.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {/* Small WhatsApp button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          openWhatsApp(product)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm transition-colors"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
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
      <footer
        className="border-t py-8 mt-8"
        style={{ backgroundColor: '#FFF5E6', borderTopColor: '#E8D5B7' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p style={{ fontFamily: 'Georgia, serif', color: '#A88B6E' }} className="text-sm">
            {store.name}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Heart className="w-3.5 h-3.5" style={{ color: store.colors.primary }} />
            <p
              style={{ fontFamily: 'Georgia, serif', color: '#A88B6E' }}
              className="text-xs"
            >
              {planId === 'free' && (
                <a
                  href="/"
                  className="hover:underline transition-colors"
                  style={{ color: '#A88B6E' }}
                >
                  Creado con TiendApp
                </a>
              )}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
