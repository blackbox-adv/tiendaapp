'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Star, ShoppingBag, Search, X, ImageIcon, Sparkles } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import { ProductColor } from './ProductColor'
import type { Store, Product } from '@/lib/types'

export function ModernaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const categories = getStoreCategories(products)
  const activeCatName = selectedCategory === 'all' ? null : (categories.find((c) => c.id === selectedCategory)?.name ?? null)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Banner with overlaid name — or standalone header */}
      {store.bannerUrl ? (
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img loading="lazy" decoding="async" src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            {store.logo && (
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/15 backdrop-blur-md ring-1 ring-white/40 shadow-lg">
                <StoreLogo logo={store.logo} size={60} />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
              {store.name}
            </h1>
            <p className="text-sm md:text-base text-white/80 mt-2.5 leading-relaxed max-w-md mx-auto">
              {store.description}
            </p>
            <div className="mt-4">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="vibrant"
                primaryColor={store.colors.primary}
              />
            </div>
          </div>
        </div>
      ) : (
        <header className="relative overflow-hidden">
          {/* Decoración suave de fondo — da vida sin necesidad de banner */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/90 via-white to-white" />
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full bg-violet-100/70 blur-3xl pointer-events-none" />
          <div className="absolute -top-10 right-[8%] w-40 h-40 rounded-full bg-purple-100/60 blur-2xl pointer-events-none" />
          <div className="relative max-w-xl mx-auto px-6 pt-14 pb-11 text-center">
            {store.logo && (
              <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center ring-4 ring-white shadow-lg shadow-violet-100">
                <StoreLogo logo={store.logo} size={64} />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {store.name}
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-2.5 leading-relaxed max-w-sm mx-auto">
              {store.description}
            </p>
            <div className="mt-5">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="light"
                primaryColor={store.colors.primary}
              />
            </div>
          </div>
        </header>
      )}

      {/* Search bar + Category Pills */}
      <nav className="sticky top-[53px] z-30 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 space-y-3">
          {/* Search input — Pro & Premium only */}
          {planId !== 'free' ? (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-200 bg-white transition-all"
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
          ) : null}

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
              style={
                selectedCategory === 'all'
                  ? { backgroundColor: store.colors.primary }
                  : undefined
              }
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-sm'
                    : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
                style={
                  selectedCategory === cat.id
                    ? { backgroundColor: store.colors.primary }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Filters row — Pro & Premium only */}
          {planId !== 'free' && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Price range */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>S/</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min ?? ''}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                  className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-violet-100"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max ?? ''}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                  className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-violet-100"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-100"
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
          )}
        </div>
      </nav>

      {/* Product Grid */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Combos/Packs */}
        <div className="mb-8">
          <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={store.colors.primary} />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-gray-50 mx-auto mb-5 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-gray-200" />
            </div>
            <p className="text-gray-400 text-sm font-medium">
              {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'No hay productos en esta categoría'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-violet-500 hover:text-violet-700 underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Encabezado de sección — jerarquía editorial */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-500 mb-0.5">
                  {activeCatName ? 'Categoría' : 'Catálogo'}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                  {activeCatName || 'Nuestros productos'}
                </h2>
              </div>
              <span className="text-xs text-gray-400 mb-1">{filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 md:gap-x-7">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                    className="group cursor-pointer"
                    onClick={() => onProductClick ? onProductClick(product.id) : navigate({ page: 'product-detail', slug: storeSlug, productId: product.id })}
                  >
                    <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative shadow-sm group-hover:shadow-xl group-hover:shadow-gray-200/60 group-hover:-translate-y-1 transition-all duration-300">
                      <img loading="lazy" decoding="async"
                        src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23fafafa" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ccc">Imagen no disponible</text></svg>'
                        }}
                      />
                      <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                      {/* Descuento o Destacado */}
                      {product.originalPrice ? (
                        <div
                          className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg text-white text-[10px] font-bold tracking-wide shadow-sm"
                          style={{ backgroundColor: store.colors.primary }}
                        >
                          -
                          {Math.round(
                            ((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100
                          )}
                          %
                        </div>
                      ) : product.featured ? (
                        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-wide text-amber-600 shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Destacado
                        </div>
                      ) : null}
                      {((product.images?.length || 0) + (product.imageUrl ? 1 : 0)) > 1 && (
                        <div className="absolute top-2.5 right-2.5 px-1.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {(product.images?.length || 0) + 1}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <span
                          className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
                          style={{ backgroundColor: store.colors.primary + 'E6' }}
                        >
                          Ver detalle
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 px-0.5">
                      <h3 className="text-sm font-semibold text-gray-800 truncate tracking-tight">
                        {product.name}
                      </h3>
                      {product.color && (
                        <ProductColor color={product.color} size={12} labelClassName="text-[11px] text-gray-400 font-medium" />
                      )}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={11}
                                className={star <= Math.round(product.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-400">{product.rating}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-[15px] font-bold tracking-tight"
                          style={{ color: store.colors.primary }}
                        >
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
      {/* Formas de pago (Yape / Plin) */}
      <ShippingOptions store={store} />
      <PaymentMethods store={store} />

      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        {planId === 'free' && (
          <a
            href="/"
            className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
          >
            Creado con Kyllari
          </a>
        )}
      </footer>
    </div>
  )
}
