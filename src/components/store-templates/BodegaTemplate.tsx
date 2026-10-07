'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, ShoppingBasket, Phone, Percent, Clock, Bike } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// MERCADITO — Plantilla premium para bodegas y abarrotes (v2).
// Energía de barrio con diseño de nivel: oferta del día,
// ofertas de la semana en franja, categorías y catálogo
// rápido con búsqueda (planes pago).
// ============================================================

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23fef3c7" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🛒</text></svg>'

export function BodegaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useAppStore((s) => s.navigate)
  const primary = store.colors.primary
  const secondary = store.colors.secondary

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

  const heroProduct = useMemo(
    () => products.find((p) => p.originalPrice && Number(p.originalPrice) > Number(p.price))
      || products.find((p) => p.featured)
      || products[0]
      || null,
    [products]
  )
  const heroPct = heroProduct?.originalPrice && Number(heroProduct.originalPrice) > Number(heroProduct.price)
    ? Math.round((1 - Number(heroProduct.price) / Number(heroProduct.originalPrice)) * 100)
    : 0

  const deals = useMemo(
    () => products.filter((p) => p.originalPrice && Number(p.originalPrice) > Number(p.price)).slice(0, 6),
    [products]
  )

  const openProduct = (productId: string) =>
    onProductClick ? onProductClick(productId) : navigate({ page: 'product-detail', slug: storeSlug, productId })

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}, quisiera hacer un pedido`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .bg-body { font-family: 'Nunito', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="bg-body contents">
        {/* Cinta superior estilo mercado */}
        <div className="overflow-hidden border-b-2 border-black/5" style={{ backgroundColor: secondary }}>
          <div className="flex items-center justify-center gap-6 py-1.5 px-4 text-[11px] font-bold uppercase tracking-wide text-gray-900/80">
            <span>🚚 Delivery en tu barrio</span>
            <span className="hidden sm:inline">🏪 Abierto ahora</span>
            <span>📲 Pide por WhatsApp</span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={32} />}
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-extrabold text-gray-500">
              <a href="#oferta" className="hover:text-amber-600 transition-colors">Oferta del día</a>
              <a href="#semana" className="hover:text-amber-600 transition-colors">Ofertas</a>
              <a href="#catalogo" className="hover:text-amber-600 transition-colors">Catálogo</a>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:brightness-95 transition-all shadow-md shrink-0"
              style={{ backgroundColor: primary }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir</span>
            </a>
          </div>
        </nav>

        {/* Hero: oferta del día */}
        <section className="bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12">
            <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div className="text-center md:text-left">
                <span
                  className="inline-flex items-center gap-2 text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wide"
                  style={{ backgroundColor: secondary + '55', color: '#1f2937' }}
                >
                  <Percent className="w-3.5 h-3.5" /> Tu bodega de barrio, ahora online
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.05]">
                  Pide al toque,<br />
                  <span style={{ color: primary }}>te lo llevamos.</span>
                </h1>
                {store.description && (
                  <p className="mt-4 text-gray-500 text-[15px] leading-relaxed max-w-md font-bold mx-auto md:mx-0">
                    {store.description}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 text-white px-7 py-3.5 text-sm font-extrabold rounded-full hover:brightness-95 transition-all shadow-lg"
                    style={{ backgroundColor: primary }}
                  >
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-green-500 text-green-700 px-6 py-3 text-sm font-extrabold rounded-full hover:bg-green-50 transition-colors bg-white"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
                <div className="mt-6 flex justify-center md:justify-start">
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
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[420px] overflow-hidden rounded-[2rem] bg-amber-50 cursor-pointer shadow-[0_30px_60px_-26px_rgba(120,72,6,0.5)]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                    {heroPct > 0 && (
                      <span
                        className="absolute top-4 left-4 text-white text-sm font-black px-3.5 py-1.5 rounded-full shadow-lg rotate-3"
                        style={{ backgroundColor: primary }}
                      >
                        -{heroPct}% HOY
                      </span>
                    )}
                  </button>
                  <div className="absolute bottom-0 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(120,72,6,0.4)] p-4 border-2 border-amber-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-0.5" style={{ color: primary }}>
                          {heroPct > 0 ? 'Oferta del día' : 'Lo más pedido'}
                        </p>
                        <p className="text-lg font-black text-gray-900 leading-tight line-clamp-1">{heroProduct.name}</p>
                      </div>
                      <span className="text-xl font-black shrink-0" style={{ color: primary }}>S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Banda de valores */}
        <section className="bg-white/70 border-y-2 border-amber-100">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-100">
            {[
              { icon: Bike, title: 'Delivery de barrio', sub: 'En menos de 1 hora' },
              { icon: Clock, title: 'Siempre abiertos', sub: 'De 8 am a 10 pm todos los días' },
              { icon: Percent, title: 'Precios de mercado', sub: 'Ofertas reales cada semana' },
            ].map((v) => (
              <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                <span className="w-11 h-11 rounded-2xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center shrink-0">
                  <v.icon className="w-5 h-5 text-amber-600" />
                </span>
                <div>
                  <p className="text-[13px] font-black text-gray-800">{v.title}</p>
                  <p className="text-[11px] text-gray-500 leading-snug font-bold">{v.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* Ofertas de la semana */}
          {deals.length > 0 && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="semana" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 scroll-mt-28">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] mb-1" style={{ color: primary }}>Aprovecha</p>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">Ofertas de la semana</h2>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {deals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProduct(p.id)}
                    className="shrink-0 w-40 text-left group cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-50 border-2 border-amber-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                      <img loading="lazy" decoding="async"
                        src={p.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                      />
                    <ShareProductButton productName={p.name} price={p.price} productId={p.id} slug={storeSlug} storeName={store.name} />
                      <span
                        className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-1 rounded-full"
                        style={{ backgroundColor: primary }}
                      >
                        -{Math.round((1 - Number(p.price) / Number(p.originalPrice!)) * 100)}%
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-gray-800 mt-2 truncate">{p.name}</p>
                    <p className="text-sm font-black" style={{ color: primary }}>
                      S/{Number(p.price).toFixed(2)}{' '}
                      <span className="text-[11px] text-gray-300 line-through font-bold">S/{Number(p.originalPrice!).toFixed(2)}</span>
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categorías */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 scroll-mt-28">
              <div className="flex flex-wrap gap-2">
                {[{ id: 'all', name: 'Todos' }, ...categories].map((cat, i) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide whitespace-nowrap border-2 transition-all ${
                        active
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                      }`}
                      style={active ? { backgroundColor: i % 2 === 0 ? primary : secondary, color: i % 2 === 0 ? '#fff' : '#1f2937' } : undefined}
                    >
                      {cat.name} <span className={active ? 'opacity-70' : 'text-gray-300'}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Packs / combos (funcionalidad intacta) */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={primary} />
            </div>
          )}

          {/* Catálogo */}
          <section id="catalogo" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-7 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] mb-1" style={{ color: primary }}>Catálogo</p>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Todo en tu bodega' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="¿Qué buscas hoy?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs rounded-full border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all font-extrabold"
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
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBasket className="w-12 h-12 mx-auto mb-4 text-amber-200" />
                <p className="text-gray-400 text-sm font-bold">
                  {searchQuery ? `No encontramos "${searchQuery}" en el estante` : 'No hay productos en esta categoria'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-amber-600 hover:text-amber-700 border-b-2 border-amber-200 pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-amber-200 hover:shadow-md hover:-translate-y-1 transition-all"
                    onClick={() => openProduct(product.id)}
                  >
                    <div className="aspect-square bg-amber-50 relative overflow-hidden">
                      <img loading="lazy" decoding="async"
                        src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = IMG_FALLBACK
                        }}
                      />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                      {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                        <div
                          className="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-[10px] font-black shadow-sm"
                          style={{ backgroundColor: primary }}
                        >
                          -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                        </div>
                      )}
                      {product.featured && !product.originalPrice && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-gray-900/85 text-white text-[10px] font-black">
                          TOP
                        </div>
                      )}
                    </div>
                    <div className="p-3 relative">
                      <h3 className="text-sm font-extrabold text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <span className="text-lg font-black" style={{ color: primary }}>
                            S/{Number(product.price).toFixed(2)}
                          </span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-xs text-gray-300 line-through block font-bold">
                              S/{Number(product.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 group-hover:scale-110 transition-transform"
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
          </section>

          {/* CTA WhatsApp */}
          {store.whatsappNumber && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 font-extrabold hover:from-green-700 hover:to-green-600 transition-all shadow-md"
              >
                <Phone className="w-5 h-5" />
                ¿No encuentras algo? Escríbenos por WhatsApp
              </a>
            </div>
          )}
        </main>

        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        <footer className="bg-amber-950 text-amber-100/60 mt-8">
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col items-center gap-2.5 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="text-xl font-black text-amber-50">{store.name}</p>
            {store.description && (
              <p className="text-xs text-amber-100/45 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <a href="#catalogo" className="text-[10px] uppercase tracking-[0.2em] text-amber-100/50 font-black hover:text-white transition-colors mt-1">
              Volver al catálogo
            </a>
            {planId === 'free' && (
              <a href="/" className="mt-1 text-[10px] text-amber-100/30 hover:text-amber-100/60 transition-colors">
                Creado con TiendApp
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
