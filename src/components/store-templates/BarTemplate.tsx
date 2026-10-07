'use client'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Beer, Flame, Timer, Music } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// BARRA — Plantilla premium para bares, cantinas y piqueos.
// Clara con carácter: crema, verde botella y ámbar, titulares
// condensados (Archivo), happy hour protagonista.
// ============================================================

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23efe9d8" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🍸</text></svg>'

export function BarTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero reservar / pedir piqueos, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#F7F3E8] text-[#20261F] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
        .br-head { font-family: 'Archivo', system-ui, sans-serif; letter-spacing: -0.02em; }
        .br-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="br-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#2E4B3F] text-[#EDE6CF]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-extrabold tracking-wide">
            <Timer className="inline w-3.5 h-3.5 mr-1 -mt-0.5" /> Happy hour de 5 a 8 pm{store.hasShipping ? ' · Piqueos a domicilio' : ''}
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#F7F3E8]/95 backdrop-blur-md border-b border-[#E4DCC6]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="br-head text-2xl font-black uppercase truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-extrabold text-[#6D7263]">
              <a href="#carta" className="hover:text-[#C9862B] transition-colors">La carta</a>
              <a href="#feliz" className="hover:text-[#C9862B] transition-colors">Happy hour</a>
              <a href="#catalogo" className="hover:text-[#C9862B] transition-colors">Todo</a>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#2E4B3F] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#243B32] transition-colors shadow-[0_10px_20px_-8px_rgba(46,75,63,0.8)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reservar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#EDE4CB] blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#EDE4CB] text-[#8A6519] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
                  <Beer className="w-3.5 h-3.5" /> Tragos artesanales y piqueos de verdad
                </span>
                <h1 className="br-head text-5xl md:text-[3.6rem] font-black uppercase leading-[0.98]">
                  Brindemos,<br />
                  <span className="text-[#C9862B]">como siempre.</span>
                </h1>
                <p className="br-head text-2xl text-[#6D7263] font-extrabold mt-4 uppercase">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-[#4C5348] text-[15px] leading-relaxed max-w-md font-semibold">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#carta"
                    className="inline-flex items-center gap-2 bg-[#2E4B3F] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#243B32] transition-colors shadow-[0_16px_34px_-12px_rgba(46,75,63,0.8)]"
                  >
                    Ver la carta <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#20261F]/12 text-[#20261F] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#C9862B] hover:text-[#C9862B] transition-colors bg-white/70"
                  >
                    <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[430px] overflow-hidden rounded-[2rem] border-4 border-[#2E4B3F] bg-[#EDE4CB] cursor-pointer shadow-[0_30px_60px_-26px_rgba(32,38,31,0.55)]"
                  >
                    <img
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                    />
                  </button>
                  <div className="absolute bottom-0 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(32,38,31,0.45)] p-4 border border-[#E4DCC6]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C9862B] mb-0.5">El trago de la casa</p>
                        <p className="br-head text-lg font-extrabold leading-tight line-clamp-1 uppercase">{heroProduct.name}</p>
                      </div>
                      <span className="br-head text-xl font-black text-[#2E4B3F] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="absolute top-5 -right-1 md:-right-3 -rotate-3 bg-[#C9862B] text-white text-[11px] font-extrabold px-4 py-2 rounded-full shadow-lg uppercase">
                    Lo más pedido
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white/70 border-y border-[#E4DCC6]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E4DCC6]">
              {[
                { icon: Timer, title: 'Happy hour', sub: '2x1 en tragos seleccionados' },
                { icon: Music, title: 'Buena música', sub: 'Playlist en vivo los viernes' },
                { icon: Flame, title: 'Piqueos calientes', sub: 'Salen directo de la plancha' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-2xl bg-[#EDE4CB] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#2E4B3F]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-[#6D7263] leading-snug font-bold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Happy hour ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="feliz" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="relative grid md:grid-cols-2 rounded-[2rem] overflow-hidden bg-[#2E4B3F] text-[#EDE6CF] shadow-[0_34px_70px_-30px_rgba(46,75,63,0.85)]">
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#D9C48A] mb-3">Happy hour</p>
                  <p className="br-head text-6xl md:text-7xl font-black leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-[#EDE6CF]/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-[#C9862B] text-white px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#B2761F] transition-colors"
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
                      className={`px-5 py-2.5 rounded-full text-[13px] font-extrabold uppercase tracking-wide border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#20261F] text-[#EDE6CF] border-[#20261F]'
                          : 'bg-white text-[#6D7263] border-[#E4DCC6] hover:border-[#C9862B] hover:text-[#C9862B]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-[#D9C48A]' : 'text-[#B7AE93]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#2E4B3F" />
            </div>
          )}

          {/* ── Carta ── */}
          <section id="carta" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C9862B] mb-1.5">La carta</p>
                <h2 className="br-head text-3xl md:text-4xl font-black uppercase">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Tragos y piqueos' : categories.find((c) => c.id === selectedCategory)?.name || 'Carta')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B7AE93]" />
                  <input
                    type="text"
                    placeholder="Buscar tragos, piqueos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#E4DCC6] focus:outline-none focus:border-[#C9862B] placeholder:text-[#B7AE93] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#EDE4CB] hover:bg-[#E4DCC6] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#6D7263]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl bg-[#EDE4CB] mx-auto mb-5 flex items-center justify-center">
                  <Beer className="w-7 h-7 text-[#B7AE93]" />
                </div>
                <p className="br-head text-2xl font-extrabold text-[#6D7263]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Estamos enfriando las latas'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#C9862B] hover:text-[#B2761F] border-b-2 border-[#C9862B]/30 pb-0.5 transition-colors"
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
                    <div className="relative bg-white rounded-3xl p-2.5 border border-[#E4DCC6] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(46,75,63,0.55)] transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#EDE4CB]">
                        <img
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                        />
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-2 left-2 bg-[#20261F] text-[#EDE6CF] text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                            De la casa
                          </span>
                        )}
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-2 left-2 bg-[#C9862B] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="block text-center py-2 bg-[#2E4B3F]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-full">
                            Pedir
                          </span>
                        </div>
                      </div>
                      <div className="px-1.5 pt-3 pb-1.5">
                        <h3 className="br-head text-[15px] md:text-[16px] font-extrabold leading-snug line-clamp-1 uppercase">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-[14px] font-black text-[#2E4B3F]">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-[11px] text-[#B7AE93] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#2E4B3F"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#20261F] text-[#EDE6CF]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#D9C48A] mb-3">Reservas y pedidos</p>
            <h2 className="br-head text-3xl md:text-4xl font-black uppercase">Guarda tu mesa para el viernes</h2>
            <p className="mt-3 text-[#EDE6CF]/75 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Escríbenos por WhatsApp: reservas, encargos de piqueos y combos para llevar.
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
        <footer className="bg-[#1B211B] text-[#EDE6CF]/60">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="br-head text-2xl font-black uppercase text-[#EDE6CF]">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#EDE6CF]/45 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-[#D9C48A]/30 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#EDE6CF]/50 font-bold">
              <a href="#feliz" className="hover:text-white transition-colors">Happy hour</a>
              <a href="#carta" className="hover:text-white transition-colors">La carta</a>
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
