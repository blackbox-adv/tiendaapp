'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, UtensilsCrossed, Flame, Clock, Bike, ArrowRight } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// SABORES — Carta digital para restaurantes y pollerías (v2).
// Nivel de diseño completo: hero con plato estrella, menú del
// día destacado, favoritos del chef, carta por secciones con
// líneas punteadas y catálogo con búsqueda (planes pago).
// ============================================================

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23ffedd5" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🍽️</text></svg>'

export function SaborTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useAppStore((s) => s.navigate)
  const primary = store.colors.primary

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

  const categories = getStoreCategories(products)

  const favorites = useMemo(() => products.filter((p) => p.featured).slice(0, 6), [products])

  const heroProduct = useMemo(
    () =>
      products.find((p) => p.originalPrice && Number(p.originalPrice) > Number(p.price)) ||
      products.find((p) => p.featured) ||
      products[0] ||
      null,
    [products]
  )
  const heroPct = heroProduct?.originalPrice && Number(heroProduct.originalPrice) > Number(heroProduct.price)
    ? Math.round((1 - Number(heroProduct.price) / Number(heroProduct.originalPrice)) * 100)
    : 0

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

  const openProduct = (productId: string) =>
    onProductClick ? onProductClick(productId) : navigate({ page: 'product-detail', slug: storeSlug, productId })

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero pedir mi menú del día, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .sb-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .sb-body { font-family: 'Work Sans', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="sb-body contents">
        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="sb-serif text-2xl tracking-tight text-stone-900 truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-stone-500">
              <a href="#favoritos" className="hover:text-orange-600 transition-colors">Favoritos</a>
              <a href="#carta" className="hover:text-orange-600 transition-colors">La carta</a>
              <a href="#pedido" className="hover:text-orange-600 transition-colors">Pedido</a>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-green-700 transition-colors shadow-md shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4.1.1.1.8-.1 1.8Z"/></svg>
              <span className="hidden sm:inline">Pedir</span>
            </a>
          </div>
        </nav>

        {/* ── Hero tipo carta ── */}
        <header className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 55%, ${primary}80 100%)` }}
          />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              {store.logo && (
                <div className="w-16 h-16 rounded-2xl mb-5 md:mx-0 mx-auto flex items-center justify-center bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
                  <StoreLogo logo={store.logo} size={56} />
                </div>
              )}
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70 mb-2">Nuestra carta</p>
              <h1 className="text-3xl md:text-4xl sb-serif font-bold text-white tracking-tight">
                {store.name}
              </h1>
              <p className="text-sm text-white/80 mt-3 max-w-md md:mx-0 mx-auto leading-relaxed">
                {store.description}
              </p>
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="#carta"
                  className="inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-extrabold rounded-full hover:bg-stone-100 transition-colors"
                  style={{ color: primary }}
                >
                  Ver la carta <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-5 py-2.5 text-sm font-extrabold rounded-full hover:bg-white/10 transition-colors"
                >
                  Pedir menú del día
                </a>
              </div>
              <div className="mt-5 flex justify-center md:justify-start">
                <StoreFeatureBadges
                  hasShipping={store.hasShipping}
                  hasSecurePayment={store.hasSecurePayment}
                  hasReturns={store.hasReturns}
                  variant="light"
                  primaryColor={primary}
                />
              </div>
            </div>

            {heroProduct && (
              <div className="relative pb-14 hidden md:block">
                <button
                  onClick={() => openProduct(heroProduct.id)}
                  className="group relative block w-full aspect-[4/3] max-h-[360px] overflow-hidden rounded-[2rem] bg-white/20 cursor-pointer ring-1 ring-white/40 shadow-[0_30px_60px_-26px_rgba(0,0,0,0.55)]"
                >
                  <img loading="lazy" decoding="async"
                    src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={heroProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                  />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  {heroPct > 0 && (
                    <span className="absolute top-4 left-4 bg-white text-sm font-black px-3.5 py-1.5 rounded-full shadow-lg -rotate-3" style={{ color: primary }}>
                      -{heroPct}% hoy
                    </span>
                  )}
                </button>
                <div className="absolute bottom-0 left-4 right-24 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(0,0,0,0.45)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-0.5" style={{ color: primary }}>
                        {heroPct > 0 ? 'Menú del día' : 'Plato estrella'}
                      </p>
                      <p className="sb-serif text-lg text-stone-900 leading-tight line-clamp-1">{heroProduct.name}</p>
                    </div>
                    <span className="sb-serif text-xl shrink-0" style={{ color: primary }}>S/{Number(heroProduct.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Buscador + tabs de categorías */}
        <nav className="sticky top-16 z-30 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
          <div className="max-w-5xl mx-auto px-4 py-3 space-y-2.5">
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all' ? 'text-white shadow-sm' : 'bg-white text-stone-500 border border-stone-200'
                }`}
                style={selectedCategory === 'all' ? { backgroundColor: primary } : undefined}
              >
                Toda la carta <span className={selectedCategory === 'all' ? 'opacity-70' : 'text-stone-300'}>· {countFor('all')}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id ? 'text-white shadow-sm' : 'bg-white text-stone-500 border border-stone-200'
                  }`}
                  style={selectedCategory === cat.id ? { backgroundColor: primary } : undefined}
                >
                  {cat.name} <span className={selectedCategory === cat.id ? 'opacity-70' : 'text-stone-300'}>· {countFor(cat.id)}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 py-8 w-full">
          <div className="mb-8">
            <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={primary} />
          </div>

          {/* Los favoritos del chef */}
          {favorites.length > 0 && selectedCategory === 'all' && !searchQuery && (
            <section id="favoritos" className="mb-10 scroll-mt-32">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4" style={{ color: primary }} />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-700">Los favoritos</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {favorites.map((p) => (
                  <div
                    key={p.id}
                    className="shrink-0 w-36 cursor-pointer group"
                    onClick={() => openProduct(p.id)}
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden bg-orange-50 border border-stone-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                      <img loading="lazy" decoding="async"
                        src={p.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = IMG_FALLBACK
                        }}
                      />
                    <ShareProductButton productName={p.name} price={p.price} productId={p.id} slug={storeSlug} storeName={store.name} />
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
          <section id="carta" className="scroll-mt-32">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-stone-200" />
                <p className="sb-serif text-2xl text-stone-400">
                  {searchQuery ? `No encontramos "${searchQuery}" en la carta` : 'No hay platos en esta categoria'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-orange-600 hover:text-orange-700 border-b-2 border-orange-200 pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              Object.entries(grouped).map(([catId, items]) => (
                <div key={catId} className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-base sb-serif font-bold text-stone-900 whitespace-nowrap">{catName(catId)}</h2>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>
                  <div className="space-y-1">
                    {items.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-baseline gap-2 py-2.5 px-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all group"
                        onClick={() => openProduct(p.id)}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-stone-100">
                          <img loading="lazy" decoding="async"
                            src={p.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = IMG_FALLBACK
                            }}
                          />
                    <ShareProductButton productName={p.name} price={p.price} productId={p.id} slug={storeSlug} storeName={store.name} />
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
                </div>
              ))
            )}
          </section>

          {/* CTA pedido */}
          <section id="pedido" className="mt-4 scroll-mt-32">
            <div
              className="rounded-[2rem] text-white p-8 md:p-10 text-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${primary}, ${primary}BB)` }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-extrabold">Delivery rápido</p>
                    <p className="text-xs text-white/70 font-bold">En 30-45 min en tu zona</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-extrabold">Menú del día</p>
                    <p className="text-xs text-white/70 font-bold">Cambia a diario, entra y mira</p>
                  </div>
                </div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 bg-white px-8 py-3.5 text-sm font-extrabold rounded-full hover:bg-stone-100 transition-colors shadow-lg"
                style={{ color: primary }}
              >
                Pedir por WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>
        </main>

        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        <footer className="bg-stone-900 text-stone-400 mt-10">
          <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-2.5 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="sb-serif text-xl text-stone-100">{store.name}</p>
            {store.description && (
              <p className="text-xs text-stone-400/70 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            {planId === 'free' && (
              <a href="/" className="mt-1 text-[10px] text-stone-500 hover:text-stone-300 transition-colors">
                Creado con TiendApp
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
