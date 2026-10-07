'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Gem, Truck, ShieldCheck, Sparkles } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// AURA — Plantilla premium para joyerías y accesorios finos.
// Champán y oro, serif editorial Cormorant Garamond, líneas
// finas doradas y mucho aire. Piezas que se sienten de marca.
// Ideal para joyería, relojes, bolsos y accesorios de gala.
// ============================================================

export function AuraTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Me encantó una pieza de su colección, ¿me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#33291C] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
        .au-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .au-body { font-family: 'Jost', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="au-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#211A10] text-[#E8D9BC]">
          <div className="max-w-6xl mx-auto px-6 py-2.5 text-center text-[10px] md:text-[11px] tracking-[0.28em] uppercase font-medium">
            Piezas originales{store.hasShipping ? ' · Envíos asegurados' : ''} · Pagos con Yape y Plin
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FAF7F0]/94 backdrop-blur-md border-b border-[#E4D9C3]">
          <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="au-serif text-2xl tracking-[0.18em] uppercase truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[12px] tracking-[0.2em] uppercase text-[#8A7B62]">
              <a href="#coleccion" className="hover:text-[#B08D57] transition-colors">Colección</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#B08D57] transition-colors">Piezas</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#B08D57] transition-colors">Edición especial</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#B08D57] text-[#B08D57] text-[11px] tracking-[0.18em] uppercase px-5 py-2.5 hover:bg-[#B08D57] hover:text-white transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consultar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero editorial ── */}
        <section className="relative overflow-hidden">
          <div className="absolute top-1/3 -right-40 w-[26rem] h-[26rem] rounded-full bg-[#EFE3C8]/50 blur-3xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-14 md:pt-20 pb-16">
            <div className="grid md:grid-cols-2 gap-14 md:gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-medium mb-7">
                  <span className="inline-block h-px w-8 bg-[#B08D57]" /> Colección de temporada
                </span>
                <h1 className="au-serif text-5xl md:text-6xl leading-[1.05] font-medium">
                  Piezas que<br />
                  <span className="italic text-[#B08D57]">cuentan historias.</span>
                </h1>
                <p className="au-serif text-2xl text-[#8A7B62] italic mt-5">{store.name}</p>
                {store.description && (
                  <p className="mt-5 text-[#6B5F4C] text-[15px] leading-relaxed max-w-md font-light">
                    {store.description}
                  </p>
                )}
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <a
                    href="#coleccion"
                    className="inline-flex items-center gap-2 bg-[#211A10] text-[#E8D9BC] px-9 py-4 text-[12px] tracking-[0.2em] uppercase hover:bg-[#B08D57] hover:text-white transition-colors"
                  >
                    Ver colección <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-b border-[#B08D57] text-[#8A6B3F] px-1 pb-1 text-[12px] tracking-[0.18em] uppercase hover:text-[#B08D57] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Asesoría por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <div className="absolute -top-4 -right-4 w-full h-full border border-[#B08D57]/50 pointer-events-none" />
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/5] max-h-[480px] overflow-hidden bg-[#EFE6D4] cursor-pointer"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <span className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-5 py-2 text-[10px] tracking-[0.25em] uppercase text-[#8A6B3F] font-medium shadow-sm">
                    Pieza destacada
                  </span>
                  {secondProduct && (
                    <a
                      href="#coleccion"
                      className="absolute -bottom-2 right-4 bg-white/95 backdrop-blur-sm px-5 py-3 text-[10px] tracking-[0.2em] uppercase text-[#6B5F4C] shadow-md border border-[#E4D9C3] hover:text-[#B08D57] transition-colors"
                    >
                      + {products.length - 1} piezas más
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Valores ── */}
          <section className="border-y border-[#E4D9C3] bg-white/60">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E4D9C3]">
              {[
                { icon: Gem, title: 'Piezas seleccionadas', sub: 'Materiales verificados' },
                { icon: Truck, title: 'Envío asegurado', sub: 'Llega como en la foto' },
                { icon: ShieldCheck, title: 'Compra protegida', sub: 'Yape, Plin y contra entrega' },
              ].map((v) => (
                <div key={v.title} className="flex items-center justify-center gap-4 py-6 px-2 text-center sm:text-left">
                  <v.icon className="w-5 h-5 text-[#B08D57] shrink-0" />
                  <div>
                    <p className="text-[12px] tracking-[0.14em] uppercase font-medium">{v.title}</p>
                    <p className="text-[11px] text-[#A2937A] font-light">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Categorías ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <div className="flex items-end justify-between mb-7">
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-medium">Por tipo de pieza</p>
              </div>
              <div className="flex flex-wrap gap-x-7 gap-y-3">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`relative pb-1.5 text-[13px] tracking-[0.16em] uppercase transition-colors duration-300 ${
                        active ? 'text-[#211A10]' : 'text-[#A2937A] hover:text-[#8A6B3F]'
                      }`}
                    >
                      {cat.name} <span className="text-[10px] text-[#C9BCA3]">· {countFor(cat.id)}</span>
                      <span className={`absolute bottom-0 left-0 h-px bg-[#B08D57] transition-all duration-300 ${active ? 'w-full' : 'w-0'}`} />
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Edición especial (oferta) ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-16 scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 bg-[#211A10] text-[#F0E6D0] overflow-hidden"
              >
                <div className="flex flex-col justify-center items-start p-9 md:p-14 order-2 md:order-1">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96A] mb-4">Edición especial</p>
                  <p className="au-serif text-6xl md:text-7xl font-medium leading-none">-{dealPct}<span className="text-3xl align-top italic">%</span></p>
                  <p className="au-serif italic text-xl text-[#C9BCA3] mt-4 line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-8 inline-flex items-center gap-2 border border-[#C9A96A] text-[#C9A96A] px-7 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-[#C9A96A] hover:text-[#211A10] transition-colors"
                  >
                    Ver pieza <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/10] md:aspect-auto md:min-h-[340px] overflow-hidden cursor-pointer order-1 md:order-2">
                  <img loading="lazy" decoding="async"
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                    <ShareProductButton productName={dealProduct.name} price={dealProduct.price} productId={dealProduct.id} slug={storeSlug} storeName={store.name} />
                </button>
                <Sparkles className="absolute top-6 right-6 w-5 h-5 text-[#C9A96A]/60 pointer-events-none" />
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-16">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#B08D57" />
            </div>
          )}

          {/* ── Colección ── */}
          <section id="coleccion" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-medium mb-2">La colección</p>
                <h2 className="au-serif text-4xl md:text-5xl font-medium">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Piezas favoritas' : categories.find((c) => c.id === selectedCategory)?.name || 'Colección')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C9BCA3]" />
                  <input
                    type="text"
                    placeholder="Buscar pieza..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white border border-[#E4D9C3] focus:outline-none focus:border-[#B08D57] placeholder:text-[#C9BCA3] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F1EADA] hover:bg-[#E4D9C3] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#8A7B62]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <Gem className="w-8 h-8 text-[#C9BCA3] mx-auto mb-5" strokeWidth={1.5} />
                <p className="au-serif text-2xl text-[#8A7B62] italic">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Esta colección se está curando aún'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-[11px] tracking-[0.18em] uppercase text-[#B08D57] hover:text-[#8A6B3F] border-b border-[#B08D57]/40 pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12 md:gap-x-7">
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
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#EFE6D4]">
                        <img loading="lazy" decoding="async"
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                        />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-3 left-3 bg-[#211A10] text-[#E8D9BC] text-[10px] tracking-[0.14em] px-2.5 py-1">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-3 left-3 bg-white/95 text-[#8A6B3F] text-[10px] tracking-[0.14em] px-2.5 py-1 uppercase">
                            Destacada
                          </span>
                        )}
                      </div>
                      <div className="pt-4">
                        <h3 className="au-serif text-lg font-medium leading-snug line-clamp-1">{product.name}</h3>
                        <div className="flex items-baseline gap-2.5 mt-1">
                          <span className="text-[14px] font-medium text-[#B08D57]">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-[11px] text-[#C9BCA3] line-through font-light">S/{Number(product.originalPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-16 flex justify-center">
              <StoreFeatureBadges
                hasShipping={store.hasShipping}
                hasSecurePayment={store.hasSecurePayment}
                hasReturns={store.hasReturns}
                variant="light"
                primaryColor="#B08D57"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#211A10] text-[#F0E6D0]">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <span className="inline-block h-px w-12 bg-[#C9A96A] mb-6" />
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96A] mb-4">Asesoría personalizada</p>
            <h2 className="au-serif text-3xl md:text-5xl font-medium">Cuéntanos para qué ocasión<br className="hidden md:block" /> y te sugerimos la pieza.</h2>
            <p className="mt-5 text-[#C9BCA3] text-sm max-w-md mx-auto leading-relaxed font-light">
              Respondemos por WhatsApp con fotos reales del día y opciones según tu presupuesto.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 border border-[#C9A96A] text-[#C9A96A] px-9 py-4 text-[12px] tracking-[0.2em] uppercase hover:bg-[#C9A96A] hover:text-[#211A10] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-[#16110A] text-[#C9BCA3]/70">
          <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="au-serif text-2xl tracking-[0.18em] uppercase text-[#F0E6D0]">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#C9BCA3]/50 max-w-sm leading-relaxed font-light">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-[#C9A96A]/30 my-2" />
            <div className="flex items-center gap-7 text-[10px] uppercase tracking-[0.24em] text-[#C9BCA3]/50 font-medium">
              <a href="#coleccion" className="hover:text-white transition-colors">Colección</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-white transition-colors">Piezas</a>
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
