'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, ChefHat, Flame, Clock, Leaf } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// MESA — Plantilla premium para restaurantes y cocina de autor.
// Clara y elegante: crema, terracota y tinta, serif editorial
// (Playfair Display). Menú del día, plato estrella y carta por
// secciones. Ideal para restaurantes, menús caseros y delivery.
// ============================================================

const IMG_FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f6ead9" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🍽️</text></svg>'

export function MesaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero hacer un pedido / reserva, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FBF6EE] text-[#33261C] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .ms-serif { font-family: 'Playfair Display', Georgia, serif; }
        .ms-body { font-family: 'Work Sans', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="ms-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#33261C] text-[#F3E6D2]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-bold tracking-wide">
            Cocina de la casa{store.hasShipping ? ' · Delivery y recojo en local' : ''} · Reservas por WhatsApp
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FBF6EE]/95 backdrop-blur-md border-b border-[#EADCC6]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="ms-serif text-2xl tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-[#8A7154]">
              <a href="#menu-dia" className="hover:text-[#A34A28] transition-colors">Menú del día</a>
              <a href="#carta" className="hover:text-[#A34A28] transition-colors">La carta</a>
              {dealProduct && <a href="#promos" className="hover:text-[#A34A28] transition-colors">Promos</a>}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#A34A28] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#8C3D1F] transition-colors shadow-[0_10px_20px_-8px_rgba(163,74,40,0.7)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reservar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#F1E0C6]/70 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 -right-24 w-72 h-72 rounded-full bg-[#EBD9BE]/50 blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#F2E3CC] text-[#A34A28] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6">
                  <ChefHat className="w-3.5 h-3.5" /> Cocina casera con sazón de verdad
                </span>
                <h1 className="ms-serif text-5xl md:text-[3.4rem] leading-[1.05]">
                  Buen mesa, buena <span className="italic text-[#A34A28]">conversación.</span>
                </h1>
                <p className="ms-serif text-2xl text-[#8A7154] italic mt-4">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-[#6B563F] text-[15px] leading-relaxed max-w-md font-medium">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#carta"
                    className="inline-flex items-center gap-2 bg-[#A34A28] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#8C3D1F] transition-colors shadow-[0_16px_34px_-12px_rgba(163,74,40,0.7)]"
                  >
                    Ver la carta <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#33261C]/10 text-[#33261C] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#A34A28] hover:text-[#A34A28] transition-colors bg-white/70"
                  >
                    <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[430px] overflow-hidden rounded-[2rem] bg-[#F2E3CC] cursor-pointer shadow-[0_30px_60px_-26px_rgba(51,38,28,0.5)]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <div className="absolute bottom-0 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(51,38,28,0.45)] p-4 border border-[#EADCC6]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A34A28] mb-0.5">Plato de la casa</p>
                        <p className="ms-serif text-lg leading-tight line-clamp-1">{heroProduct.name}</p>
                      </div>
                      <span className="ms-serif text-xl text-[#A34A28] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="absolute top-5 -right-1 md:-right-3 -rotate-3 bg-[#33261C] text-[#F3E6D2] text-[11px] font-extrabold px-4 py-2 rounded-full shadow-lg">
                    Recomendado del chef
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white/70 border-y border-[#EADCC6]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EADCC6]">
              {[
                { icon: Flame, title: 'Sazón de casa', sub: 'Recetas que pasan de familia en familia' },
                { icon: Leaf, title: 'Insumos frescos', sub: 'Mercado del día, cada día' },
                { icon: Clock, title: 'Listo a la hora', sub: 'Pide y te lo tenemos puntual' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-2xl bg-[#F2E3CC] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#A34A28]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-[#8A7154] leading-snug font-bold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Menú del día ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="menu-dia" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="relative grid md:grid-cols-2 rounded-[2rem] overflow-hidden bg-white border border-[#EADCC6] shadow-[0_30px_60px_-30px_rgba(51,38,28,0.4)]">
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#A34A28] mb-3">Menú del día</p>
                  <p className="ms-serif text-4xl md:text-5xl leading-tight line-clamp-2">{dealProduct.name}</p>
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="ms-serif text-4xl text-[#A34A28]">S/{Number(dealProduct.price).toFixed(2)}</span>
                    {dealProduct.originalPrice && (
                      <span className="text-[#B9A587] line-through font-bold">S/{Number(dealProduct.originalPrice).toFixed(2)}</span>
                    )}
                    <span className="bg-[#A34A28] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full">-{dealPct}%</span>
                  </div>
                  <p className="mt-3 text-[#6B563F] text-sm leading-relaxed max-w-sm font-bold line-clamp-2">{dealProduct.description}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-[#33261C] text-[#F3E6D2] px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#4A3828] transition-colors"
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
              </div>
            </section>
          )}

          {/* ── Categorías ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="flex flex-wrap gap-2.5">
                {[{ id: 'all', name: 'Toda la carta' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-full text-[13px] font-extrabold border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#33261C] text-[#F3E6D2] border-[#33261C]'
                          : 'bg-white text-[#8A7154] border-[#EADCC6] hover:border-[#A34A28] hover:text-[#A34A28]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-[#E2C9A8]' : 'text-[#C9B394]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div id="promos" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#A34A28" />
            </div>
          )}

          {/* ── Carta ── */}
          <section id="carta" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#A34A28] mb-1.5">La carta</p>
                <h2 className="ms-serif text-3xl md:text-4xl">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Nuestros platos' : categories.find((c) => c.id === selectedCategory)?.name || 'Carta')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C9B394]" />
                  <input
                    type="text"
                    placeholder="Buscar en la carta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#EADCC6] focus:outline-none focus:border-[#A34A28] placeholder:text-[#C9B394] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F2E3CC] hover:bg-[#EADCC6] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#8A7154]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl bg-[#F2E3CC] mx-auto mb-5 flex items-center justify-center">
                  <ChefHat className="w-7 h-7 text-[#C9B394]" />
                </div>
                <p className="ms-serif text-2xl text-[#8A7154]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'El chef está preparando algo rico'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#A34A28] hover:text-[#8C3D1F] border-b-2 border-[#A34A28]/30 pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9 md:gap-x-6">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => openProduct(product.id)}
                  >
                    <div className="relative bg-white rounded-3xl p-2.5 border border-[#EADCC6] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(163,74,40,0.5)] transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F2E3CC]">
                        <img loading="lazy" decoding="async"
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK }}
                        />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-2 left-2 bg-[#33261C] text-[#F3E6D2] text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                            Del chef
                          </span>
                        )}
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-2 left-2 bg-[#A34A28] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="block text-center py-2 bg-[#A34A28]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-full">
                            Pedir
                          </span>
                        </div>
                      </div>
                      <div className="px-1.5 pt-3 pb-1.5">
                        <h3 className="ms-serif text-[16px] md:text-[17px] leading-snug line-clamp-1">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-[14px] font-extrabold text-[#A34A28]">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-[11px] text-[#C9B394] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#A34A28"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#33261C] text-[#F3E6D2]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#E2C9A8] mb-3">Reservas y pedidos</p>
            <h2 className="ms-serif text-3xl md:text-4xl">Aparta tu mesa o pide delivery sin vueltas</h2>
            <p className="mt-3 text-[#F3E6D2]/75 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Escríbenos por WhatsApp y guardamos tu mesa o preparamos tu pedido para la hora que quieras.
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
        <footer className="bg-[#291E15] text-[#F3E6D2]/60">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="ms-serif text-2xl text-[#F3E6D2]">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#F3E6D2]/45 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-[#E2C9A8]/30 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#F3E6D2]/50 font-bold">
              <a href="#menu-dia" className="hover:text-white transition-colors">Menú del día</a>
              <a href="#carta" className="hover:text-white transition-colors">La carta</a>
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
