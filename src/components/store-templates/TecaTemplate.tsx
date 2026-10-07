'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { Search, X, ArrowRight, MessageCircle, Armchair, Truck, Leaf, Sparkles } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// TECA — Plantilla premium para hogares y decoración.
// Verde salvia, crema cálido y toques de madera. Serif con
// carácter (Fraunces), tarjetas suaves y ambiente de hogar.
// Ideal para deco, textil, muebles y artículos para el hogar.
// ============================================================

export function TecaTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Vi una pieza que me encantó para mi casa, ¿me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#2F2B23] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Karla:wght@400;500;600;700;800&display=swap');
        .tk-serif { font-family: 'Fraunces', Georgia, serif; }
        .tk-body { font-family: 'Karla', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="tk-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#5F6F52] text-[#F3F0E6]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-bold">
            Nuevos ingresos cada semana{store.hasShipping ? ' · Delivery en la ciudad' : ''} · Pide por WhatsApp
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#F6F2EA]/94 backdrop-blur-md border-b border-[#E3DAC8]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="tk-serif font-semibold text-xl tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-[#7A7263]">
              <a href="#catalogo" className="hover:text-[#5F6F52] transition-colors">Catálogo</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#5F6F52] transition-colors">Ambientes</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#5F6F52] transition-colors">Ofertas</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#5F6F52] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#4C5A40] transition-colors shadow-[0_10px_20px_-8px_rgba(95,111,82,0.7)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consultar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero cálido ── */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#E7DFCB]/70 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 -right-24 w-72 h-72 rounded-full bg-[#DCE3D2]/60 blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#EAEADF] text-[#5F6F52] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6">
                  <Leaf className="w-3.5 h-3.5" /> Materiales nobles, piezas que duran
                </span>
                <h1 className="tk-serif text-5xl md:text-[3.4rem] leading-[1.05] font-semibold">
                  Tu casa,<br />
                  <span className="text-[#5F6F52]">con calma.</span>
                </h1>
                <p className="tk-serif text-2xl text-[#9A6B44] mt-4 italic">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-[#6E6759] text-[15px] leading-relaxed max-w-md font-medium">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 bg-[#5F6F52] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#4C5A40] transition-colors shadow-[0_16px_34px_-12px_rgba(95,111,82,0.7)]"
                  >
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#2F2B23]/12 text-[#2F2B23] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#5F6F52] hover:text-[#5F6F52] transition-colors bg-white/70"
                  >
                    <MessageCircle className="w-4 h-4" /> Preguntar por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-12 md:pb-14">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/3] max-h-[430px] overflow-hidden rounded-[2.2rem] bg-[#EAEADF] cursor-pointer shadow-[0_30px_60px_-28px_rgba(47,43,35,0.45)]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <div className="absolute -bottom-1 left-5 right-5 md:left-8 md:right-auto md:w-72 bg-white rounded-3xl shadow-[0_24px_44px_-20px_rgba(47,43,35,0.4)] p-4 flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#EAEADF] shrink-0">
                      <img loading="lazy" decoding="async"
                        src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={heroProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                      />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                    </div>
                    <button onClick={() => openProduct(heroProduct.id)} className="min-w-0 text-left cursor-pointer">
                      <p className="text-[11px] font-extrabold text-[#9A8F7B] leading-none mb-1">EL RINCÓN DE LA SEMANA</p>
                      <p className="text-[13px] font-extrabold leading-snug line-clamp-1">{heroProduct.name}</p>
                      <p className="text-sm font-extrabold text-[#5F6F52] mt-0.5">S/{Number(heroProduct.price).toFixed(2)}</p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white/70 border-y border-[#E3DAC8]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E3DAC8]">
              {[
                { icon: Armchair, title: 'Piezas con alma', sub: 'Elegidas una por una' },
                { icon: Truck, title: 'Cuidado en el envío', sub: 'Empaque protegido' },
                { icon: Leaf, title: 'Materiales nobles', sub: 'Lino, madera y algodón' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-2xl bg-[#EAEADF] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#5F6F52]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-[#9A8F7B] leading-snug font-bold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Categorías: ambientes ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-12 scroll-mt-28">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9A6B44] mb-1.5">Por ambiente</p>
                  <h2 className="tk-serif text-3xl md:text-4xl font-semibold">¿Qué rincón renovamos?</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-2xl text-[13px] font-extrabold border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#5F6F52] text-white border-[#5F6F52] shadow-[0_12px_26px_-10px_rgba(95,111,82,0.7)]'
                          : 'bg-white text-[#7A7263] border-[#E3DAC8] hover:border-[#5F6F52] hover:text-[#5F6F52]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-[#DCE3D2]' : 'text-[#B8AE99]'}`}>· {countFor(cat.id)}</span>
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
                className="relative grid md:grid-cols-2 rounded-[2.2rem] overflow-hidden bg-gradient-to-br from-[#5F6F52] to-[#8A9B7E] text-white shadow-[0_34px_70px_-30px_rgba(95,111,82,0.7)]"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#DCE3D2] mb-3">Oferta del mes</p>
                  <p className="tk-serif text-6xl md:text-7xl font-semibold leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-white text-[#5F6F52] px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#F3F0E6] transition-colors"
                  >
                    Ver la pieza <ArrowRight className="w-4 h-4" />
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
                <Armchair className="absolute -bottom-6 -left-6 w-28 h-28 text-white/10 pointer-events-none" />
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#5F6F52" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9A6B44] mb-1.5">Catálogo del hogar</p>
                <h2 className="tk-serif text-3xl md:text-4xl font-semibold">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Los favoritos de la casa' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B8AE99]" />
                  <input
                    type="text"
                    placeholder="Buscar pieza..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#E3DAC8] focus:outline-none focus:border-[#5F6F52] placeholder:text-[#B8AE99] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#EAEADF] hover:bg-[#E3DAC8] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#7A7263]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl bg-[#EAEADF] mx-auto mb-5 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[#B8AE99]" />
                </div>
                <p className="tk-serif text-2xl text-[#9A8F7B]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Este rincón se está decorando aún'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#5F6F52] hover:text-[#4C5A40] border-b-2 border-[#5F6F52]/30 pb-0.5 transition-colors"
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
                      <div className="relative bg-white rounded-3xl p-2.5 border border-[#E3DAC8] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(95,111,82,0.55)] transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#EAEADF]">
                          <img loading="lazy" decoding="async"
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-2 left-2 bg-[#5F6F52] text-white text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                              Favorito
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-2 left-2 bg-[#9A6B44] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2 bg-[#5F6F52]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-2xl">
                              Ver detalle
                            </span>
                          </div>
                        </div>
                        <div className="px-1.5 pt-3 pb-1.5">
                          <h3 className="text-[14px] md:text-[15px] font-extrabold leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="tk-serif text-lg font-semibold text-[#5F6F52]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#B8AE99] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#5F6F52"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-[#3F4A3C] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#DCE3D2] mb-3">Asesoría para tu espacio</p>
            <h2 className="tk-serif text-3xl md:text-4xl font-semibold">Cuéntanos tu rincón y te proponemos piezas</h2>
            <p className="mt-3 text-white/80 text-sm max-w-md mx-auto leading-relaxed font-bold">
              Mándanos una foto del espacio por WhatsApp y te armamos una propuesta con medidas y precios.
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
        <footer className="bg-[#33402F] text-[#DCE3D2]/70">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="tk-serif text-2xl font-semibold text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#DCE3D2]/50 max-w-sm leading-relaxed font-bold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#DCE3D2]/50 font-bold">
              <a href="#catalogo" className="hover:text-white transition-colors">Catálogo</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-white transition-colors">Ambientes</a>
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
