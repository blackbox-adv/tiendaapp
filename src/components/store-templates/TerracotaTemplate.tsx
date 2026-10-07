'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { ShoppingBag, Search, X, ArrowRight, MessageCircle, Hand, Leaf, Sparkles } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// TERRACOTA — Plantilla premium artesanal cálida.
// Arena, terracota y café, serif Fraunces con personalidad,
// arcos, sello girado y banda de valores del oficio.
// Ideal para ropa artesanal, accesorios hechos a mano y deco.
// ============================================================

export function TerracotaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Vi su catálogo online y quiero más información.`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FBF3EA] text-[#4A2E23] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,600&family=Karla:wght@400;500;600;700&display=swap');
        .tc-serif { font-family: 'Fraunces', Georgia, serif; }
        .tc-sans { font-family: 'Karla', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="tc-sans contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#B4552D] text-[#FBF3EA]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[10px] md:text-[11px] font-semibold tracking-[0.18em] uppercase">
            Hecho a mano · Piezas únicas{store.hasShipping ? ' · Envíos a todo el país' : ''}
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FBF3EA]/92 backdrop-blur-md border-b border-[#EBD9C6]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={28} />}
              <span className="tc-serif font-bold text-xl tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A5C4E]">
              <a href="#coleccion" className="hover:text-[#B4552D] transition-colors">Colección</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#B4552D] transition-colors">Categorías</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#B4552D] transition-colors">Ofertas</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#B4552D] text-[#FBF3EA] text-[11px] font-bold uppercase tracking-[0.14em] px-4 py-2.5 rounded-full hover:bg-[#93401F] transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir</span>
            </a>
          </div>
        </nav>

        {/* ── Hero artesano ── */}
        <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-12">
          <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#EEF0E4] text-[#5F6F52] text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-6">
                <Hand className="w-3.5 h-3.5" /> Hecho a mano, edición limitada
              </span>
              <h1 className="tc-serif text-5xl md:text-[3.4rem] leading-[1.02] font-bold">
                Hecho a mano,<br />
                <span className="italic text-[#B4552D]">pensado para ti.</span>
              </h1>
              <p className="tc-serif italic text-xl text-[#7A5C4E] mt-4">{store.name}</p>
              {store.description && (
                <p className="mt-4 text-[#7A5C4E] text-[15px] leading-relaxed max-w-md">{store.description}</p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#coleccion"
                  className="inline-flex items-center gap-2 bg-[#B4552D] text-[#FBF3EA] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#93401F] transition-colors shadow-[0_14px_30px_-12px_rgba(180,85,45,0.55)]"
                >
                  Ver colección <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-[#4A2E23]/25 text-[#4A2E23] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#B4552D] hover:text-[#B4552D] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Pedir por WhatsApp
                </a>
              </div>
            </div>
            {heroProduct && (
              <div className="relative pb-12 md:pb-14">
                <button
                  onClick={() => openProduct(heroProduct.id)}
                  className="group relative block w-full aspect-[4/5] max-h-[480px] overflow-hidden rounded-t-[10rem] md:rounded-t-[12rem] rounded-b-2xl bg-[#F3E3D0] cursor-pointer"
                >
                  <img loading="lazy" decoding="async"
                    src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={heroProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                </button>
                <span className="absolute top-6 -left-1 md:-left-6 rotate-[-8deg] bg-[#5F6F52] text-[#FBF3EA] text-[9px] font-bold uppercase tracking-[0.25em] px-3.5 py-2 rounded-full shadow-lg">
                  100% artesanal
                </span>
                {secondProduct && (
                  <button
                    onClick={() => openProduct(secondProduct.id)}
                    className="group absolute bottom-0 right-0 md:-right-3 w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-[#FBF3EA] shadow-xl cursor-pointer"
                  >
                    <img loading="lazy" decoding="async"
                      src={secondProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={secondProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={secondProduct.name} price={secondProduct.price} productId={secondProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores del oficio ── */}
          <section className="border-y border-[#EBD9C6] bg-white/60">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EBD9C6]">
              {[
                { icon: Hand, title: 'Manos peruanas', sub: 'Cada pieza sale de un taller real' },
                { icon: Leaf, title: 'Materiales naturales', sub: 'Alpaca, algodón, arcilla y madera' },
                { icon: Sparkles, title: 'Piezas únicas', sub: 'Ninguna es igual a otra' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-10 h-10 rounded-full bg-[#F3E3D0] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#B4552D]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold">{v.title}</p>
                    <p className="text-[11px] text-[#7A5C4E] leading-snug">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Categorías: pastillas cálidas ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-12 scroll-mt-28">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#B4552D] mb-1.5">Colecciones</p>
                  <h2 className="tc-serif text-3xl md:text-4xl font-bold">Explora por línea</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-[0.12em] border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#B4552D] text-[#FBF3EA] border-[#B4552D] shadow-[0_10px_24px_-10px_rgba(180,85,45,0.6)]'
                          : 'bg-white/70 text-[#7A5C4E] border-[#EBD9C6] hover:border-[#B4552D] hover:text-[#B4552D]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 ${active ? 'text-[#F3D9C4]' : 'text-[#C9A98F]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Oferta del mes ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 rounded-3xl overflow-hidden bg-gradient-to-br from-[#B4552D] to-[#8A3E1D] text-[#FBF3EA] shadow-[0_30px_70px_-30px_rgba(138,62,29,0.6)]"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F3D9C4] mb-3">Oferta del mes</p>
                  <p className="tc-serif text-5xl md:text-6xl font-black">-{dealPct}<span className="text-3xl align-top">%</span></p>
                  <p className="mt-4 text-[#F7E6D4] text-sm leading-relaxed max-w-xs line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-[#FBF3EA] text-[#8A3E1D] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full hover:bg-white transition-colors"
                  >
                    Aprovechar <ArrowRight className="w-3.5 h-3.5" />
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
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#B4552D" />
            </div>
          )}

          {/* ── Colección ── */}
          <section id="coleccion" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#B4552D] mb-1.5">Catálogo</p>
                <h2 className="tc-serif text-3xl md:text-4xl font-bold">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Lo más querido' : categories.find((c) => c.id === selectedCategory)?.name || 'Colección')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C9A98F]" />
                  <input
                    type="text"
                    placeholder="Buscar pieza..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#EBD9C6] focus:outline-none focus:border-[#B4552D] placeholder:text-[#C9A98F] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F3E3D0] hover:bg-[#EBD9C6] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#7A5C4E]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-full bg-[#F3E3D0] mx-auto mb-5 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-[#C9A98F]" />
                </div>
                <p className="tc-serif text-2xl text-[#7A5C4E]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Todavía no hay piezas en esta línea'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#B4552D] hover:text-[#8A3E1D] border-b-2 border-[#B4552D]/30 pb-0.5 transition-colors"
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
                      <div className="relative bg-white rounded-2xl p-2.5 border border-[#EBD9C6] group-hover:-translate-y-1 group-hover:shadow-[0_24px_40px_-24px_rgba(74,46,35,0.4)] transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F3E3D0]">
                          <img loading="lazy" decoding="async"
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-2 left-2 bg-[#5F6F52] text-[#FBF3EA] text-[8px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-full">
                              Hecho a mano
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-2 left-2 bg-[#B4552D] text-[#FBF3EA] text-[9px] font-bold tracking-widest px-2 py-1 rounded-full">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2 bg-[#4A2E23]/90 backdrop-blur-sm text-[#FBF3EA] text-[9px] font-bold uppercase tracking-[0.2em] rounded-full">
                              Ver pieza
                            </span>
                          </div>
                        </div>
                        <div className="px-1.5 pt-3 pb-1.5">
                          <h3 className="tc-serif text-[15px] md:text-base leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-bold text-[#B4552D]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#C9A98F] line-through">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#B4552D"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#4A2E23] text-[#FBF3EA]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E8B48C] mb-3">Trato directo, sin intermediarios</p>
            <h2 className="tc-serif text-3xl md:text-4xl font-bold">Escríbenos y aparta tu pieza</h2>
            <p className="mt-3 text-[#E8D5C4]/80 text-sm max-w-md mx-auto leading-relaxed">
              Respondemos por WhatsApp con fotos reales, medidas y el costo de envío a tu zona.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:brightness-95 transition-all shadow-lg"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-[#3B271E] text-[#E8D5C4]/70">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={30} />}
            <p className="tc-serif text-2xl font-bold text-[#FBF3EA]">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#E8D5C4]/50 max-w-sm leading-relaxed">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#E8D5C4]/50">
              <a href="#coleccion" className="hover:text-white transition-colors">Colección</a>
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
