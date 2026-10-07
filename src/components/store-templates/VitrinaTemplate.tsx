'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { ShoppingBag, Search, X, ArrowRight } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// VITRINA — Plantilla premium editorial tipo lookbook.
// Fondo crema, tipografía serif, producto destacado grande y
// grilla de revista con aire. Ideal para boutiques, joyería,
// flores, belleza y pastelerías.
// ============================================================

export function VitrinaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
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
    return result
  }, [products, selectedCategory, searchQuery])

  // Producto destacado para el hero editorial (solo vista "Todo" sin búsqueda)
  const heroProduct = useMemo(
    () => (selectedCategory === 'all' && !searchQuery.trim() ? (products.find((p) => p.featured) || null) : null),
    [products, selectedCategory, searchQuery]
  )
  // En la grilla, el destacado del hero se omite para no repetirlo
  const gridProducts = useMemo(
    () => (heroProduct ? filteredProducts.filter((p) => p.id !== heroProduct.id) : filteredProducts),
    [filteredProducts, heroProduct]
  )

  const openProduct = (id: string) =>
    onProductClick ? onProductClick(id) : navigate({ page: 'product-detail', slug: storeSlug, productId: id })

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      {/* ── Header editorial ── */}
      {store.bannerUrl ? (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img loading="lazy" decoding="async" src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-black/45 to-black/25" />
          <div className="absolute inset-x-0 bottom-0 pb-10 text-center px-6">
            {store.logo && (
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/80 ring-1 ring-stone-200 shadow-sm">
                <StoreLogo logo={store.logo} size={58} />
              </div>
            )}
            <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-white drop-shadow-sm">{store.name}</h1>
            {store.description && (
              <p className="text-sm text-white/85 mt-2.5 max-w-md mx-auto font-light tracking-wide">{store.description}</p>
            )}
          </div>
        </div>
      ) : (
        <header className="text-center px-6 pt-14 pb-10">
          <div className="max-w-xl mx-auto">
            {store.logo && (
              <div className="w-[72px] h-[72px] rounded-full mx-auto mb-5 flex items-center justify-center bg-white ring-1 ring-stone-200 shadow-sm ring-offset-4 ring-offset-[#FAF7F2]">
                <StoreLogo logo={store.logo} size={64} />
              </div>
            )}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-8 bg-stone-300" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">Catálogo</p>
              <span className="h-px w-8 bg-stone-300" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight">{store.name}</h1>
            {store.description && (
              <p className="text-stone-500 mt-4 font-light leading-relaxed max-w-sm mx-auto">{store.description}</p>
            )}
            <div className="mt-6">
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

      {/* ── Navegación de categorías editorial ── */}
      <nav className="sticky top-[53px] z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-6 py-3.5 space-y-3">
          {planId !== 'free' && (
            <div className="relative max-w-xs mx-auto">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar en el catálogo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-7 py-2 text-sm bg-transparent border-0 border-b border-stone-300 focus:outline-none focus:border-stone-900 placeholder:text-stone-400 rounded-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-stone-600" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center justify-start md:justify-center gap-6 overflow-x-auto scrollbar-hide">
            {['all', ...categories.map((c) => c.id)].map((catId) => {
              const label = catId === 'all' ? 'Todo' : (categories.find((c) => c.id === catId)?.name ?? catId)
              const active = selectedCategory === catId
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className={`pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-[0.18em] whitespace-nowrap border-b transition-colors duration-200 ${
                    active
                      ? 'text-stone-900 border-stone-900'
                      : 'text-stone-400 border-transparent hover:text-stone-700'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Combos/Packs */}
        <div className="mb-10">
          <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={store.colors.primary} />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-full bg-white mx-auto mb-5 flex items-center justify-center ring-1 ring-stone-200">
              <ShoppingBag className="w-6 h-6 text-stone-300" />
            </div>
            <p className="font-serif text-lg text-stone-400">
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos en esta categoría'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 border-b border-stone-400 pb-0.5 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Hero editorial: producto destacado ── */}
            {heroProduct && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-14 cursor-pointer group"
                onClick={() => openProduct(heroProduct.id)}
              >
                <div className="grid md:grid-cols-5 gap-0 bg-white shadow-sm ring-1 ring-stone-200/70 overflow-hidden">
                  <div className="md:col-span-3 aspect-[4/3] md:aspect-auto md:min-h-[380px] relative overflow-hidden bg-stone-100">
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                      }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900 text-[#FAF7F2] text-[10px] font-semibold uppercase tracking-[0.25em]">
                      Destacado
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-center p-7 md:p-9">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: store.colors.primary }}>
                      {categories.find((c) => c.id === heroProduct.categoryId)?.name || 'Colección'}
                    </p>
                    <h2 className="font-serif text-2xl md:text-3xl leading-snug tracking-tight">{heroProduct.name}</h2>
                    {heroProduct.description && (
                      <p className="text-sm text-stone-500 font-light leading-relaxed mt-3 line-clamp-3">{heroProduct.description}</p>
                    )}
                    <div className="h-px w-12 bg-stone-300 my-5" />
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-2xl font-semibold" style={{ color: store.colors.primary }}>
                        S/{Number(heroProduct.price).toFixed(2)}
                      </span>
                      {heroProduct.originalPrice && (
                        <span className="text-sm text-stone-400 line-through">S/{Number(heroProduct.originalPrice).toFixed(2)}</span>
                      )}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-700 group-hover:gap-3.5 transition-all duration-300">
                      Ver detalle <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Conteo */}
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-serif text-xl md:text-2xl tracking-tight">
                {searchQuery.trim() ? 'Resultados' : (categories.find((c) => c.id === selectedCategory)?.name || 'Colección')}
              </h2>
              <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">{gridProducts.length} pieza{gridProducts.length !== 1 ? 's' : ''}</span>
            </div>

            {/* ── Grilla editorial ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-7">
              <AnimatePresence mode="popLayout">
                {gridProducts.map((product, i) => (
                  <motion.article
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                    className="group cursor-pointer"
                    onClick={() => openProduct(product.id)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-stone-100 rounded-md">
                      <img loading="lazy" decoding="async"
                        src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                        }}
                      />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                      {product.originalPrice && (
                        <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white" style={{ backgroundColor: store.colors.primary }}>
                          -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                        </div>
                      )}
                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/15 transition-colors duration-400" />
                      <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="block text-center py-2.5 bg-white/95 backdrop-blur-sm text-stone-900 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-md">
                          Ver detalle
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-stone-400 mb-1">
                        {categories.find((c) => c.id === product.categoryId)?.name || 'Producto'}
                      </p>
                      <h3 className="font-serif text-[15px] leading-snug">{product.name}</h3>
                      <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className="text-sm font-medium" style={{ color: store.colors.primary }}>
                          S/{Number(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">S/{Number(product.originalPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.article>
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
      <footer className="mt-auto py-8 text-center border-t border-stone-200/70">
        <p className="font-serif italic text-stone-400 text-sm">{store.name}</p>
        {planId === 'free' && (
          <a href="/" className="block mt-1.5 text-xs text-stone-300 hover:text-stone-500 transition-colors">
            Creado con Kyllari
          </a>
        )}
      </footer>
    </div>
  )
}
