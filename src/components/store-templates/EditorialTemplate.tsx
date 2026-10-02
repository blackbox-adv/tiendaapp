'use client'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { ShoppingBag, Search, X, ArrowRight, MessageCircle } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// EDITORIAL — Plantilla premium estilo catálogo de revista.
// Portada tipográfica grande, índice numerado, entradas de
// producto con folio (001, 002…) y bandas de oferta en negro.
// Referencia: catálogos impresos de moda de alta gama.
// ============================================================

export function EditorialTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Vi tu catálogo online y quiero más información.`)}`

  const folio = (i: number) => String(i + 1).padStart(3, '0')

  return (
    <div className="min-h-screen bg-white text-[#141414] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Archivo:wght@400;500;600;700&display=swap');
        .ed-serif { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; }
        .ed-sans { font-family: 'Archivo', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="ed-sans contents">
        {/* ── Cabecera de catálogo ── */}
        <div className="bg-[#141414] text-white/80">
          <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase">
            <span>Catálogo digital — N.º 01</span>
            <span className="hidden sm:inline">{store.hasShipping ? 'Envíos a todo el país' : 'Atención por WhatsApp'}</span>
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E7E2DA]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={28} />}
              <span className="ed-serif font-semibold text-lg md:text-xl tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[11px] font-medium tracking-[0.25em] uppercase text-neutral-500">
              <a href="#indice" className="hover:text-[#141414] transition-colors">Índice</a>
              <a href="#coleccion" className="hover:text-[#141414] transition-colors">Colección</a>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-[#141414] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C8102E] hover:border-[#C8102E] hover:text-white transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pedir</span>
            </a>
          </div>
        </nav>

        {/* ── Portada ── */}
        {store.bannerUrl ? (
          <section className="relative h-[72vh] min-h-[460px] max-h-[680px] overflow-hidden bg-[#141414]">
            <img src={store.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
            <div className="absolute inset-3 md:inset-5 border border-white/40 pointer-events-none" />
            <div className="relative max-w-6xl mx-auto px-6 md:px-16 h-full flex flex-col justify-end pb-14 md:pb-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1.5">Nueva temporada</span>
                <span className="text-white/70 text-[10px] uppercase tracking-[0.25em]">Edición 01</span>
              </div>
              <h1 className="ed-serif text-white text-5xl md:text-7xl leading-[0.98] font-medium max-w-3xl">{store.name}</h1>
              {store.description && (
                <p className="mt-5 text-white/80 text-sm md:text-base max-w-md font-light leading-relaxed">{store.description}</p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#coleccion" className="inline-flex items-center gap-2 bg-[#C8102E] text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#a50d26] transition-colors">
                  Ver catálogo <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/60 text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-white/10 transition-colors backdrop-blur-sm">
                  Pedir por WhatsApp
                </a>
              </div>
            </div>
          </section>
        ) : (
          <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-12">
            <div className="grid md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8102E] mb-5">Catálogo N.º 01 — Nueva temporada</p>
                <h1 className="ed-serif text-5xl md:text-6xl leading-[1.0] font-medium">{store.name}</h1>
                <div className="h-px w-16 bg-[#141414] my-6" />
                {store.description && (
                  <p className="text-neutral-500 text-sm md:text-[15px] font-light leading-relaxed max-w-sm">{store.description}</p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#coleccion" className="inline-flex items-center gap-2 bg-[#141414] text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#C8102E] transition-colors">
                    Ver catálogo <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold uppercase tracking-[0.22em] border-b border-[#141414] pb-1 hover:text-[#C8102E] hover:border-[#C8102E] transition-colors">
                    Pedir por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="md:col-span-7 relative">
                  <span className="ed-serif absolute -top-10 right-2 text-[7rem] md:text-[9rem] leading-none text-[#F0EBE3] select-none pointer-events-none font-semibold">01</span>
                  <button onClick={() => openProduct(heroProduct.id)} className="group relative block w-full bg-white border border-[#E7E2DA] p-2.5 shadow-[0_20px_60px_-20px_rgba(20,20,20,0.25)] cursor-pointer text-left">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={heroProduct.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                      />
                      <span className="absolute top-4 left-4 bg-[#C8102E] text-white text-[9px] font-bold uppercase tracking-[0.25em] px-3 py-1.5 rotate-[-2deg]">Nueva temporada</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 px-1 pb-1">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-400">Portada</p>
                        <p className="ed-serif text-base leading-snug">{heroProduct.name}</p>
                      </div>
                      <span className="ed-serif text-2xl font-semibold">S/{Number(heroProduct.price).toFixed(2)}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        <main className="flex-1 w-full">
          {/* ── Índice numerado (categorías) ── */}
          {categories.length > 0 && (
            <section id="indice" className="max-w-6xl mx-auto px-6 pt-10 scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8102E]">Índice</p>
                <div className="h-px flex-1 bg-[#E7E2DA]" />
              </div>
              <div className="flex gap-x-7 gap-y-3 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`group flex items-baseline gap-2 shrink-0 pb-1 border-b-2 transition-colors ${selectedCategory === 'all' ? 'border-[#C8102E]' : 'border-transparent hover:border-[#E7E2DA]'}`}
                >
                  <span className={`ed-serif italic text-lg ${selectedCategory === 'all' ? 'text-[#C8102E]' : 'text-neutral-300'}`}>00</span>
                  <span className={`text-[12px] uppercase tracking-[0.18em] ${selectedCategory === 'all' ? 'font-bold text-[#141414]' : 'text-neutral-500 group-hover:text-[#141414]'}`}>Todo</span>
                </button>
                {categories.map((cat, i) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`group flex items-baseline gap-2 shrink-0 pb-1 border-b-2 transition-colors ${active ? 'border-[#C8102E]' : 'border-transparent hover:border-[#E7E2DA]'}`}
                    >
                      <span className={`ed-serif italic text-lg ${active ? 'text-[#C8102E]' : 'text-neutral-300'}`}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={`text-[12px] uppercase tracking-[0.18em] whitespace-nowrap ${active ? 'font-bold text-[#141414]' : 'text-neutral-500 group-hover:text-[#141414]'}`}>{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Oferta de temporada ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="ofertas" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onClick={() => openProduct(dealProduct.id)}
                className="group relative w-full grid md:grid-cols-2 bg-[#141414] cursor-pointer text-left overflow-hidden"
              >
                <div className="aspect-[16/10] md:aspect-auto md:min-h-[320px] relative overflow-hidden">
                  <img
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                </div>
                <div className="flex flex-col justify-center items-start p-8 md:p-12 relative">
                  <span className="absolute top-0 right-0 w-16 h-16 bg-[#C8102E]" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8102E] mb-3">Oferta de temporada</p>
                  <p className="ed-serif text-5xl md:text-6xl text-white font-medium">-{dealPct}<span className="text-3xl align-top">%</span></p>
                  <p className="mt-4 text-white/75 text-sm font-light max-w-xs line-clamp-2">{dealProduct.name}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-white text-[11px] font-bold uppercase tracking-[0.22em] border-b border-white/40 pb-1 group-hover:border-[#C8102E] group-hover:text-[#C8102E] transition-colors">
                    Ver ficha <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.button>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#C8102E" />
            </div>
          )}

          {/* ── Colección (entradas de catálogo) ── */}
          <section id="coleccion" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8102E] mb-2">Colección</p>
                <h2 className="ed-serif text-3xl md:text-4xl font-medium">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Selección de la temporada' : categories.find((c) => c.id === selectedCategory)?.name || 'Colección')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar en el catálogo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-2.5 text-xs bg-transparent border border-[#E7E2DA] focus:outline-none focus:border-[#141414] placeholder:text-neutral-400 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5 text-neutral-600" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center border border-[#E7E2DA]">
                  <ShoppingBag className="w-6 h-6 text-neutral-300" />
                </div>
                <p className="ed-serif text-lg text-neutral-400">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay piezas en esta sección'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs uppercase tracking-[0.18em] text-neutral-500 hover:text-[#141414] border-b border-neutral-300 pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
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
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1EA]">
                        <img
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover saturate-[0.85] group-hover:saturate-100 group-hover:scale-[1.04] transition-all duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                        />
                        <span className="absolute top-2.5 left-3 ed-serif italic text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">{folio(i)}</span>
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-2.5 right-2.5 bg-[#C8102E] text-white text-[9px] font-bold tracking-widest px-2 py-0.5">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-2.5 right-2.5 bg-[#141414] text-white text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5">Destacado</span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <span className="block text-center py-2.5 bg-[#141414] text-white text-[10px] font-bold uppercase tracking-[0.25em]">Ver ficha +</span>
                        </div>
                      </div>
                      <div className="mt-3.5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-400 mb-1">
                          {categories.find((c) => c.id === product.categoryId)?.name || 'Pieza'}
                        </p>
                        <h3 className="ed-serif text-[16px] leading-snug">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-sm font-bold">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-xs text-neutral-400 line-through">S/{Number(product.originalPrice).toFixed(2)}</span>
                          )}
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
                primaryColor="#C8102E"
              />
            </div>
          </section>

          {/* ── Cita editorial ── */}
          <section className="border-y border-[#E7E2DA]">
            <div className="max-w-3xl mx-auto px-6 py-14 text-center">
              <p className="ed-serif italic text-2xl md:text-3xl leading-snug text-[#141414]">
                “El estilo es la forma de decir quién eres sin tener que hablar.”
              </p>
              <div className="h-px w-10 bg-[#C8102E] mx-auto mt-6" />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8102E] mb-3">Pedidos personalizados</p>
            <h2 className="ed-serif text-3xl md:text-4xl font-medium">¿Ya elegiste tu favorita?</h2>
            <p className="mt-3 text-neutral-500 text-sm font-light max-w-md mx-auto">
              Escríbenos por WhatsApp: confirmamos stock, tallas y envío al instante.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 bg-[#141414] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#C8102E] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Pedir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Colofón ── */}
        <footer className="bg-[#141414] text-white/60">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={30} />}
            <p className="ed-serif text-2xl text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-white/40 font-light max-w-sm leading-relaxed">{store.description}</p>
            )}
            <div className="h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em] text-white/40">
              <a href="#coleccion" className="hover:text-white transition-colors">Colección</a>
              {categories.length > 0 && (
                <a href="#indice" className="hover:text-white transition-colors">Índice</a>
              )}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25 mt-2">Catálogo digital — Edición 01</p>
            {planId === 'free' && (
              <a href="/" className="text-[10px] text-white/25 hover:text-white/50 transition-colors">
                Creado con TiendApp
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
