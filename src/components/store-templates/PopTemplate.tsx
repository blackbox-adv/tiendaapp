'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Truck, ShieldCheck, Tag, Store as StoreIcon } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// POP — Plantilla premium para e-commerce multi-rubro.
// Clara, moderna y directa: blanco, teal y ámbar, tipografía
// Manrope. Banner de oferta, chips de categoría y grid rápida.
// ============================================================

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23e8f4f2" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🛍️</text></svg>'

export function PopTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const heroProduct = useMemo(
    () => products.find((p) => p.featured) || products[0] || null,
    [products]
  )

  const dealProduct = useMemo(() => {
    return products
      .filter((p) => p.originalPrice && Number(p.originalPrice) > Number(p.price))
      .sort((a, b) => {
        const da = 1 - Number(a.price) / Number(a.originalPrice!)
        const db = 1 - Number(b.price) / Number(b.originalPrice!)
        return db - da
      })[0] || null
  }, [products])
  const dealPct = dealProduct
    ? Math.round((1 - Number(dealProduct.price) / Number(dealProduct.originalPrice!)) * 100)
    : 0

  const openProduct = (id: string) =>
    onProductClick ? onProductClick(id) : navigate({ page: 'product-detail', slug: storeSlug, productId: id })

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Tengo una consulta sobre un producto, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-white text-[#16181D] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
        .pp-body { font-family: 'Manrope', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="pp-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#0E9384] text-white">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-extrabold tracking-wide">
            <Truck className="inline w-3.5 h-3.5 mr-1 -mt-0.5" /> {store.hasShipping ? 'Envío gratis en compras desde S/99' : 'Pedidos por WhatsApp todo el día'}
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="text-2xl font-extrabold tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-extrabold text-gray-500">
              <a href="#ofertas" className="hover:text-[#0E9384] transition-colors">Ofertas</a>
              <a href="#catalogo" className="hover:text-[#0E9384] transition-colors">Catálogo</a>
              <a href="#pagos" className="hover:text-[#0E9384] transition-colors">Pagos</a>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#0E9384] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#0B7A6E] transition-colors shadow-[0_10px_20px_-8px_rgba(14,147,132,0.8)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consultar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[#F7FAF9]">
          <div className="absolute -top-20 -right-24 w-96 h-96 rounded-full bg-[#DDF0ED] blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-14 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#DDF0ED] text-[#0B7A6E] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6">
                  <Tag className="w-3.5 h-3.5" /> Todo lo que buscas, en un solo lugar
                </span>
                <h1 className="text-5xl md:text-[3.4rem] font-extrabold leading-[1.05] tracking-tight">
                  Compra fácil,<br />
                  <span className="text-[#0E9384]">llega rápido.</span>
                </h1>
                <p className="text-2xl text-gray-400 font-extrabold mt-4">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-gray-500 text-[15px] leading-relaxed max-w-md font-bold">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 bg-[#0E9384] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#0B7A6E] transition-colors shadow-[0_16px_34px_-12px_rgba(14,147,132,0.8)]"
                  >
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-gray-100 text-[#16181D] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#0E9384] hover:text-[#0E9384] transition-colors bg-white"
                  >
                    <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[430px] overflow-hidden rounded-[2rem] bg-[#DDF0ED] cursor-pointer shadow-[0_30px_60px_-26px_rgba(22,24,29,0.4)]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <div className="absolute bottom-0 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(22,24,29,0.35)] p-4 border border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0E9384] mb-0.5">Producto destacado</p>
                        <p className="text-lg font-extrabold leading-tight line-clamp-1">{heroProduct.name}</p>
                      </div>
                      <span className="text-xl font-extrabold text-[#0E9384] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="absolute top-5 -right-1 md:-right-3 rotate-3 bg-[#F59E0B] text-white text-[11px] font-extrabold px-4 py-2 rounded-full shadow-lg">
                    TOP ventas
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de confianza ── */}
          <section className="bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {[
                { icon: Truck, title: 'Envío rápido', sub: store.hasShipping ? 'Despacho en 24-48 horas' : 'Coordinamos por WhatsApp' },
                { icon: ShieldCheck, title: 'Pago seguro', sub: 'Yape, Plin o transferencia' },
                { icon: StoreIcon, title: 'Stock real', sub: 'Lo que ves, está disponible' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-2xl bg-[#DDF0ED] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#0E9384]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-gray-400 leading-snug font-bold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Banner de oferta ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="ofertas" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="relative grid md:grid-cols-2 rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#0E9384] to-[#12B5A2] text-white shadow-[0_34px_70px_-30px_rgba(14,147,132,0.8)]">
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#CFF3EE] mb-3">Oferta de la semana</p>
                  <p className="text-6xl md:text-7xl font-extrabold leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-white text-[#0B7A6E] px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#DDF0ED] transition-colors"
                  >
                    Aprovechar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden cursor-pointer order-1 md:order-2">
                  <img loading="lazy" decoding="async"
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                  />
                    <ShareProductButton productName={dealProduct.name} price={dealProduct.price} productId={dealProduct.id} slug={storeSlug} storeName={store.name} />
                </button>
              </div>
            </section>
          )}

          {/* ── Categorías ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="flex flex-wrap gap-2.5">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-full text-[13px] font-extrabold border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#16181D] text-white border-[#16181D]'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-[#0E9384] hover:text-[#0E9384]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-white/60' : 'text-gray-300'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#0E9384" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0E9384] mb-1.5">Catálogo</p>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Lo más vendido' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-gray-100 focus:outline-none focus:border-[#0E9384] placeholder:text-gray-300 transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl bg-[#DDF0ED] mx-auto mb-5 flex items-center justify-center">
                  <StoreIcon className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-2xl font-extrabold text-gray-400">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Pronto nuevos productos'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#0E9384] hover:text-[#0B7A6E] border-b-2 border-[#0E9384]/30 pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-9 md:gap-x-6">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => openProduct(product.id)}
                  >
                    <div className="relative bg-white rounded-3xl p-2.5 border-2 border-gray-100 group-hover:-translate-y-1.5 group-hover:border-[#0E9384]/40 group-hover:shadow-[0_28px_44px_-24px_rgba(14,147,132,0.5)] transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F1F5F4]">
                        <img loading="lazy" decoding="async"
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                        />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-2 left-2 bg-[#16181D] text-white text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                            TOP
                          </span>
                        )}
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-2 left-2 bg-[#F59E0B] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="block text-center py-2 bg-[#0E9384]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-full">
                            Ver detalle
                          </span>
                        </div>
                      </div>
                      <div className="px-1.5 pt-3 pb-1.5">
                        <h3 className="text-[15px] md:text-[16px] font-extrabold leading-snug line-clamp-1">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-[14px] font-extrabold text-[#0E9384]">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-[11px] text-gray-300 line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-14 flex justify-center">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="light"
                primaryColor="#0E9384"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section id="pagos" className="bg-[#16181D] text-white scroll-mt-28">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#9FE3DB] mb-3">¿Dudas con tu compra?</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Escríbenos y te respondemos al toque</h2>
            <p className="mt-3 text-white/70 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Consulta stock, tallas, colores o cómo pagar: todo por WhatsApp, sin vueltas.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:brightness-95 transition-all shadow-lg"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-[#101216] text-white/60">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="text-2xl font-extrabold text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-white/45 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">
              <a href="#ofertas" className="hover:text-white transition-colors">Ofertas</a>
              <a href="#catalogo" className="hover:text-white transition-colors">Catálogo</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
            </div>
            {planId === 'free' && (
              <a href="/" className="mt-2 text-[10px] text-white/30 hover:text-white/60 transition-colors">
                Creado con Kyllari
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
