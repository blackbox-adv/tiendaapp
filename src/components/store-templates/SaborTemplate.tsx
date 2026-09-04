'use client'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, UtensilsCrossed, Flame } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ── Sabores: carta digital para restaurantes, pollerías y panaderías ──

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23ffedd5" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🍽️</text></svg>'

export function SaborTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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
  const favorites = products.filter((p) => p.featured).slice(0, 6)
  const grouped = useMemo(() => {
    const byCat: Record<string, Product[]> = {}
    for (const p of filteredProducts) {
      const key = p.categoryId || 'otros'
      if (!byCat[key]) byCat[key] = []
      byCat[key].push(p)
    }
    return byCat
  }, [filteredProducts])
  const catName = (id: string) => categories.find((c) => c.id === id)?.name || 'Otros'

  const handleClick = (productId: string) =>
    onProductClick ? onProductClick(productId) : navigate({ page: 'product-detail', slug: storeSlug, productId: productId })

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero tipo carta */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 55%, ${primary}80 100%)` }}
        />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative max-w-3xl mx-auto px-6 py-14 text-center">
          {store.logo && (
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
              <StoreLogo logo={store.logo} size={56} />
            </div>
          )}
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70 mb-2">Nuestra carta</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            {store.name}
          </h1>
          <p className="text-sm text-white/80 mt-3 max-w-md mx-auto leading-relaxed">
            {store.description}
          </p>
          <div className="mt-5 flex justify-center">
            <StoreFeatureBadges
              hasShipping={store.hasShipping}
              hasSecurePayment={store.hasSecurePayment}
              hasReturns={store.hasReturns}
              variant="light"
              primaryColor={primary}
            />
          </div>
        </div>
      </header>

      {/* Buscador + tabs de categorías */}
      <nav className="sticky top-[53px] z-30 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2.5">
          {planId !== 'free' && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar en la carta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-stone-500" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all' ? 'text-white shadow-sm' : 'bg-white text-stone-500 border border-stone-200'
              }`}
              style={selectedCategory === 'all' ? { backgroundColor: primary } : undefined}
            >
              Toda la carta
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id ? 'text-white shadow-sm' : 'bg-white text-stone-500 border border-stone-200'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: primary } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={primary} />
        </div>

        {/* Los favoritos del chef */}
        {favorites.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4" style={{ color: primary }} />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-700">Los favoritos</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {favorites.map((p) => (
                <div
                  key={p.id}
                  className="shrink-0 w-36 cursor-pointer group"
                  onClick={() => handleClick(p.id)}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-orange-50 border border-stone-200 shadow-sm group-hover:shadow-md transition-all">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = IMG_FALLBACK
                      }}
                    />
                  </div>
                  <p className="text-xs font-bold text-stone-800 mt-2 truncate">{p.name}</p>
                  <p className="text-sm font-extrabold" style={{ color: primary }}>
                    S/{Number(p.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Carta por secciones (estilo menú) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-stone-200" />
            <p className="text-stone-400 text-sm">
              {searchQuery ? `No encontramos "${searchQuery}" en la carta` : 'No hay platos en esta categoria'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([catId, items]) => (
            <section key={catId} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-serif font-bold text-stone-900 whitespace-nowrap">{catName(catId)}</h2>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="space-y-1">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-baseline gap-2 py-2.5 px-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all group"
                    onClick={() => handleClick(p.id)}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-stone-100">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = IMG_FALLBACK
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-stone-800 truncate group-hover:text-stone-950">
                          {p.name}
                        </span>
                        <span className="flex-1 border-b border-dotted border-stone-300 translate-y-[-3px] min-w-[1rem]" />
                        <span className="text-sm font-extrabold whitespace-nowrap" style={{ color: primary }}>
                          S/{Number(p.price).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <ShippingOptions store={store} />
      <PaymentMethods store={store} />

      <footer className="py-6 text-center">
        {planId === 'free' && (
          <a href="/" className="text-xs text-stone-300 hover:text-stone-500 transition-colors">
            Creado con TiendApp
          </a>
        )}
      </footer>
    </div>
  )
}
