'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Coffee, Wheat, Flame, Clock } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// GRANO — Plantilla premium para cafeterías y panadería
// artesanal. Crema, espresso y caramelo, serif editorial
// (DM Serif Display) y una "carta" con líneas punteadas.
// Ideal para café de especialidad, pan artesanal y deli.
// ============================================================

export function GranoTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const menuItems = useMemo(() => products.slice(0, 5), [products])

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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero hacer un pedido de café/pan, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FAF4EB] text-[#35261A] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .gr-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .gr-body { font-family: 'Work Sans', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="gr-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#3E2C1E] text-[#F0E2CE]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-bold tracking-wide">
            Tostado de origen{store.hasShipping ? ' · Envíos en el día' : ''} · Pan horneado cada mañana
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FAF4EB]/94 backdrop-blur-md border-b border-[#E7D7C1]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="gr-serif text-2xl tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-[#8A705A]">
              <a href="#carta" className="hover:text-[#B5793B] transition-colors">La carta</a>
              <a href="#catalogo" className="hover:text-[#B5793B] transition-colors">Catálogo</a>
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#B5793B] transition-colors">Promos</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#B5793B] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#9C6530] transition-colors shadow-[0_10px_20px_-8px_rgba(181,121,59,0.8)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir</span>
            </a>
          </div>
        </nav>

        {/* ── Hero aroma ── */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-20 -right-24 w-80 h-80 rounded-full bg-[#EAD9C2]/60 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-[#E2C9A8]/40 blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#F1E4D0] text-[#9C6530] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6">
                  <Coffee className="w-3.5 h-3.5" /> Café de especialidad y pan de masa madre
                </span>
                <h1 className="gr-serif text-5xl md:text-[3.4rem] leading-[1.05]">
                  El aroma que<br />
                  <span className="italic text-[#B5793B]">despierta tu día.</span>
                </h1>
                <p className="gr-serif text-2xl text-[#8A705A] italic mt-4">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-[#6E5B48] text-[15px] leading-relaxed max-w-md font-medium">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#carta"
                    className="inline-flex items-center gap-2 bg-[#B5793B] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#9C6530] transition-colors shadow-[0_16px_34px_-12px_rgba(181,121,59,0.8)]"
                  >
                    Ver la carta <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#35261A]/12 text-[#35261A] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#B5793B] hover:text-[#B5793B] transition-colors bg-white/70"
                  >
                    <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[430px] overflow-hidden rounded-[2rem] bg-[#F1E4D0] cursor-pointer shadow-[0_30px_60px_-26px_rgba(62,44,30,0.5)]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <div className="absolute bottom-0 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(62,44,30,0.45)] p-4 border border-[#E7D7C1]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B5793B] mb-0.5">Taza de la casa</p>
                        <p className="gr-serif text-lg leading-tight line-clamp-1">{heroProduct.name}</p>
                      </div>
                      <span className="gr-serif text-xl text-[#B5793B] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="absolute top-5 -right-1 md:-right-3 rotate-6 bg-[#3E2C1E] text-[#F0E2CE] text-[11px] font-extrabold px-4 py-2 rounded-full shadow-lg">
                    Tostado de la semana
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white/70 border-y border-[#E7D7C1]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E7D7C1]">
              {[
                { icon: Coffee, title: 'Tueste propio', sub: 'Origen y fecha en cada bolsa' },
                { icon: Wheat, title: 'Pan del día', sub: 'Masa madre, sin apuros' },
                { icon: Clock, title: 'Pedidos anticipados', sub: 'Aparta y recoge sin filas' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-2xl bg-[#F1E4D0] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#B5793B]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-[#8A705A] leading-snug font-bold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── La carta: líneas punteadas estilo menú ── */}
          <section id="carta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-14 items-start">
              <div className="md:sticky md:top-24">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#B5793B] mb-1.5">Directo del mostrador</p>
                <h2 className="gr-serif text-3xl md:text-4xl">La carta de la casa</h2>
                <p className="mt-4 text-[#6E5B48] text-sm leading-relaxed font-medium max-w-sm">
                  Lo que siempre sale rico: nuestros granos, panes y preparados más pedidos. Toca cualquiera para ver el detalle y pedirlo.
                </p>
                <a
                  href="#catalogo"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#B5793B] hover:text-[#9C6530] transition-colors"
                >
                  Ver catálogo completo <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="bg-white rounded-[2rem] border border-[#E7D7C1] shadow-[0_20px_44px_-26px_rgba(62,44,30,0.4)] p-6 md:p-8">
                {menuItems.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => openProduct(p.id)}
                    className={`group w-full text-left py-4 cursor-pointer ${idx < menuItems.length - 1 ? 'border-b border-dashed border-[#D9C5A8]' : ''}`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="gr-serif text-lg md:text-xl leading-snug group-hover:text-[#B5793B] transition-colors line-clamp-1">{p.name}</span>
                      <span className="flex-1 border-b-2 border-dotted border-[#D9C5A8] min-w-6 -translate-y-1" />
                      <span className="gr-serif text-xl text-[#B5793B] shrink-0">S/{Number(p.price).toFixed(2)}</span>
                    </div>
                    <p className="text-[12px] text-[#8A705A] font-medium line-clamp-1 mt-1">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

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
                          ? 'bg-[#3E2C1E] text-[#F0E2CE] border-[#3E2C1E]'
                          : 'bg-white text-[#8A705A] border-[#E7D7C1] hover:border-[#B5793B] hover:text-[#B5793B]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-[#D9C5A8]' : 'text-[#C9B394]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Promo del mes ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#3E2C1E] to-[#6E4B2F] text-white shadow-[0_34px_70px_-30px_rgba(62,44,30,0.8)]"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#E2C9A8] mb-3">Combo de la casa</p>
                  <p className="gr-serif text-6xl md:text-7xl leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-white text-[#3E2C1E] px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#F1E4D0] transition-colors"
                  >
                    Lo quiero <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden cursor-pointer order-1 md:order-2">
                  <img loading="lazy" decoding="async"
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                    <ShareProductButton productName={dealProduct.name} price={dealProduct.price} productId={dealProduct.id} slug={storeSlug} storeName={store.name} />
                </button>
                <Flame className="absolute -bottom-6 -left-6 w-28 h-28 text-white/10 pointer-events-none" />
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#B5793B" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#B5793B] mb-1.5">Catálogo</p>
                <h2 className="gr-serif text-3xl md:text-4xl">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Los favoritos' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
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
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#E7D7C1] focus:outline-none focus:border-[#B5793B] placeholder:text-[#C9B394] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F1E4D0] hover:bg-[#E7D7C1] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#8A705A]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl bg-[#F1E4D0] mx-auto mb-5 flex items-center justify-center">
                  <Coffee className="w-7 h-7 text-[#C9B394]" />
                </div>
                <p className="gr-serif text-2xl text-[#8A705A]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'La cafetera se está calentando aún'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#B5793B] hover:text-[#9C6530] border-b-2 border-[#B5793B]/30 pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-9 md:gap-x-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, i) => (
                    <motion.article
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                      className="group cursor-pointer"
                      onClick={() => openProduct(product.id)}
                    >
                      <div className="relative bg-white rounded-3xl p-2.5 border border-[#E7D7C1] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(181,121,59,0.6)] transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F1E4D0]">
                          <img loading="lazy" decoding="async"
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-2 left-2 bg-[#3E2C1E] text-[#F0E2CE] text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                              Favorito
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-2 left-2 bg-[#B5793B] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2 bg-[#B5793B]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-full">
                              Pedir
                            </span>
                          </div>
                        </div>
                        <div className="px-1.5 pt-3 pb-1.5">
                          <h3 className="gr-serif text-[16px] md:text-[17px] leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-[14px] font-extrabold text-[#B5793B]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#C9B394] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-14 flex justify-center">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="light"
                primaryColor="#B5793B"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#3E2C1E] text-[#F0E2CE]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#E2C9A8] mb-3">Pedidos y encargos</p>
            <h2 className="gr-serif text-3xl md:text-4xl">Aparta tu café o tu pan y recoge sin filas</h2>
            <p className="mt-3 text-[#F0E2CE]/75 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Escríbenos por WhatsApp con tu pedido y lo tenemos listo a la hora que nos indiques.
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
        <footer className="bg-[#2E2015] text-[#F0E2CE]/60">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="gr-serif text-2xl text-[#F0E2CE]">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#F0E2CE]/45 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-[#E2C9A8]/30 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#F0E2CE]/50 font-bold">
              <a href="#carta" className="hover:text-white transition-colors">La carta</a>
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
