'use client'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Star, ShoppingBag, Search, X, ImageIcon, Zap } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// NEÓN — Plantilla premium tech oscura.
// Fondo slate profundo, acentos eléctricos (cian + violeta),
// cards con glow. Ideal para celulares, electrónica y gaming.
// ============================================================

export function NeonTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const navigate = useAppStore((s) => s.navigate)

  const categories = useMemo(() => getStoreCategories(products), [products])

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
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'newest':
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    return result
  }, [products, selectedCategory, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ── Header tech con glows ── */}
      {store.bannerUrl ? (
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            {store.logo && (
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-900/70 backdrop-blur ring-2 ring-cyan-400/50 shadow-[0_0_35px_rgba(34,211,238,0.35)]">
                <StoreLogo logo={store.logo} size={56} />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
              {store.name}
            </h1>
            <p className="text-sm text-slate-300 mt-2.5 max-w-md mx-auto">{store.description}</p>
            <div className="mt-4">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="dark"
                primaryColor={store.colors.primary}
              />
            </div>
          </div>
        </div>
      ) : (
        <header className="relative overflow-hidden text-center px-6 pt-16 pb-12">
          <div className="absolute -top-24 left-[12%] w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-16 right-[8%] w-64 h-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
          <div className="relative max-w-xl mx-auto">
            {store.logo && (
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-slate-900 ring-2 ring-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                <StoreLogo logo={store.logo} size={56} />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
              {store.name}
            </h1>
            <p className="text-sm text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">{store.description}</p>
            <div className="mt-5">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="dark"
                primaryColor={store.colors.primary}
              />
            </div>
          </div>
        </header>
      )}

      {/* ── Nav sticky glass ── */}
      <nav className="sticky top-[53px] z-30 bg-slate-950/85 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 space-y-3">
          {planId !== 'free' && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar tecnología..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {['all', ...categories.map((c) => c.id)].map((catId) => {
              const label = catId === 'all' ? 'Todo' : (categories.find((c) => c.id === catId)?.name ?? catId)
              const active = selectedCategory === catId
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.35)]'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:border-white/25'
                  }`}
                >
                  {label}
                </button>
              )
            })}
            {planId !== 'free' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-auto shrink-0 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60"
              >
                <option value="newest">Más recientes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Combos/Packs */}
        <div className="mb-8">
          <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={store.colors.primary} />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto mb-5 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos en esta categoría'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400 mb-0.5 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  {selectedCategory === 'all' ? 'Catálogo' : 'Categoría'}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {selectedCategory === 'all' ? 'Nuestros productos' : (categories.find((c) => c.id === selectedCategory)?.name ?? '')}
                </h2>
              </div>
              <span className="text-xs text-slate-500 mb-1">{filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7 md:gap-x-5">
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
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.18)] transition-all duration-300">
                      <img
                        src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                        }}
                      />
                      {product.originalPrice ? (
                        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 text-[10px] font-extrabold shadow-md">
                          -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                        </div>
                      ) : product.featured ? (
                        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-300" />
                          TOP
                        </div>
                      ) : null}
                      {((product.images?.length || 0) + (product.imageUrl ? 1 : 0)) > 1 && (
                        <div className="absolute top-2.5 right-2.5 px-1.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-sm border border-white/10 text-slate-200 text-[10px] font-medium flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {(product.images?.length || 0) + 1}
                        </div>
                      )}
                      <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="block text-center py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                          Ver detalle
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 px-0.5">
                      <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                      {product.color && (
                        <span className="text-[11px] text-slate-500 font-medium">{product.color}</span>
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
                                  : 'text-slate-700'}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-500">{product.rating}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[15px] font-extrabold tracking-tight text-cyan-300">
                          S/{Number(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-600 line-through">
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

      {/* Formas de pago (Yape / Plin) y envíos */}
      <ShippingOptions store={store} />
      <PaymentMethods store={store} />

      {/* Footer */}
      <footer className="mt-auto py-6 text-center border-t border-white/5">
        {planId === 'free' ? (
          <a href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Creado con TiendApp
          </a>
        ) : (
          <p className="text-xs text-slate-700">Hecho con tecnología</p>
        )}
      </footer>
    </div>
  )
}
