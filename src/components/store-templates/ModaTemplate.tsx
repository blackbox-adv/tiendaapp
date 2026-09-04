'use client'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ShoppingBag } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ── Pasarela: editorial de moda para boutiques y accesorios ──

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533"><rect fill="%23f5f5f4" width="400" height="533"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">👗</text></svg>'

export function ModaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useAppStore((s) => s.navigate)
  const primary = store.colors.primary
  const secondary = store.colors.secondary

  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [products, selectedCategory, searchQuery])

  const categories = getStoreCategories(products)
  const featured = products.find((p) => p.featured && p.imageUrl)

  const handleClick = (productId: string) =>
    onProductClick ? onProductClick(productId) : navigate({ page: 'product-detail', slug: storeSlug, productId: productId })

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Hero editorial: texto + pieza destacada */}
      <header className="border-b border-stone-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="px-6 md:px-10 py-12 md:py-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-400 mb-4">
              Nueva colección
            </p>
            <div className="flex items-center gap-3 mb-4 md:hidden">
              {store.logo && <StoreLogo logo={store.logo} size={40} />}
              <h1 className="text-3xl font-light uppercase tracking-[0.18em] text-stone-900 leading-tight">
                {store.name}
              </h1>
            </div>
            <h1 className="hidden md:block text-4xl lg:text-5xl font-light uppercase tracking-[0.18em] text-stone-900 leading-tight mb-4">
              {store.name}
            </h1>
            <div className="w-12 h-px mb-4" style={{ backgroundColor: secondary }} />
            <p className="text-sm text-stone-500 leading-relaxed max-w-sm">{store.description}</p>
            <div className="mt-6">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="light"
                primaryColor={primary}
              />
            </div>
          </div>
          <div className="relative h-64 md:h-full min-h-[320px] bg-stone-100">
            {featured ? (
              <img
                src={featured.imageUrl}
                alt={featured.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = IMG_FALLBACK
                }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(160deg, ${primary}14, ${secondary}22)` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f7] via-transparent to-transparent hidden md:block" />
          </div>
        </div>
      </header>

      {/* Categorías tipo editorial */}
      <nav className="sticky top-[53px] z-30 bg-[#faf9f7]/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {planId !== 'free' && (
            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 focus:w-44 pl-8 pr-7 py-1.5 text-xs rounded-full border border-stone-200 bg-white focus:outline-none focus:border-stone-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5 text-stone-500" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-[11px] font-semibold uppercase tracking-[0.2em] whitespace-nowrap pb-0.5 border-b transition-all ${
              selectedCategory === 'all' ? 'text-stone-900' : 'text-stone-400 border-transparent hover:text-stone-600'
            }`}
            style={selectedCategory === 'all' ? { borderColor: primary } : undefined}
          >
            Todo
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-[11px] font-semibold uppercase tracking-[0.2em] whitespace-nowrap pb-0.5 border-b transition-all ${
                selectedCategory === cat.id ? 'text-stone-900' : 'text-stone-400 border-transparent hover:text-stone-600'
              }`}
              style={selectedCategory === cat.id ? { borderColor: primary } : undefined}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={primary} />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-stone-200" />
            <p className="text-stone-400 text-sm tracking-wide">
              {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay piezas en esta colección'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => handleClick(product.id)}
              >
                <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = IMG_FALLBACK
                    }}
                  />
                  {product.originalPrice && (
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2 py-1 text-white"
                      style={{ backgroundColor: secondary }}
                    >
                      Sale
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
                    Ver
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] text-stone-400 font-medium">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-3 text-center md:text-left">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-800 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline justify-center md:justify-start gap-2 mt-1">
                    <span className="text-sm font-light text-stone-900">
                      S/{Number(product.price).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-stone-300 line-through">
                        S/{Number(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ShippingOptions store={store} />
      <PaymentMethods store={store} />

      <footer className="border-t border-stone-200 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-300 mb-1">{store.name}</p>
        {planId === 'free' && (
          <a href="/" className="text-xs text-stone-300 hover:text-stone-500 transition-colors">
            Creado con TiendApp
          </a>
        )}
      </footer>
    </div>
  )
}
