'use client'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowUpRight, MessageCircle, Zap, Truck, Clock, Flame } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// CALLE — Plantilla premium streetwear / urbano.
// Negro carbón + lima ácido, tipografía display gigante (Archivo
// Black), bordes rectos, cinta marquee, drops limitados.
// Ideal para polos estampados, sneakers, gorras y moda urbana.
// ============================================================

export function CalleTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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
  const secondProduct = useMemo(
    () => products.filter((p) => p.id !== heroProduct?.id)[0] || null,
    [products, heroProduct]
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Vi el drop online y quiero encargar.`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  const tickerItems = [
    'NUEVO DROP DISPONIBLE',
    store.hasShipping ? 'ENVÍOS A TODO EL PERÚ' : 'RECOJO EN TIENDA',
    'PAGA CON YAPE / PLIN',
    'STOCK REAL, SIN HUMO',
  ]

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F4] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .cl-display { font-family: 'Archivo Black', 'Arial Black', sans-serif; }
        .cl-body { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; }
        @keyframes cl-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .cl-ticker { animation: cl-marquee 24s linear infinite; }
      `}</style>
      <div className="cl-body contents">
        {/* ── Cinta marquee ── */}
        <div className="bg-[#D9FF3F] text-black overflow-hidden border-b-2 border-black">
          <div className="flex whitespace-nowrap py-2 cl-ticker w-max">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0">
                {tickerItems.concat(tickerItems).map((t, i) => (
                  <span key={`${dup}-${i}`} className="inline-flex items-center gap-3 px-6 text-[11px] font-bold tracking-[0.18em] uppercase">
                    {t} <Zap className="w-3 h-3 inline" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#0B0B0C]/95 backdrop-blur-md border-b border-[#232326]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={28} />}
              <span className="cl-display text-lg uppercase tracking-wide truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">
              <a href="#drop" className="hover:text-[#D9FF3F] transition-colors">Drop</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#D9FF3F] transition-colors">Categorías</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#D9FF3F] transition-colors">Oferta</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#D9FF3F] text-black text-[11px] font-bold uppercase tracking-[0.14em] px-4 py-2.5 hover:bg-white transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir al WA</span>
            </a>
          </div>
        </nav>

        {/* ── Hero urbano ── */}
        <section className="border-b border-[#232326]">
          <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 border border-[#D9FF3F]/60 text-[#D9FF3F] text-[10px] font-bold uppercase tracking-[0.28em] px-3 py-1.5 mb-6">
                <Flame className="w-3.5 h-3.5" /> Drop 001 · edición limitada
              </span>
              <h1 className="cl-display uppercase text-[3.2rem] md:text-[4.6rem] leading-[0.92] tracking-tight">
                Viste<br />
                <span className="text-[#D9FF3F]">lo tuyo.</span>
              </h1>
              <p className="mt-5 text-[#A1A1AA] text-[15px] leading-relaxed max-w-md font-medium">
                {store.description || 'Piezas urbanas en cantidades cortas. Cuando se agota, se agota.'}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#drop"
                  className="inline-flex items-center gap-2 bg-[#D9FF3F] text-black px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
                >
                  Ver el drop <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-[#2A2A2E] text-[#F5F5F4] px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] hover:border-[#D9FF3F] hover:text-[#D9FF3F] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Pedir al WhatsApp
                </a>
              </div>
              <div className="mt-9 grid grid-cols-3 divide-x divide-[#232326] border-y border-[#232326]">
                {[
                  { icon: Truck, t: 'Envío 24h' },
                  { icon: Clock, t: 'Stock real' },
                  { icon: Zap, t: 'Drops cortos' },
                ].map((s) => (
                  <div key={s.t} className="flex items-center justify-center gap-2 py-3.5">
                    <s.icon className="w-4 h-4 text-[#D9FF3F]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">{s.t}</span>
                  </div>
                ))}
              </div>
            </div>
            {heroProduct && (
              <div className="relative">
                <button
                  onClick={() => openProduct(heroProduct.id)}
                  className="group relative block w-full aspect-[4/5] max-h-[480px] overflow-hidden border-2 border-[#232326] cursor-pointer bg-[#141416]"
                >
                  <img
                    src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={heroProduct.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                    <span className="cl-display text-sm uppercase truncate">{heroProduct.name}</span>
                    <span className="text-[#D9FF3F] font-bold text-sm shrink-0 ml-3">S/{Number(heroProduct.price).toFixed(2)}</span>
                  </span>
                </button>
                {secondProduct && (
                  <button
                    onClick={() => openProduct(secondProduct.id)}
                    className="group absolute -bottom-6 -left-4 md:-left-8 w-28 h-28 md:w-36 md:h-36 overflow-hidden border-4 border-[#0B0B0C] shadow-2xl cursor-pointer bg-[#141416]"
                  >
                    <img
                      src={secondProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={secondProduct.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                  </button>
                )}
                <span className="absolute -top-3 -right-2 rotate-[4deg] bg-[#D9FF3F] text-black text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-2">
                  Sale ya
                </span>
              </div>
            )}
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Categorías: tabs duras ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-12 scroll-mt-24">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9FF3F] mb-2">Por categoría</p>
              <div className="flex flex-wrap gap-0 border border-[#232326]">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat, idx) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 md:px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] border-r border-[#232326] last:border-r-0 transition-colors ${
                        idx === 0 ? '' : ''
                      } ${active ? 'bg-[#D9FF3F] text-black' : 'bg-[#0F0F10] text-[#A1A1AA] hover:text-white hover:bg-[#141416]'}`}
                    >
                      {cat.name} <span className={active ? 'text-black/60' : 'text-[#52525B]'}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Oferta del drop ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 border-2 border-[#D9FF3F] overflow-hidden bg-[#101012]"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9FF3F] mb-3">Precio de drop · solo esta semana</p>
                  <p className="cl-display text-6xl md:text-7xl leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-[#A1A1AA] text-sm leading-relaxed max-w-xs font-medium line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-[#D9FF3F] text-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-white transition-colors"
                  >
                    Aprovechar <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden cursor-pointer order-1 md:order-2">
                  <img
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                </button>
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#D9FF3F" />
            </div>
          )}

          {/* ── Drop / catálogo ── */}
          <section id="drop" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-24">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9FF3F] mb-2">Drop actual</p>
                <h2 className="cl-display uppercase text-3xl md:text-4xl">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Todo el drop' : categories.find((c) => c.id === selectedCategory)?.name || 'Drop')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B]" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-[#0F0F10] border-2 border-[#232326] focus:outline-none focus:border-[#D9FF3F] placeholder:text-[#52525B] transition-colors font-semibold text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#1C1C1F] hover:bg-[#232326] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#A1A1AA]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 border border-[#232326]">
                <p className="cl-display uppercase text-2xl text-[#A1A1AA]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Esta categoría está vacía'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9FF3F] border-b-2 border-[#D9FF3F]/40 pb-0.5 hover:border-[#D9FF3F] transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
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
                      <div className="relative border border-[#232326] bg-[#0F0F10] group-hover:border-[#D9FF3F]/70 group-hover:-translate-y-1 transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden bg-[#141416]">
                          <img
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-2 left-2 bg-[#D9FF3F] text-black text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-1">
                              Destacado
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-2 left-2 bg-[#D9FF3F] text-black text-[10px] font-bold px-2 py-1">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2.5 bg-[#D9FF3F] text-black text-[10px] font-bold uppercase tracking-[0.2em]">
                              Ver ficha
                            </span>
                          </div>
                        </div>
                        <div className="px-3 pt-3 pb-3 border-t border-[#232326]">
                          <h3 className="text-[13px] md:text-sm font-bold uppercase tracking-wide leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="cl-display text-base text-[#D9FF3F]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#52525B] line-through font-semibold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                variant="dark"
                primaryColor="#D9FF3F"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#D9FF3F] text-black">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Trato directo, sin vueltas</p>
            <h2 className="cl-display uppercase text-3xl md:text-5xl leading-tight">Pide al WhatsApp<br />antes que se agote</h2>
            <p className="mt-4 text-black/70 text-sm max-w-md mx-auto leading-relaxed font-semibold">
              Confirmamos stock al instante, separas tu talla y coordinamos envío o recojo.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-black text-white px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#1C1C1F] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-black border-t border-[#232326] text-[#A1A1AA]">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={30} />}
            <p className="cl-display uppercase text-2xl text-white tracking-wide">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#52525B] max-w-sm leading-relaxed font-medium">{store.description}</p>
            )}
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
              <a href="#drop" className="hover:text-[#D9FF3F] transition-colors">Drop</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#D9FF3F] transition-colors">Categorías</a>
              )}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D9FF3F] transition-colors">WhatsApp</a>
            </div>
            {planId === 'free' && (
              <a href="/" className="mt-2 text-[10px] text-white/25 hover:text-white/60 transition-colors">
                Creado con TiendApp
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
