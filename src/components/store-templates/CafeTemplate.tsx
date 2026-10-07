'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Coffee, IceCream2, Croissant, CupSoda } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// CAFE — Plantilla premium para cafeterías modernas y dulcería.
// Clara y amigable: leche, caramelo y espresso, tipografía
// redondeada (Plus Jakarta Sans), stickers y promos 2x1.
// ============================================================

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f6ecdd" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">☕</text></svg>'

export function CafeTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero pedir un cafe/postre, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#2F2114] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
        .cf-head { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .cf-body { font-family: 'Nunito', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="cf-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#B97F45] text-white">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-extrabold tracking-wide">
            ☕ Grain to cup{store.hasShipping ? ' · Envío en 30 min' : ''} · Postres horneados hoy
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#F0E4D2]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="cf-head text-2xl font-extrabold tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-extrabold text-[#9A7B58]">
              <a href="#favoritos" className="hover:text-[#B97F45] transition-colors">Favoritos</a>
              <a href="#catalogo" className="hover:text-[#B97F45] transition-colors">Menú</a>
              {dealProduct && <a href="#promo" className="hover:text-[#B97F45] transition-colors">Promos</a>}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#B97F45] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#9E6A38] transition-colors shadow-[0_10px_20px_-8px_rgba(185,127,69,0.8)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir</span>
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#F6ECDD] blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-[#F3E7D3]/80 blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#F6ECDD] text-[#B97F45] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6">
                  <Coffee className="w-3.5 h-3.5" /> Café de especialidad y dulces caseros
                </span>
                <h1 className="cf-head text-5xl md:text-[3.4rem] font-extrabold leading-[1.06] tracking-tight">
                  Tu momento<br />
                  <span className="text-[#B97F45]">dulce</span> del día.
                </h1>
                <p className="cf-head text-2xl text-[#9A7B58] font-bold mt-4">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-[#6E5B44] text-[15px] leading-relaxed max-w-md font-bold">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 bg-[#B97F45] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#9E6A38] transition-colors shadow-[0_16px_34px_-12px_rgba(185,127,69,0.8)]"
                  >
                    Ver el menú <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#2F2114]/10 text-[#2F2114] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#B97F45] hover:text-[#B97F45] transition-colors bg-white/70"
                  >
                    <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[430px] overflow-hidden rounded-[2.5rem] bg-[#F6ECDD] cursor-pointer shadow-[0_30px_60px_-26px_rgba(47,33,20,0.5)]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <span className="absolute -top-3 left-8 -rotate-6 bg-[#708A4E] text-white text-[11px] font-extrabold px-4 py-2 rounded-full shadow-lg">
                    100% arábica ☕
                  </span>
                  <div className="absolute bottom-0 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(47,33,20,0.4)] p-4 border border-[#F0E4D2]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B97F45] mb-0.5">La favorita de la casa</p>
                        <p className="cf-head text-lg font-bold leading-tight line-clamp-1">{heroProduct.name}</p>
                      </div>
                      <span className="cf-head text-xl font-extrabold text-[#B97F45] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white/80 border-y border-[#F0E4D2]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#F0E4D2]">
              {[
                { icon: Coffee, title: 'Tueste medio', sub: 'Notas de chocolate y panela' },
                { icon: Croissant, title: 'Horneado hoy', sub: 'Croissants y pan dulce fresco' },
                { icon: IceCream2, title: 'Fríos y cremosos', sub: 'Frappés, helados y affogato' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-2xl bg-[#F6ECDD] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#B97F45]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-[#9A7B58] leading-snug font-bold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Promo del día ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="promo" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="relative grid md:grid-cols-2 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#B97F45] to-[#8F5F30] text-white shadow-[0_34px_70px_-30px_rgba(143,95,48,0.8)]">
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#F6E7CF] mb-3">Promo 2x1 del día</p>
                  <p className="cf-head text-6xl md:text-7xl font-extrabold leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-white text-[#2F2114] px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#F6ECDD] transition-colors"
                  >
                    Lo quiero <ArrowRight className="w-4 h-4" />
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
                <CupSoda className="absolute -bottom-6 -left-6 w-28 h-28 text-white/10 pointer-events-none" />
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
                          ? 'bg-[#2F2114] text-[#FFFDF8] border-[#2F2114]'
                          : 'bg-white text-[#9A7B58] border-[#F0E4D2] hover:border-[#B97F45] hover:text-[#B97F45]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-[#F6E7CF]' : 'text-[#D4BC9B]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div id="favoritos" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#B97F45" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#B97F45] mb-1.5">Menú completo</p>
                <h2 className="cf-head text-3xl md:text-4xl font-extrabold tracking-tight">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Cafés, dulces y más' : categories.find((c) => c.id === selectedCategory)?.name || 'Menú')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4BC9B]" />
                  <input
                    type="text"
                    placeholder="Buscar cafés, postres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#F0E4D2] focus:outline-none focus:border-[#B97F45] placeholder:text-[#D4BC9B] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F6ECDD] hover:bg-[#F0E4D2] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#9A7B58]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl bg-[#F6ECDD] mx-auto mb-5 flex items-center justify-center">
                  <Coffee className="w-7 h-7 text-[#D4BC9B]" />
                </div>
                <p className="cf-head text-2xl font-bold text-[#9A7B58]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'La leche se está texturizando'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#B97F45] hover:text-[#9E6A38] border-b-2 border-[#B97F45]/30 pb-0.5 transition-colors"
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
                    <div className="relative bg-white rounded-3xl p-2.5 border border-[#F0E4D2] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(185,127,69,0.6)] transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F6ECDD]">
                        <img loading="lazy" decoding="async"
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                        />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-2 left-2 bg-[#2F2114] text-[#FFFDF8] text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                            Favorito
                          </span>
                        )}
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-2 left-2 bg-[#B97F45] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="block text-center py-2 bg-[#B97F45]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-full">
                            Pedir
                          </span>
                        </div>
                      </div>
                      <div className="px-1.5 pt-3 pb-1.5">
                        <h3 className="cf-head text-[15px] md:text-[16px] font-bold leading-snug line-clamp-1">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-[14px] font-extrabold text-[#B97F45]">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-[11px] text-[#D4BC9B] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#B97F45"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#2F2114] text-[#FFFDF8]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#F6E7CF] mb-3">Pedidos y encargos</p>
            <h2 className="cf-head text-3xl md:text-4xl font-extrabold tracking-tight">Tu café listo cuando llegues</h2>
            <p className="mt-3 text-[#FFFDF8]/75 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Mándanos tu pedido por WhatsApp y lo tenemos listo para recoger o a tu puerta.
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
        <footer className="bg-[#261B10] text-[#FFFDF8]/60">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="cf-head text-2xl font-bold text-[#FFFDF8]">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#FFFDF8]/45 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-[#F6E7CF]/30 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#FFFDF8]/50 font-bold">
              <a href="#favoritos" className="hover:text-white transition-colors">Favoritos</a>
              <a href="#catalogo" className="hover:text-white transition-colors">Menú</a>
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
