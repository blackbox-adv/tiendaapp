'use client'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Flower, Truck, HeartHandshake } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// FLORA — Plantilla premium para florerías y regalos.
// Blanco aireado, verde botánico y rosa empolvado, serif
// romana (Marcellus) y detalles delicados. Ideal para ramos,
// arreglos florales, regalos y detalles para ocasiones.
// ============================================================

export function FloraTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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
  const thirdProduct = useMemo(
    () => products.filter((p) => p.id !== heroProduct?.id && p.id !== secondProduct?.id)[0] || null,
    [products, heroProduct, secondProduct]
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero sorprender a alguien con flores, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#274032] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Quicksand:wght@400;500;600;700&display=swap');
        .fl-serif { font-family: 'Marcellus', Georgia, serif; }
        .fl-body { font-family: 'Quicksand', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="fl-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#F0D9DE] text-[#6B3B49]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-bold">
            Flores frescas de temporada{store.hasShipping ? ' · Envío con delicadeza en la ciudad' : ''} · Pide con 24h de anticipación
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FDFBF7]/94 backdrop-blur-md border-b border-[#EDE4D8]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="fl-serif text-[22px] tracking-wide truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-[#6E8274]">
              <a href="#catalogo" className="hover:text-[#4C7A5A] transition-colors">Ramos</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#4C7A5A] transition-colors">Ocasiones</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#4C7A5A] transition-colors">Combo</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#4C7A5A] text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-[#3D6548] transition-colors shadow-[0_10px_20px_-8px_rgba(76,122,90,0.7)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Encargar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero aireado ── */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[#F6E8EB]/70 blur-3xl pointer-events-none" />
          <div className="absolute top-64 -left-28 w-80 h-80 rounded-full bg-[#E5EDE4]/60 blur-3xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 bg-[#F6E8EB] text-[#B76E84] text-[11px] font-bold px-4 py-1.5 rounded-full mb-6">
                <Flower className="w-3.5 h-3.5" /> Arreglos hechos la mañana misma
              </span>
              <h1 className="fl-serif text-5xl md:text-6xl leading-[1.08]">
                Di lo que sientes,<br />
                <span className="text-[#4C7A5A]">con flores.</span>
              </h1>
              <p className="fl-serif text-2xl text-[#B76E84] mt-4">{store.name}</p>
              {store.description && (
                <p className="mt-4 text-[#5C6E60] text-[15px] leading-relaxed max-w-lg mx-auto font-semibold">
                  {store.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#catalogo"
                  className="inline-flex items-center gap-2 bg-[#4C7A5A] text-white px-8 py-4 text-sm font-bold rounded-full hover:bg-[#3D6548] transition-colors shadow-[0_16px_34px_-12px_rgba(76,122,90,0.7)]"
                >
                  Ver ramos <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-[#274032]/12 text-[#274032] px-7 py-3.5 text-sm font-bold rounded-full hover:border-[#4C7A5A] hover:text-[#4C7A5A] transition-colors bg-white/80"
                >
                  <MessageCircle className="w-4 h-4" /> Encargar por WhatsApp
                </a>
              </div>
            </div>
            {/* Collage de fotos */}
            {heroProduct && (
              <div className="relative mt-12 grid grid-cols-3 gap-3 md:gap-5 max-w-4xl mx-auto items-end pb-8">
                <button
                  onClick={() => openProduct(heroProduct.id)}
                  className="group relative block w-full aspect-[3/4] overflow-hidden rounded-[1.8rem] bg-[#F6E8EB] cursor-pointer shadow-[0_26px_50px_-24px_rgba(39,64,50,0.4)] col-span-1 translate-y-0"
                >
                  {secondProduct && (
                    <img
                      src={secondProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={secondProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                  )}
                </button>
                <button
                  onClick={() => openProduct(heroProduct.id)}
                  className="group relative block w-full aspect-[3/4] overflow-hidden rounded-[2rem] bg-[#F6E8EB] cursor-pointer shadow-[0_30px_60px_-24px_rgba(39,64,50,0.5)] col-span-1 scale-[1.08] z-10 border-4 border-white"
                >
                  <img
                    src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={heroProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-[#4C7A5A] text-[10px] font-bold px-3.5 py-1.5 rounded-full shadow whitespace-nowrap">
                    El favorito
                  </span>
                </button>
                <button
                  onClick={() => openProduct((thirdProduct || dealProduct || heroProduct).id)}
                  className="group relative block w-full aspect-[3/4] overflow-hidden rounded-[1.8rem] bg-[#E5EDE4] cursor-pointer shadow-[0_26px_50px_-24px_rgba(39,64,50,0.4)] col-span-1"
                >
                  <img
                    src={(thirdProduct || dealProduct)?.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={(thirdProduct || dealProduct)?.name || 'Producto'}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                </button>
              </div>
            )}
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white/80 border-y border-[#EDE4D8]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EDE4D8]">
              {[
                { icon: Flower, title: 'Frescura real', sub: 'Flores de la mañana' },
                { icon: Truck, title: 'Envío cuidadoso', sub: 'Con base y tarjeta' },
                { icon: HeartHandshake, title: 'Dedicatoria incluida', sub: 'Tu mensaje, a mano' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-full bg-[#F6E8EB] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#B76E84]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold">{v.title}</p>
                    <p className="text-[11px] text-[#6E8274] leading-snug font-semibold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Categorías: ocasiones ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-12 scroll-mt-28">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B76E84] mb-1.5">Para cada ocasión</p>
                  <h2 className="fl-serif text-3xl md:text-4xl">¿Qué estás celebrando?</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-full text-[13px] font-bold border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#4C7A5A] text-white border-[#4C7A5A] shadow-[0_12px_26px_-10px_rgba(76,122,90,0.7)]'
                          : 'bg-white text-[#6E8274] border-[#EDE4D8] hover:border-[#4C7A5A] hover:text-[#4C7A5A]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-semibold ${active ? 'text-[#D8E5DA]' : 'text-[#B4C2B6]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Combo de la semana ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 rounded-[2.2rem] overflow-hidden bg-gradient-to-br from-[#4C7A5A] to-[#7BA183] text-white shadow-[0_34px_70px_-30px_rgba(76,122,90,0.7)]"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D8E5DA] mb-3">Combo de la semana</p>
                  <p className="fl-serif text-6xl md:text-7xl leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-white text-[#4C7A5A] px-6 py-3 text-sm font-bold rounded-full hover:bg-[#F0F5F0] transition-colors"
                  >
                    Ver detalle <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => openProduct(dealProduct.id)} className="group relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden cursor-pointer order-1 md:order-2">
                  <img
                    src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                    alt={dealProduct.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                  />
                </button>
                <Flower className="absolute -bottom-6 -left-6 w-28 h-28 text-white/10 pointer-events-none" />
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#4C7A5A" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B76E84] mb-1.5">Catálogo</p>
                <h2 className="fl-serif text-3xl md:text-4xl">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Los más regalados' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B4C2B6]" />
                  <input
                    type="text"
                    placeholder="Buscar ramo o regalo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#EDE4D8] focus:outline-none focus:border-[#4C7A5A] placeholder:text-[#B4C2B6] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F6E8EB] hover:bg-[#F0D9DE] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#6E8274]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-full bg-[#F6E8EB] mx-auto mb-5 flex items-center justify-center">
                  <Flower className="w-7 h-7 text-[#D9B8C2]" />
                </div>
                <p className="fl-serif text-2xl text-[#6E8274]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Estamos armando nuevos ramos'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-bold text-[#4C7A5A] hover:text-[#3D6548] border-b-2 border-[#4C7A5A]/30 pb-0.5 transition-colors"
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
                      <div className="relative bg-white rounded-[1.8rem] p-2.5 border border-[#EDE4D8] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(76,122,90,0.55)] transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-[#F6E8EB]">
                          <img
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-2 left-2 bg-[#F0D9DE] text-[#6B3B49] text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                              Favorito
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-2 left-2 bg-[#4C7A5A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2 bg-[#4C7A5A]/95 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                              Encargar
                            </span>
                          </div>
                        </div>
                        <div className="px-1.5 pt-3 pb-1.5">
                          <h3 className="fl-serif text-[16px] leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-[14px] font-bold text-[#4C7A5A]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#B4C2B6] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#4C7A5A"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#2E4A38] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#D8E5DA] mb-3">Sorpresas que llegan a tiempo</p>
            <h2 className="fl-serif text-3xl md:text-4xl">Cuéntanos la ocasión y armamos el detalle</h2>
            <p className="mt-3 text-white/80 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Aniversario, cumpleaños o un simple "gracias": escríbenos y te mandamos fotos de lo fresco del día.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 text-sm font-bold rounded-full hover:brightness-95 transition-all shadow-lg"
            >
              <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Formas de pago (Yape / Plin) y envíos */}
        <ShippingOptions store={store} />
        <PaymentMethods store={store} />

        {/* ── Footer ── */}
        <footer className="bg-[#243A2C] text-[#D8E5DA]/70">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="fl-serif text-2xl text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#D8E5DA]/50 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#D8E5DA]/50 font-bold">
              <a href="#catalogo" className="hover:text-white transition-colors">Ramos</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-white transition-colors">Ocasiones</a>
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
