'use client'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Fish, Sparkles, Waves, Leaf } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// SUSHI — Plantilla premium para sushi bars y cocina nikkei.
// Clara y moderna: blanco, rojo japonés y tinta, tipografía
// geométrica (Outfit), acentos circulares tipo nigiri.
// ============================================================

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23fdeaea" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🍣</text></svg>'

export function SushiTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const barItems = useMemo(() => products.filter((p) => p.id !== heroProduct?.id).slice(0, 3), [products, heroProduct])

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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero hacer un pedido de sushi, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#1B1A18] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');
        .su-head { font-family: 'Outfit', system-ui, sans-serif; }
        .su-body { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="su-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#C73E3A] text-white">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-bold tracking-wide">
            Pescado fresco del día{store.hasShipping ? ' · Delivery en 45 min' : ''} · Pedidos por WhatsApp
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FCFBF8]/95 backdrop-blur-md border-b border-[#ECE7DE]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="su-head text-2xl font-extrabold tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-[#6E685F]">
              <a href="#barra" className="hover:text-[#C73E3A] transition-colors">La barra</a>
              <a href="#catalogo" className="hover:text-[#C73E3A] transition-colors">Carta</a>
              {dealProduct && <a href="#combo" className="hover:text-[#C73E3A] transition-colors">Combos</a>}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#1B1A18] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#C73E3A] transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir</span>
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute top-10 right-0 w-[26rem] h-[26rem] rounded-full border-[26px] border-[#F3E9E0] pointer-events-none -translate-y-1/4 translate-x-1/4" />
          <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-[#F3E9E0]/70 blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#FBE9E8] text-[#C73E3A] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6">
                  <Fish className="w-3.5 h-3.5" /> Nikkei fresco, cortado al momento
                </span>
                <h1 className="su-head text-5xl md:text-[3.5rem] font-black leading-[1.03] tracking-tight">
                  Sabor que<br />
                  <span className="text-[#C73E3A]">rueda</span> en tu mesa.
                </h1>
                <p className="su-head text-2xl text-[#A39B8D] font-bold mt-4">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-[#575147] text-[15px] leading-relaxed max-w-md font-medium">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 bg-[#C73E3A] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#A93330] transition-colors shadow-[0_16px_34px_-12px_rgba(199,62,58,0.65)]"
                  >
                    Ver la carta <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#1B1A18]/10 text-[#1B1A18] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#C73E3A] hover:text-[#C73E3A] transition-colors bg-white/70"
                  >
                    <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[430px] overflow-hidden rounded-[3rem] bg-[#FBE9E8] cursor-pointer shadow-[0_30px_60px_-26px_rgba(27,26,24,0.5)]"
                  >
                    <img
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                    />
                  </button>
                  <div className="absolute bottom-0 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(27,26,24,0.4)] p-4 border border-[#ECE7DE]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C73E3A] mb-0.5">Roll estrella</p>
                        <p className="su-head text-lg font-bold leading-tight line-clamp-1">{heroProduct.name}</p>
                      </div>
                      <span className="su-head text-xl font-extrabold text-[#C73E3A] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="absolute top-5 -right-1 md:-right-3 rotate-3 bg-[#C73E3A] text-white text-[11px] font-extrabold px-4 py-2 rounded-full shadow-lg">
                    Fresco hoy
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white border-y border-[#ECE7DE]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#ECE7DE]">
              {[
                { icon: Waves, title: 'Pesca del día', sub: 'Directo del terminal, sin congelados' },
                { icon: Sparkles, title: 'Corte al momento', sub: 'Cada roll se arma al pedirlo' },
                { icon: Leaf, title: 'Insumos nikkei', sub: 'Aceite de sésamo, ají amarillo y más' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-full bg-[#FBE9E8] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#C73E3A]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-[#A39B8D] leading-snug font-bold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── La barra: destacados ── */}
          {barItems.length > 0 && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="barra" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#C73E3A] mb-1.5">Directo de la barra</p>
                  <h2 className="su-head text-3xl md:text-4xl font-black tracking-tight">Los más pedidos</h2>
                </div>
                <a href="#catalogo" className="hidden sm:inline-flex items-center gap-2 text-sm font-extrabold text-[#1B1A18] hover:text-[#C73E3A] transition-colors">
                  Ver todo <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {barItems.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProduct(p.id)}
                    className="group text-left bg-white rounded-[2rem] border border-[#ECE7DE] p-3 hover:-translate-y-1 hover:shadow-[0_26px_44px_-24px_rgba(27,26,24,0.45)] transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#FBE9E8]">
                      <img
                        src={p.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                        onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                      />
                    </div>
                    <div className="px-2 pt-3.5 pb-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="su-head font-bold text-[15px] leading-snug line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-[#A39B8D] font-bold line-clamp-1 mt-0.5">{p.description}</p>
                      </div>
                      <span className="su-head text-lg font-extrabold text-[#C73E3A] shrink-0">S/{Number(p.price).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── Combo destacado ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="combo" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="relative grid md:grid-cols-2 rounded-[2rem] overflow-hidden bg-[#1B1A18] text-white shadow-[0_34px_70px_-30px_rgba(27,26,24,0.8)]">
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#E8B4B2] mb-3">Combo de la casa</p>
                  <p className="su-head text-6xl md:text-7xl font-black leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-white text-[#1B1A18] px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#FBE9E8] transition-colors"
                  >
                    Lo quiero <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden cursor-pointer order-1 md:order-2">
                  <img
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                  />
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
                          ? 'bg-[#C73E3A] text-white border-[#C73E3A]'
                          : 'bg-white text-[#6E685F] border-[#ECE7DE] hover:border-[#C73E3A] hover:text-[#C73E3A]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-white/70' : 'text-[#C6BFB2]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#C73E3A" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C73E3A] mb-1.5">Carta completa</p>
                <h2 className="su-head text-3xl md:text-4xl font-black tracking-tight">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Toda la carta' : categories.find((c) => c.id === selectedCategory)?.name || 'Carta')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C6BFB2]" />
                  <input
                    type="text"
                    placeholder="Buscar rolls, ceviches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#ECE7DE] focus:outline-none focus:border-[#C73E3A] placeholder:text-[#C6BFB2] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FBE9E8] hover:bg-[#ECE7DE] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#6E685F]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-full bg-[#FBE9E8] mx-auto mb-5 flex items-center justify-center">
                  <Fish className="w-7 h-7 text-[#C6BFB2]" />
                </div>
                <p className="su-head text-2xl font-bold text-[#A39B8D]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'El chef está cortando el pescado'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#C73E3A] hover:text-[#A93330] border-b-2 border-[#C73E3A]/30 pb-0.5 transition-colors"
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
                    <div className="relative bg-white rounded-3xl p-2.5 border border-[#ECE7DE] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(199,62,58,0.45)] transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#FBE9E8]">
                        <img
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                        />
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-2 left-2 bg-[#1B1A18] text-white text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                            Estrella
                          </span>
                        )}
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-2 left-2 bg-[#C73E3A] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="block text-center py-2 bg-[#C73E3A]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-full">
                            Pedir
                          </span>
                        </div>
                      </div>
                      <div className="px-1.5 pt-3 pb-1.5">
                        <h3 className="su-head text-[15px] md:text-[16px] font-bold leading-snug line-clamp-1">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-[14px] font-extrabold text-[#C73E3A]">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-[11px] text-[#C6BFB2] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#C73E3A"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#1B1A18] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#E8B4B2] mb-3">Pedidos y encargos</p>
            <h2 className="su-head text-3xl md:text-4xl font-black tracking-tight">Pide tu combo favorito y llega caliente</h2>
            <p className="mt-3 text-white/70 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Escríbenos por WhatsApp: armamos tu tabla, tu combo o tu pedido de la semana.
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
        <footer className="bg-[#141312] text-white/60">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="su-head text-2xl font-bold text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-white/45 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">
              <a href="#barra" className="hover:text-white transition-colors">La barra</a>
              <a href="#catalogo" className="hover:text-white transition-colors">Carta</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
            </div>
            {planId === 'free' && (
              <a href="/" className="mt-2 text-[10px] text-white/30 hover:text-white/60 transition-colors">
                Creado con TiendApp
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
