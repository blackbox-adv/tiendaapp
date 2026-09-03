'use client'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ShoppingBasket, Phone } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ── Mercadito: energía de barrio para bodegas, abarrotes y almacenes ──

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23fef3c7" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🛒</text></svg>'

export function BodegaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useAppStore((s) => s.navigate)
  const primary = store.colors.primary
  const secondary = store.colors.secondary

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const q = searchQuery.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    )
  }, [products, searchQuery])

  const categories = getStoreCategories(products)
  const handleClick = (productId: string) =>
    onProductClick ? onProductClick(productId) : navigate({ page: 'product-detail', slug: storeSlug, productId: productId })

  return (
    <div className="min-h-screen bg-amber-50/40">
      {/* Cinta superior estilo mercado */}
      <div className="overflow-hidden border-b-2 border-black/5" style={{ backgroundColor: secondary }}>
        <div className="flex items-center justify-center gap-6 py-1.5 px-4 text-[11px] font-bold uppercase tracking-wide text-gray-900/80">
          <span>🚚 Delivery en tu barrio</span>
          <span className="hidden sm:inline">🏪 Abierto ahora</span>
          <span>📲 Pide por WhatsApp</span>
        </div>
      </div>

      {/* Encabezado */}
      <header className="text-center pt-10 pb-8 px-6 bg-white">
        {store.logo && (
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl border-4"
            style={{ borderColor: primary + '33' }}
          >
            <StoreLogo logo={store.logo} size={72} />
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {store.name}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto font-medium">
          {store.description}
        </p>
        <div className="mt-4 flex justify-center">
          <StoreFeatureBadges
            hasShipping={store.hasShipping}
            hasSecurePayment={store.hasSecurePayment}
            hasReturns={store.hasReturns}
            variant="light"
            primaryColor={primary}
          />
        </div>
      </header>

      {/* Buscador + categorías */}
      <nav className="sticky top-[53px] z-30 bg-white/95 backdrop-blur-sm border-b-2 border-amber-100">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          {planId !== 'free' && (
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="¿Qué buscas hoy?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-full border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap border-2 transition-all ${
                selectedCategory === 'all'
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
              }`}
              style={selectedCategory === 'all' ? { backgroundColor: primary } : undefined}
            >
              Todos
            </button>
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap border-2 transition-all ${
                  selectedCategory === cat.id
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                }`}
                style={
                  selectedCategory === cat.id
                    ? { backgroundColor: i % 2 === 0 ? primary : secondary }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={primary} />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBasket className="w-12 h-12 mx-auto mb-4 text-amber-200" />
            <p className="text-gray-400 text-sm font-medium">
              {searchQuery ? `No encontramos "${searchQuery}" en el estante` : 'No hay productos en esta categoria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-amber-200 hover:shadow-md transition-all"
                onClick={() => handleClick(product.id)}
              >
                <div className="aspect-square bg-amber-50 relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = IMG_FALLBACK
                    }}
                  />
                  {product.originalPrice && (
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-[10px] font-extrabold shadow-sm"
                      style={{ backgroundColor: primary }}
                    >
                      OFERTA
                    </div>
                  )}
                </div>
                <div className="p-3 relative">
                  <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <span className="text-lg font-extrabold" style={{ color: primary }}>
                        S/{Number(product.price).toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-300 line-through block">
                          S/{Number(product.originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: secondary, color: '#1f2937' }}
                    >
                      +
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA WhatsApp */}
        {store.whatsappNumber && (
          <a
            href={`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}, quisiera hacer un pedido`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 font-bold hover:from-green-700 hover:to-green-600 transition-all shadow-md"
          >
            <Phone className="w-5 h-5" />
            ¿No encuentras algo? Escríbenos por WhatsApp
          </a>
        )}
      </main>

      <PaymentMethods store={store} />

      <footer className="py-6 text-center">
        {planId === 'free' && (
          <a href="/" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
            Creado con TiendApp
          </a>
        )}
      </footer>
    </div>
  )
}
