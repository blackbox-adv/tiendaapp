'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Footprints, BadgeCheck, Truck, PackageCheck } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// ZAPAS — Plantilla premium para zapatillas y sneakerheads.
// Blanco roto, tinta negra y amarillo sneaker-box, tipografía
// bloque (Archivo Black). Drops, tallas y cultura urbana.
// Ideal para zapatillas, ropa urbana y accesorios.
// ============================================================

export function ZapasTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Vi sus zapatillas, me ayudan con mi talla?`)}`
  const whatsappMsg = encodeURIComponent('Hola! Quiero hacer un pedido.')

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#121216] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&display=swap');
        .zp-display { font-family: 'Archivo Black', 'Arial Black', sans-serif; letter-spacing: -0.01em; }
        .zp-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="zp-body contents">
        {/* ── Ticker superior estilo drops ── */}
        <div className="bg-[#121216] text-[#FFD400] overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.22em]">
            Originales 100% · Cambios en 7 días · Envío 24h en la ciudad
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#F6F5F1]/95 backdrop-blur-md border-b border-[#121216]/10">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="zp-display text-2xl uppercase tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[12px] font-bold uppercase tracking-wide text-[#55555E]">
              <a href="#drops" className="hover:text-[#121216] transition-colors">Drops</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#121216] transition-colors">Categorías</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#121216] transition-colors">Ofertas</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#121216] text-white text-xs font-extrabold uppercase px-4 py-2.5 hover:bg-[#FFD400] hover:text-[#121216] transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reservar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero sneaker ── */}
        <section className="relative bg-white overflow-hidden border-b border-[#121216]/10">
          <div className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #121216 0 2px, transparent 2px 18px)' }} />
          <div className="relative max-w-6xl mx-auto px-6 pt-14 md:pt-20 pb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#FFD400] text-[#121216] text-[11px] font-extrabold uppercase tracking-[0.16em] px-4 py-2 mb-7">
                  <Footprints className="w-3.5 h-3.5" /> Drop nuevo cada semana
                </span>
                <h1 className="zp-display text-5xl md:text-6xl leading-[0.98] uppercase">
                  Tus pies<br />mercen<br />
                  <span className="text-transparent" style={{ WebkitTextStroke: '2px #121216' }}>lo</span>{' '}
                  <span className="bg-[#FFD400] px-2 inline-block -rotate-1">mejor.</span>
                </h1>
                <p className="mt-6 text-[#55555E] text-[15px] leading-relaxed max-w-md font-medium">
                  {store.description || 'Zapatillas originales, talla real y stock verificado. Reserva por WhatsApp y recoge o recibe en 24h.'}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <a
                    href="#drops"
                    className="inline-flex items-center gap-2 bg-[#121216] text-white px-8 py-4 text-sm font-extrabold uppercase tracking-wide hover:bg-[#FFD400] hover:text-[#121216] transition-all shadow-[0_18px_36px_-16px_rgba(18,18,22,0.6)]"
                  >
                    Ver drops <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#121216]/20 text-[#121216] px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide hover:border-[#121216] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
                <div className="mt-10 flex flex-wrap gap-2">
                  {['38', '39', '40', '41', '42', '43'].map((t) => (
                    <span key={t} className="zp-display text-sm border-2 border-[#121216] px-3 py-1.5 bg-white hover:bg-[#FFD400] transition-colors cursor-default">{t}</span>
                  ))}
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#9A9AA4] font-extrabold self-center ml-1">Tallas reales en stock</span>
                </div>
              </div>
              {heroProduct && (
                <div className="relative md:pl-6">
                  <div className="absolute -top-3 -right-3 w-full h-full bg-[#FFD400] pointer-events-none" />
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] overflow-hidden bg-[#EBEAE4] cursor-pointer border-2 border-[#121216]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 md:right-auto md:w-4/5 bg-[#121216] text-white px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#FFD400]">El drop de la semana</p>
                      <button onClick={() => openProduct(heroProduct.id)} className="text-[14px] font-extrabold truncate max-w-full text-left cursor-pointer hover:text-[#FFD400] transition-colors">
                        {heroProduct.name}
                      </button>
                    </div>
                    <span className="zp-display text-xl text-[#FFD400] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de garantías ── */}
          <section className="border-b border-[#121216]/10 bg-white">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#121216]/10">
              {[
                { icon: BadgeCheck, title: 'Originales 100%', sub: 'Con caja y etiqueta' },
                { icon: Truck, title: 'Envío 24h', sub: 'Lima y Callao' },
                { icon: PackageCheck, title: 'Cambio de talla', sub: '7 días sin costo' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 bg-[#FFD400] flex items-center justify-center shrink-0 border-2 border-[#121216]">
                    <v.icon className="w-5 h-5 text-[#121216]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold uppercase">{v.title}</p>
                    <p className="text-[11px] text-[#55555E] leading-snug font-semibold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Categorías ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-12 scroll-mt-28">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#55555E] mb-1.5">Encuentra tu par</p>
                  <h2 className="zp-display text-3xl md:text-4xl uppercase">Compra por estilo</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-wide border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#121216] text-white border-[#121216] shadow-[0_12px_26px_-12px_rgba(18,18,22,0.7)]'
                          : 'bg-white text-[#55555E] border-[#E4E2DA] hover:border-[#121216] hover:text-[#121216]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 ${active ? 'text-white/70' : 'text-[#B9B7AC]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Oferta drop ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 bg-[#121216] text-white overflow-hidden"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#FFD400] mb-3">Últimos pares</p>
                  <p className="zp-display text-7xl md:text-8xl leading-none text-white">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/80 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-[#FFD400] text-[#121216] px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide hover:brightness-105 transition-all"
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
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#FFD400" />
            </div>
          )}

          {/* ── Drops (catálogo) ── */}
          <section id="drops" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#55555E] mb-1.5">Catálogo</p>
                <h2 className="zp-display text-3xl md:text-4xl uppercase">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Drops disponibles' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B9B7AC]" />
                  <input
                    type="text"
                    placeholder="Buscar modelo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white border-2 border-[#E4E2DA] focus:outline-none focus:border-[#121216] placeholder:text-[#B9B7AC] transition-colors font-semibold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#F6F5F1] hover:bg-[#E4E2DA] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#55555E]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-white border-2 border-[#E4E2DA] mx-auto mb-5 flex items-center justify-center">
                  <Footprints className="w-7 h-7 text-[#B9B7AC]" />
                </div>
                <p className="zp-display text-2xl uppercase text-[#55555E]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Nuevo drop en camino'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold uppercase text-[#121216] border-b-2 border-[#FFD400] pb-0.5 transition-all hover:bg-[#FFD400]"
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
                      <div className="relative bg-white border-2 border-[#E9E7DE] group-hover:border-[#121216] group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_40px_-22px_rgba(18,18,22,0.45)] transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden bg-[#EBEAE4]">
                          <img loading="lazy" decoding="async"
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                          <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-0 left-0 bg-[#121216] text-white text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5">
                              Drop
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-0 right-0 bg-[#FFD400] text-[#121216] text-[11px] font-extrabold px-2.5 py-1.5">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2.5 bg-[#121216]/95 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase tracking-wider">
                              Reservar par
                            </span>
                          </div>
                        </div>
                        <div className="px-3 pt-3 pb-3.5">
                          <h3 className="text-[14px] md:text-[15px] font-extrabold leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="zp-display text-lg text-[#121216]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#B9B7AC] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#FFD400"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#FFD400] text-[#121216] border-t-4 border-[#121216]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] mb-3">Talla se vuela</p>
            <h2 className="zp-display text-4xl md:text-6xl uppercase leading-none">Reserva hoy.<br className="md:hidden" /> Estrena mañana.</h2>
            <p className="mt-5 text-[#121216]/80 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Escríbenos por WhatsApp, confirmamos tu talla al instante y coordinamos la entrega.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[#121216] text-white px-9 py-4 text-sm font-extrabold uppercase tracking-wide hover:bg-black transition-colors shadow-xl"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-[#121216] text-white/70">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="zp-display text-2xl uppercase text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-white/50 max-w-sm leading-relaxed font-semibold">{store.description}</p>
            )}
            <span className="inline-block h-0.5 w-10 bg-[#FFD400] my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/50 font-extrabold">
              <a href="#drops" className="hover:text-white transition-colors">Drops</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-white transition-colors">Categorías</a>
              )}
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
