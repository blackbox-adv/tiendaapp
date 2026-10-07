'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Dumbbell, Zap, PackageCheck, Star } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// VOLT — Plantilla premium para deportes, fitness y suplementos.
// Azul marino profundo con naranja eléctrico, tipografía
// condensada en mayúsculas (Anton) y energía de gimnasio.
// Ideal para indumentaria deportiva, accesorios y suplementos.
// ============================================================

export function VoltTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero equiparme, me ayudan con un pedido?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-white text-[#141A2B] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');
        .vt-display { font-family: 'Anton', 'Arial Narrow', sans-serif; letter-spacing: 0.01em; }
        .vt-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="vt-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#FF5A1F] text-white">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-extrabold uppercase tracking-[0.14em]">
            Envío 24h en la ciudad · Cambia tu talla sin costo · Pide por WhatsApp
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-[#141A2B]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="vt-display text-2xl uppercase truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[12px] font-extrabold uppercase tracking-wide text-[#5A6178]">
              <a href="#catalogo" className="hover:text-[#FF5A1F] transition-colors">Catálogo</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#FF5A1F] transition-colors">Categorías</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#FF5A1F] transition-colors">Ofertas</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#141A2B] text-white text-xs font-extrabold uppercase px-4 py-2.5 hover:bg-[#FF5A1F] transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir ya</span>
            </a>
          </div>
        </nav>

        {/* ── Hero de energía ── */}
        <section className="relative bg-[#0E1A38] text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-90 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#FF5A1F] rotate-12" />
            <div className="absolute bottom-6 right-40 w-40 h-40 bg-[#FF5A1F]/40 -rotate-6" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 pt-14 md:pt-20 pb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#FF5A1F] text-white text-[11px] font-extrabold uppercase tracking-[0.16em] px-4 py-2 mb-7">
                  <Zap className="w-3.5 h-3.5" /> Stock real · Sin humo
                </span>
                <h1 className="vt-display text-6xl md:text-7xl leading-[0.95] uppercase">
                  Entrena<br />duro.<br />
                  <span className="text-[#FF5A1F]">Viste</span><br />más duro.
                </h1>
                <p className="mt-6 text-white/75 text-[15px] leading-relaxed max-w-md font-medium">
                  {store.description || 'Todo para tu entrenamiento en un solo lugar: indumentaria, accesorios y suplementos con envío rápido.'}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 bg-[#FF5A1F] text-white px-8 py-4 text-sm font-extrabold uppercase tracking-wide hover:brightness-110 transition-all shadow-[0_18px_36px_-14px_rgba(255,90,31,0.8)]"
                  >
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
                  </a>
                </div>
                {/* Stats */}
                <div className="mt-10 grid grid-cols-3 max-w-md divide-x divide-white/15">
                  {[
                    { n: `${products.length}+`, l: 'Productos' },
                    { n: '24h', l: 'Envío' },
                    { n: '4.9', l: 'Valoración', star: true },
                  ].map((s) => (
                    <div key={s.l} className="px-4 first:pl-0">
                      <p className="vt-display text-3xl md:text-4xl text-white flex items-center gap-1.5">
                        {s.n}{s.star && <Star className="w-4 h-4 text-[#FF5A1F] fill-[#FF5A1F]" />}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-extrabold mt-1">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              {heroProduct && (
                <div className="relative md:pl-6">
                  <div className="absolute top-6 -left-2 w-full h-full bg-[#FF5A1F] pointer-events-none" />
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] overflow-hidden bg-[#16224A] cursor-pointer border-2 border-white/10"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 md:right-auto md:w-3/4 bg-[#141A2B] border-2 border-white/10 px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#FF5A1F]">El más pedido</p>
                      <button onClick={() => openProduct(heroProduct.id)} className="text-[14px] font-extrabold truncate max-w-full text-left cursor-pointer hover:text-[#FF5A1F] transition-colors">
                        {heroProduct.name}
                      </button>
                    </div>
                    <span className="vt-display text-2xl text-[#FF5A1F] shrink-0">S/{Number(heroProduct.price).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de garantías ── */}
          <section className="border-b-2 border-[#141A2B] bg-[#F4F5F8]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-2 divide-[#141A2B]/10">
              {[
                { icon: PackageCheck, title: 'Stock verificado', sub: 'Lo que ves, está' },
                { icon: Zap, title: 'Envío en 24h', sub: 'Pedidos antes de 6pm' },
                { icon: Dumbbell, title: 'Calidad probada', sub: 'Marcas y materiales reales' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 bg-[#141A2B] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#FF5A1F]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold uppercase">{v.title}</p>
                    <p className="text-[11px] text-[#5A6178] leading-snug font-bold">{v.sub}</p>
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
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#FF5A1F] mb-1.5">Elige tu zona</p>
                  <h2 className="vt-display text-3xl md:text-4xl uppercase">Equípate por categoría</h2>
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
                          ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-[0_12px_26px_-10px_rgba(255,90,31,0.8)]'
                          : 'bg-white text-[#5A6178] border-[#E2E4EA] hover:border-[#FF5A1F] hover:text-[#FF5A1F]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 ${active ? 'text-white/80' : 'text-[#B4B9C7]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Oferta quema ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 bg-[#FF5A1F] text-white overflow-hidden"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/85 mb-3">Oferta de la semana</p>
                  <p className="vt-display text-7xl md:text-8xl leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-[#141A2B] text-white px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide hover:bg-black transition-colors"
                  >
                    Aprovechar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden cursor-pointer order-1 md:order-2">
                  <img loading="lazy" decoding="async"
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 mix-blend-luminosity"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                    <ShareProductButton productName={dealProduct.name} price={dealProduct.price} productId={dealProduct.id} slug={storeSlug} storeName={store.name} />
                  <div className="absolute inset-0 bg-[#FF5A1F]/30" />
                </button>
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#FF5A1F" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#FF5A1F] mb-1.5">Catálogo</p>
                <h2 className="vt-display text-3xl md:text-4xl uppercase">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Los más pedidos' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B4B9C7]" />
                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white border-2 border-[#E2E4EA] focus:outline-none focus:border-[#FF5A1F] placeholder:text-[#B4B9C7] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#F4F5F8] hover:bg-[#E2E4EA] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#5A6178]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-[#F4F5F8] border-2 border-[#E2E4EA] mx-auto mb-5 flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 text-[#B4B9C7]" />
                </div>
                <p className="vt-display text-2xl uppercase text-[#5A6178]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Esta sección se está equipando'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold uppercase text-[#FF5A1F] hover:brightness-110 border-b-2 border-[#FF5A1F] pb-0.5 transition-all"
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
                      <div className="relative bg-white border-2 border-[#E9EBF0] group-hover:border-[#141A2B] group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_40px_-22px_rgba(20,26,43,0.5)] transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden bg-[#F4F5F8]">
                          <img loading="lazy" decoding="async"
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-0 left-0 bg-[#141A2B] text-white text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5">
                              Top
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-0 right-0 bg-[#FF5A1F] text-white text-[11px] font-extrabold px-2.5 py-1.5">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2.5 bg-[#FF5A1F]/95 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase tracking-wider">
                              Pedir ya
                            </span>
                          </div>
                        </div>
                        <div className="px-3 pt-3 pb-3.5">
                          <h3 className="text-[14px] md:text-[15px] font-extrabold uppercase leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="vt-display text-xl text-[#FF5A1F]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#B4B9C7] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#FF5A1F"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#FF5A1F] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-white/85 mb-3">Sin excusas</p>
            <h2 className="vt-display text-4xl md:text-6xl uppercase leading-none">Pide hoy.<br className="md:hidden" /> Recibe mañana.</h2>
            <p className="mt-5 text-white/85 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Escríbenos por WhatsApp, confirmamos stock al instante y coordinamos el envío.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[#141A2B] text-white px-9 py-4 text-sm font-extrabold uppercase tracking-wide hover:bg-black transition-colors shadow-xl"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-[#0E1A38] text-white/70">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="vt-display text-2xl uppercase text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-white/50 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-0.5 w-10 bg-[#FF5A1F] my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/50 font-extrabold">
              <a href="#catalogo" className="hover:text-white transition-colors">Catálogo</a>
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
