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
// ATELIER — Plantilla premium de moda femenina delicada.
// Marfil rosado, serif itálica, imágenes con arco y piezas
// superpuestas. Referencia: ateliers y marcas de novia/
// femeninas de gama alta. Ideal para ropa, belleza y joyería.
// ============================================================

export function AtelierTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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
    <div className="min-h-screen bg-[#F9F4EF] text-[#3F3236] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap');
        .at-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .at-sans { font-family: 'Jost', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="at-sans contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#F0DFD8] text-[#6E555C]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[10px] md:text-[11px] tracking-[0.2em] uppercase">
            Nuevas piezas cada semana · Atención personalizada
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#F9F4EF]/90 backdrop-blur-md border-b border-[#EADDD6]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.22em] uppercase text-[#8A7076] flex-1">
              <a href="#coleccion" className="hover:text-[#3F3236] transition-colors">Colección</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#3F3236] transition-colors">Categorías</a>
              )}
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={26} />}
              <span className="at-serif italic font-semibold text-xl md:text-2xl tracking-tight truncate">{store.name}</span>
            </div>
            <div className="flex-1 flex justify-end">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#B76E79] hover:text-[#96525C] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pedir</span>
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero atelier ── */}
        <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-12">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B76E79] mb-5">Nueva colección</p>
              <h1 className="at-serif text-5xl md:text-6xl leading-[1.02]">
                <span className="italic font-medium">{store.name}</span>
              </h1>
              <div className="flex items-center gap-3 mt-5 mb-6">
                <span className="h-px w-10 bg-[#B76E79]/50" />
                <span className="at-serif italic text-lg text-[#8A7076]">pieza a pieza, con detalle</span>
              </div>
              {store.description && (
                <p className="text-[#8A7076] text-[15px] font-light leading-relaxed max-w-sm">{store.description}</p>
              )}
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a
                  href="#coleccion"
                  className="inline-flex items-center gap-2 bg-[#B76E79] text-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.25em] rounded-full hover:bg-[#96525C] transition-colors shadow-[0_12px_30px_-12px_rgba(183,110,121,0.6)]"
                >
                  Ver colección <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium uppercase tracking-[0.22em] border-b border-[#3F3236]/30 pb-1 hover:text-[#B76E79] hover:border-[#B76E79] transition-colors">
                  Pedir por WhatsApp
                </a>
              </div>
            </div>
            {heroProduct && (
              <div className="relative pb-10">
                <div className="absolute -inset-3 border border-[#EADDD6] rounded-t-[999px] rounded-b-2xl pointer-events-none translate-x-4 translate-y-4" />
                <button onClick={() => openProduct(heroProduct.id)} className="group relative block w-full aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-2xl bg-white cursor-pointer text-left">
                  <img
                    src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={heroProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                </button>
                {secondProduct && (
                  <button
                    onClick={() => openProduct(secondProduct.id)}
                    className="group absolute bottom-0 -left-2 md:-left-8 flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-[#EADDD6] rounded-full py-2 pl-2 pr-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer text-left"
                  >
                    <span className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                      <img
                        src={secondProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={secondProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                      />
                    </span>
                    <span>
                      <span className="block text-[9px] uppercase tracking-[0.22em] text-[#B0A0A5]">También</span>
                      <span className="block at-serif text-sm text-[#3F3236] leading-tight line-clamp-1 max-w-[130px]">{secondProduct.name}</span>
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Categorías: pestañas de texto con conteo ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-8 scroll-mt-28">
              <div className="text-center mb-7">
                <h2 className="at-serif text-3xl md:text-4xl font-medium">Encuentra tu pieza</h2>
                <p className="at-serif italic text-[#8A7076] mt-1">elige por colección</p>
              </div>
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-2">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-[12px] tracking-[0.14em] uppercase border transition-all duration-300 ${
                        active
                          ? 'bg-[#3F3236] text-[#F9F4EF] border-[#3F3236]'
                          : 'bg-white/60 text-[#8A7076] border-[#EADDD6] hover:border-[#B76E79] hover:text-[#B76E79]'
                      }`}
                    >
                      {cat.name} <sup className={`ml-0.5 ${active ? 'text-[#E8C8CC]' : 'text-[#B76E79]'}`}>{countFor(cat.id)}</sup>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Edición limitada (oferta) ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section className="max-w-6xl mx-auto px-6 pt-14">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative bg-white border border-[#EADDD6] rounded-3xl shadow-[0_24px_60px_-30px_rgba(110,85,92,0.35)] overflow-hidden grid md:grid-cols-2"
              >
                <span className="absolute top-5 left-5 z-10 bg-[#B76E79] text-white text-[9px] font-medium uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full shadow-md">
                  Edición limitada · -{dealPct}%
                </span>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/11] md:aspect-auto md:min-h-[300px] overflow-hidden cursor-pointer">
                  <img
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                </button>
                <div className="flex flex-col justify-center items-start p-8 md:p-12">
                  <p className="at-serif italic text-2xl text-[#B76E79]">Oferta especial</p>
                  <p className="at-serif text-3xl md:text-4xl text-[#3F3236] leading-tight mt-2 line-clamp-2">{dealProduct.name}</p>
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="text-2xl font-medium">S/{Number(dealProduct.price).toFixed(2)}</span>
                    <span className="text-sm text-[#B0A0A5] line-through">S/{Number(dealProduct.originalPrice!).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#3F3236] border-b border-[#3F3236]/30 pb-1 hover:text-[#B76E79] hover:border-[#B76E79] transition-colors"
                  >
                    Ver esta pieza <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#B76E79" />
            </div>
          )}

          {/* ── Colección ── */}
          <section id="coleccion" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#B76E79] mb-2">La colección</p>
                <h2 className="at-serif text-3xl md:text-4xl font-medium">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Nuestras favoritas' : categories.find((c) => c.id === selectedCategory)?.name || 'Colección')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0A0A5]" />
                  <input
                    type="text"
                    placeholder="Buscar pieza..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-white/70 rounded-full border border-[#EADDD6] focus:outline-none focus:border-[#B76E79] placeholder:text-[#B0A0A5] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F0DFD8] hover:bg-[#E8CDC5] flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5 text-[#8A7076]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-full bg-white mx-auto mb-5 flex items-center justify-center border border-[#EADDD6]">
                  <ShoppingBag className="w-6 h-6 text-[#E8CDC5]" />
                </div>
                <p className="at-serif text-xl text-[#8A7076]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Aún no hay piezas en esta colección'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs uppercase tracking-[0.18em] text-[#8A7076] hover:text-[#3F3236] border-b border-[#EADDD6] pb-0.5 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-7 md:gap-y-14">
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
                      <div className={`relative aspect-[3/4] overflow-hidden bg-white ${i % 5 === 0 ? 'rounded-t-[999px] rounded-b-xl' : 'rounded-2xl'}`}>
                        <img
                          src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                          onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                        />
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                          <span className="absolute top-3 right-3 bg-[#B76E79] text-white text-[9px] font-medium tracking-widest px-2.5 py-1 rounded-full">
                            -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                        {product.featured && !product.originalPrice && (
                          <span className="absolute top-3 right-3 bg-white/95 text-[#B76E79] text-[9px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                            Favorita
                          </span>
                        )}
                        <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="block text-center py-2.5 bg-white/95 backdrop-blur-sm text-[#3F3236] text-[10px] font-medium uppercase tracking-[0.22em] rounded-full shadow-md">
                            Ver pieza
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-[#B0A0A5] mb-1">
                          {categories.find((c) => c.id === product.categoryId)?.name || 'Pieza'}
                        </p>
                        <h3 className="at-serif text-lg leading-snug">{product.name}</h3>
                        <div className="flex items-baseline justify-center gap-2 mt-1">
                          <span className="text-[15px] font-medium text-[#B76E79]">S/{Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-xs text-[#B0A0A5] line-through">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#B76E79"
              />
            </div>
          </section>

          {/* ── Cita ── */}
          <section className="border-y border-[#EADDD6] bg-white/50">
            <div className="max-w-3xl mx-auto px-6 py-14 text-center">
              <p className="at-serif italic text-2xl md:text-3xl leading-snug text-[#3F3236]">
                “La elegancia es cuando lo de adentro es tan bello como lo de afuera.”
              </p>
              <span className="inline-block h-px w-10 bg-[#B76E79] mt-6" />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#F0DFD8]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#B76E79] mb-3">Atención personalizada</p>
            <h2 className="at-serif text-3xl md:text-4xl">¿Te ayudamos a elegir?</h2>
            <p className="mt-3 text-[#8A7076] text-sm font-light max-w-md mx-auto">
              Cuéntanos qué buscas por WhatsApp y te mostramos las piezas perfectas para ti.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[#3F3236] text-white px-8 py-4 text-[11px] font-medium uppercase tracking-[0.22em] rounded-full hover:bg-[#B76E79] transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-[#40343A] text-[#E8DCD4]/70">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={30} />}
            <p className="at-serif italic text-2xl text-[#F9F4EF]">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#E8DCD4]/50 font-light max-w-sm leading-relaxed">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em] text-[#E8DCD4]/50">
              <a href="#coleccion" className="hover:text-white transition-colors">Colección</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-white transition-colors">Categorías</a>
              )}
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
