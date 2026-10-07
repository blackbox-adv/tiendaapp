'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { ShoppingBag, Search, X, ArrowRight, MessageCircle, Cake, Clock, Sparkles, Cookie } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// DULCE — Plantilla premium para pastelerías, postres y heladerías.
// Lila pastel y rosa caramelo, tipografía redondeada Baloo 2,
// tarjetas muy redondeadas, stickers girados y precios amigables.
// Ideal para tortas, bocaditos, cafeterías dulces y encargos.
// ============================================================

export function DulceTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${store.name}! Quiero encargar algo dulce, me ayudan?`)}`

  const countFor = (catId: string) => (catId === 'all' ? products.length : products.filter((p) => p.categoryId === catId).length)

  return (
    <div className="min-h-screen bg-[#FEF6FB] text-[#4A2440] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        .dl-round { font-family: 'Baloo 2', 'Comic Sans MS', cursive, sans-serif; }
        .dl-body { font-family: 'Nunito', system-ui, -apple-system, sans-serif; }
      `}</style>
      <div className="dl-body contents">
        {/* ── Aviso superior ── */}
        <div className="bg-[#F9A8D4] text-[#4A2440]">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center text-[11px] md:text-xs font-bold">
            Horneado hoy en la mañana{store.hasShipping ? ' · Enviamos dentro de la ciudad' : ''} · Encargos por WhatsApp
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sticky top-0 z-30 bg-[#FEF6FB]/92 backdrop-blur-md border-b-2 border-[#FBD9EC]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logo && <StoreLogo logo={store.logo} size={30} />}
              <span className="dl-round font-bold text-xl tracking-tight truncate">{store.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-[#9C6B8B]">
              <a href="#catalogo" className="hover:text-[#A64AC9] transition-colors">Catálogo</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-[#A64AC9] transition-colors">Sabores</a>
              )}
              {dealProduct && (
                <a href="#oferta" className="hover:text-[#A64AC9] transition-colors">Promos</a>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#A64AC9] text-white text-xs font-extrabold px-4 py-2.5 rounded-full hover:bg-[#8E3AAE] transition-colors shadow-[0_10px_20px_-8px_rgba(166,74,201,0.6)] shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Encargar</span>
            </a>
          </div>
        </nav>

        {/* ── Hero dulce ── */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FBD9EC]/60 blur-2xl pointer-events-none" />
          <div className="absolute top-40 -left-28 w-64 h-64 rounded-full bg-[#E9D5FF]/50 blur-2xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-14">
            <div className="grid md:grid-cols-2 gap-12 md:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#FDE7F1] text-[#C2478F] text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-6 border-2 border-[#FBD9EC]">
                  <Sparkles className="w-3.5 h-3.5" /> Recetas de la casa, hechas con cariño
                </span>
                <h1 className="dl-round text-5xl md:text-[3.5rem] leading-[1.03] font-bold">
                  Un antojo dulce,<br />
                  <span className="text-[#A64AC9]">resuelto hoy.</span>
                </h1>
                <p className="dl-round text-2xl text-[#B56FA0] mt-4">{store.name}</p>
                {store.description && (
                  <p className="mt-4 text-[#7C5373] text-[15px] leading-relaxed max-w-md font-semibold">
                    {store.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 bg-[#A64AC9] text-white px-8 py-4 text-sm font-extrabold rounded-full hover:bg-[#8E3AAE] transition-colors shadow-[0_16px_34px_-12px_rgba(166,74,201,0.65)]"
                  >
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#4A2440]/15 text-[#4A2440] px-7 py-3.5 text-sm font-extrabold rounded-full hover:border-[#A64AC9] hover:text-[#A64AC9] transition-colors bg-white/70"
                  >
                    <MessageCircle className="w-4 h-4" /> Encargar por WhatsApp
                  </a>
                </div>
              </div>
              {heroProduct && (
                <div className="relative pb-14 md:pb-16">
                  <button
                    onClick={() => openProduct(heroProduct.id)}
                    className="group relative block w-full aspect-[4/5] max-h-[470px] overflow-hidden rounded-t-[10rem] md:rounded-t-[12rem] rounded-b-[2.5rem] bg-[#FDE7F1] cursor-pointer border-4 border-white shadow-[0_30px_60px_-24px_rgba(166,74,201,0.45)]"
                  >
                    <img loading="lazy" decoding="async"
                      src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                      alt={heroProduct.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                    />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                  </button>
                  <span className="absolute top-8 -left-1 md:-left-4 rotate-[-9deg] bg-[#F9A8D4] text-[#4A2440] text-[11px] font-extrabold px-4 py-2 rounded-full shadow-lg border-2 border-white">
                    ¡Recién horneado!
                  </span>
                  {secondProduct && (
                    <div className="absolute bottom-0 right-0 md:-right-2 w-44 md:w-52 bg-white rounded-3xl shadow-[0_24px_44px_-18px_rgba(74,36,64,0.4)] p-3 border-2 border-[#FBD9EC]">
                      <button
                        onClick={() => openProduct(secondProduct.id)}
                        className="group block w-full text-left cursor-pointer"
                      >
                        <div className="aspect-[5/3] overflow-hidden rounded-2xl bg-[#FDE7F1]">
                          <img loading="lazy" decoding="async"
                            src={secondProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={secondProduct.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                    <ShareProductButton productName={secondProduct.name} price={secondProduct.price} productId={secondProduct.id} slug={storeSlug} storeName={store.name} />
                        </div>
                        <p className="mt-2 text-[11px] font-bold text-[#7C5373] leading-snug line-clamp-1">{secondProduct.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-sm font-extrabold text-[#A64AC9]">S/{Number(secondProduct.price).toFixed(2)}</span>
                          <span className="text-[10px] font-extrabold text-white bg-[#A64AC9] rounded-full px-2.5 py-1">Encargar</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="flex-1 w-full">
          {/* ── Banda de valores ── */}
          <section className="bg-white/70 border-y-2 border-[#FBD9EC]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#FBD9EC]">
              {[
                { icon: Cake, title: 'Recetas propias', sub: 'De la familia, sin atajos' },
                { icon: Clock, title: 'Pedidos por encargo', sub: 'Para fechas especiales' },
                { icon: Sparkles, title: 'Frescura de hoy', sub: 'Se acaba, por algo es' },
              ].map((v) => (
                <div key={v.title} className="flex items-center gap-3.5 py-5 px-2 sm:justify-center">
                  <span className="w-11 h-11 rounded-2xl bg-[#FDE7F1] border-2 border-[#FBD9EC] flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#A64AC9]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold">{v.title}</p>
                    <p className="text-[11px] text-[#9C6B8B] leading-snug font-semibold">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Categorías: chips de sabores ── */}
          {categories.length > 0 && (
            <section id="categorias" className="max-w-6xl mx-auto px-6 pt-12 scroll-mt-28">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C2478F] mb-1.5">Antojos por tipo</p>
                  <h2 className="dl-round text-3xl md:text-4xl font-bold">¿Qué se te antoja hoy?</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-full text-[13px] font-extrabold border-2 transition-all duration-300 ${
                        active
                          ? 'bg-[#A64AC9] text-white border-[#A64AC9] shadow-[0_12px_26px_-10px_rgba(166,74,201,0.7)]'
                          : 'bg-white text-[#9C6B8B] border-[#FBD9EC] hover:border-[#A64AC9] hover:text-[#A64AC9]'
                      }`}
                    >
                      {cat.name} <span className={`ml-1 font-bold ${active ? 'text-[#FBD9EC]' : 'text-[#D9A8CB]'}`}>· {countFor(cat.id)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Promo dulce ── */}
          {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
            <section id="oferta" className="max-w-6xl mx-auto px-6 pt-14 scroll-mt-28">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative grid md:grid-cols-2 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#A64AC9] to-[#E158A8] text-white shadow-[0_34px_70px_-30px_rgba(166,74,201,0.65)]"
              >
                <div className="flex flex-col justify-center items-start p-8 md:p-12 order-2 md:order-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FBD9EC] mb-3">Combo dulce de la semana</p>
                  <p className="dl-round text-6xl md:text-7xl font-bold leading-none">-{dealPct}<span className="text-4xl align-top">%</span></p>
                  <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-xs font-bold line-clamp-2">{dealProduct.name}</p>
                  <button
                    onClick={() => openProduct(dealProduct.id)}
                    className="mt-7 inline-flex items-center gap-2 bg-white text-[#A64AC9] px-6 py-3 text-sm font-extrabold rounded-full hover:bg-[#FDE7F1] transition-colors"
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
                <Cookie className="absolute -bottom-6 -left-6 w-28 h-28 text-white/10 pointer-events-none" />
              </motion.div>
            </section>
          )}

          {/* ── Packs / combos (funcionalidad intacta) ── */}
          {selectedCategory === 'all' && !searchQuery.trim() && (
            <div className="max-w-6xl mx-auto px-6 pt-14">
              <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor="#A64AC9" />
            </div>
          )}

          {/* ── Catálogo ── */}
          <section id="catalogo" className="max-w-6xl mx-auto px-6 pt-16 pb-16 scroll-mt-28">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C2478F] mb-1.5">Catálogo dulce</p>
                <h2 className="dl-round text-3xl md:text-4xl font-bold">
                  {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Los más pedidos' : categories.find((c) => c.id === selectedCategory)?.name || 'Catálogo')}
                </h2>
              </div>
              {planId !== 'free' && (
                <div className="relative w-44 md:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D9A8CB]" />
                  <input
                    type="text"
                    placeholder="Buscar antojo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 text-xs bg-white rounded-full border-2 border-[#FBD9EC] focus:outline-none focus:border-[#A64AC9] placeholder:text-[#D9A8CB] transition-colors font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FDE7F1] hover:bg-[#FBD9EC] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#9C6B8B]" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl bg-[#FDE7F1] mx-auto mb-5 flex items-center justify-center border-2 border-[#FBD9EC]">
                  <ShoppingBag className="w-7 h-7 text-[#D9A8CB]" />
                </div>
                <p className="dl-round text-2xl text-[#9C6B8B]">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Aquí todavía no hay nada dulce'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-extrabold text-[#A64AC9] hover:text-[#8E3AAE] border-b-2 border-[#A64AC9]/30 pb-0.5 transition-colors"
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
                      <div className="relative bg-white rounded-3xl p-2.5 border-2 border-[#FBD9EC] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_44px_-24px_rgba(166,74,201,0.5)] transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-[#FDE7F1]">
                          <img loading="lazy" decoding="async"
                            src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK }}
                          />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                          {product.featured && !product.originalPrice && (
                            <span className="absolute top-2 left-2 rotate-[-6deg] bg-[#F9A8D4] text-[#4A2440] text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full border border-white shadow">
                              Favorito
                            </span>
                          )}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="absolute top-2 left-2 bg-[#A64AC9] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                              -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                            </span>
                          )}
                          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="block text-center py-2 bg-[#A64AC9]/95 backdrop-blur-sm text-white text-[10px] font-extrabold rounded-full">
                              Encargar
                            </span>
                          </div>
                        </div>
                        <div className="px-1.5 pt-3 pb-1.5">
                          <h3 className="text-[14px] md:text-[15px] font-extrabold leading-snug line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="dl-round text-lg font-bold text-[#A64AC9]">S/{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                              <span className="text-[11px] text-[#D9A8CB] line-through font-bold">S/{Number(product.originalPrice).toFixed(2)}</span>
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
                primaryColor="#A64AC9"
              />
            </div>
          </section>
        </main>

        {/* ── CTA final ── */}
        <section className="bg-gradient-to-br from-[#4A2440] to-[#7A2E5F] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#F9A8D4] mb-3">Encargos para cumpleaños, eventos y antojos</p>
            <h2 className="dl-round text-3xl md:text-4xl font-bold">Escríbenos y aparta tu pedido</h2>
            <p className="mt-3 text-white/80 text-sm max-w-md mx-auto leading-relaxed font-semibold">
              Cuéntanos qué celebras y te armamos la caja perfecta. Respondemos por WhatsApp con fotos del día.
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
        <footer className="bg-[#3B1B33] text-[#FBD9EC]/70">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-3 text-center">
            {store.logo && <StoreLogo logo={store.logo} size={32} />}
            <p className="dl-round text-2xl font-bold text-white">{store.name}</p>
            {store.description && (
              <p className="text-xs text-[#FBD9EC]/50 max-w-sm leading-relaxed font-semibold">{store.description}</p>
            )}
            <span className="inline-block h-px w-10 bg-white/20 my-2" />
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#FBD9EC]/50 font-bold">
              <a href="#catalogo" className="hover:text-white transition-colors">Catálogo</a>
              {categories.length > 0 && (
                <a href="#categorias" className="hover:text-white transition-colors">Sabores</a>
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
