'use client'
import { ShareProductButton } from './ShareProductButton'
import { PRODUCT_IMG_FALLBACK } from './product-image-fallback'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreLogo } from './StoreLogo'
import { getStoreCategories } from '@/lib/store-categories'
import { ShoppingBag, Search, X, ArrowRight, Truck, ShieldCheck, RotateCcw, MessageCircle } from 'lucide-react'
import { StoreFeatureBadges } from './StoreFeatureBadges'
import { CombosSection } from './CombosSection'
import { PaymentMethods } from './PaymentMethods'
import { ShippingOptions } from './ShippingOptions'
import { useAppStore } from '@/lib/store'
import type { Store, Product } from '@/lib/types'

// ============================================================
// BOUTIQUE — Plantilla premium estilo "boutique top".
// Réplica del look de las grandes marcas de moda: hero editorial
// a pantalla completa, barra de beneficios, categorías con foto
// (chips circulares + mosaicos), banner de colección con descuento
// y grilla lookbook. Ideal para tiendas de ropa que quieren verse
// como marca profesional.
// ============================================================

export function BoutiqueTemplate({ store, products, storeSlug, planId, onProductClick }: { store: Store; products: Product[]; storeSlug: string; planId?: string; onProductClick?: (productId: string) => void }) {
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

  // Primera foto disponible por categoría (chips circulares + mosaicos)
  const categoryImages = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of products) {
      if (p.imageUrl && !map[p.categoryId]) map[p.categoryId] = p.imageUrl
    }
    return map
  }, [products])

  // Hero: producto destacado (para el hero dividido cuando no hay banner)
  const heroProduct = useMemo(
    () => products.find((p) => p.featured) || products[0] || null,
    [products]
  )

  // Banner de colección: producto con mayor % de descuento
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

  const showCategoryTiles = categories.length >= 3

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col">
      {/* ── Barra superior de anuncio ── */}
      <div className="bg-stone-900 text-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-center gap-2 text-[10px] md:text-[11px] tracking-[0.18em] uppercase">
          <Truck className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {store.hasShipping ? 'Envíos a todo el país' : 'Atención personalizada'} · Compra fácil por WhatsApp
          </span>
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="sticky top-[53px] z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {store.logo && <StoreLogo logo={store.logo} size={26} />}
            <span className="font-serif text-lg tracking-tight truncate">{store.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
            <a href="#coleccion" className="hover:text-stone-900 transition-colors">Colección</a>
            {categories.length > 0 && (
              <a href="#categorias" className="hover:text-stone-900 transition-colors">Categorías</a>
            )}
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-stone-900 text-white text-[11px] font-semibold uppercase tracking-[0.15em] px-4 py-2 hover:bg-stone-700 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pedir</span>
          </a>
        </div>
      </nav>

      {/* ── Hero editorial ── */}
      {store.bannerUrl ? (
        <section className="relative h-[68vh] min-h-[420px] max-h-[640px] overflow-hidden">
          <img loading="lazy" decoding="async" src={store.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-lg text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] mb-4 text-white/80">
                Nueva colección
              </p>
              <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight">{store.name}</h1>
              {store.description && (
                <p className="mt-5 text-sm md:text-base text-white/85 font-light leading-relaxed max-w-sm">
                  {store.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#coleccion"
                  className="inline-flex items-center gap-2 bg-white text-stone-900 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-stone-100 transition-colors shadow-lg"
                >
                  Ver colección <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/50 text-white px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Pedir por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-6xl mx-auto px-6 pt-10 md:pt-14 pb-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: store.colors.primary }}>
                Nueva colección
              </p>
              <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight">{store.name}</h1>
              {store.description && (
                <p className="mt-5 text-stone-500 font-light leading-relaxed max-w-sm">{store.description}</p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#coleccion"
                  className="inline-flex items-center gap-2 bg-stone-900 text-white px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-stone-700 transition-colors"
                >
                  Ver colección <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-stone-300 text-stone-700 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-stone-100 transition-colors"
                >
                  Pedir por WhatsApp
                </a>
              </div>
            </div>
            {heroProduct && (
              <button
                onClick={() => openProduct(heroProduct.id)}
                className="group relative aspect-[4/5] max-h-[460px] w-full overflow-hidden bg-stone-100 cursor-pointer text-left"
              >
                <img loading="lazy" decoding="async"
                  src={heroProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                  alt={heroProduct.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                  }}
                />
                    <ShareProductButton productName={heroProduct.name} price={heroProduct.price} productId={heroProduct.id} slug={storeSlug} storeName={store.name} />
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 shadow-md">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400">Destacado</p>
                  <p className="font-serif text-sm">{heroProduct.name}</p>
                </div>
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Barra de beneficios ── */}
      <section className="border-y border-stone-200/80 bg-white/60">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 divide-x divide-stone-200/80">
          {[
            { icon: Truck, title: 'Envío', sub: store.hasShipping ? 'A todo el país' : 'A coordinar' },
            { icon: ShieldCheck, title: 'Pago seguro', sub: 'Yape · Plin · Efectivo' },
            { icon: RotateCcw, title: 'Cambios', sub: store.hasReturns ? 'Fáciles y rápidos' : 'A coordinar' },
          ].map((b) => (
            <div key={b.title} className="flex items-center justify-center gap-2.5 py-4 md:py-5 px-2">
              <b.icon className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
              <div className="text-center sm:text-left">
                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em]">{b.title}</p>
                <p className="text-[9px] md:text-[10px] text-stone-400 tracking-wide">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <main className="flex-1 w-full">
        {/* ── Categorías: chips circulares con foto ── */}
        {categories.length > 0 && (
          <section id="categorias" className="max-w-6xl mx-auto px-6 pt-12 scroll-mt-32">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400 mb-2">Shop by category</p>
                <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Encuentra tu estilo</h2>
              </div>
            </div>
            <div className="flex gap-5 md:gap-8 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className="group flex flex-col items-center gap-2.5 shrink-0"
              >
                <span
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-1 transition-all duration-300 flex items-center justify-center ${
                    selectedCategory === 'all'
                      ? 'ring-2 ring-offset-2 ring-stone-900 ring-offset-[#FDFBF7]'
                      : 'ring-stone-200 group-hover:ring-stone-400'
                  }`}
                  style={selectedCategory === 'all' ? { ['--tw-ring-color' as string]: store.colors.primary } : undefined}
                >
                  <span className="w-full h-full flex items-center justify-center bg-stone-100 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Todo
                  </span>
                </span>
                <span className={`text-[10px] md:text-[11px] uppercase tracking-[0.15em] ${selectedCategory === 'all' ? 'font-bold' : 'text-stone-500'}`}>
                  Todo
                </span>
              </button>
              {categories.map((cat) => {
                const active = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="group flex flex-col items-center gap-2.5 shrink-0"
                  >
                    <span
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-1 transition-all duration-300 ${
                        active
                          ? 'ring-2 ring-offset-2 ring-offset-[#FDFBF7]'
                          : 'ring-stone-200 group-hover:ring-stone-400'
                      }`}
                      style={active ? { ['--tw-ring-color' as string]: store.colors.primary } : undefined}
                    >
                      <img loading="lazy" decoding="async"
                        src={categoryImages[cat.id] || PRODUCT_IMG_FALLBACK}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                        }}
                      />
                    </span>
                    <span className={`text-[10px] md:text-[11px] uppercase tracking-[0.15em] whitespace-nowrap ${active ? 'font-bold' : 'text-stone-500 group-hover:text-stone-900'}`}>
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Mosaico de categorías con foto grande (solo si hay 3+) */}
            {showCategoryTiles && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    <img loading="lazy" decoding="async"
                      src={categoryImages[cat.id] || PRODUCT_IMG_FALLBACK}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-4 text-left">
                      <p className="text-white font-serif text-base md:text-lg leading-tight">{cat.name}</p>
                      <span className="inline-flex items-center gap-1.5 text-white/80 text-[10px] uppercase tracking-[0.2em] mt-1 group-hover:gap-3 group-hover:text-white transition-all duration-300">
                        Explorar <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Banner de colección con descuento ── */}
        {dealProduct && selectedCategory === 'all' && !searchQuery.trim() && (
          <section className="max-w-6xl mx-auto px-6 pt-14">
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onClick={() => openProduct(dealProduct.id)}
              className="group relative w-full overflow-hidden bg-stone-900 cursor-pointer text-left grid md:grid-cols-2"
            >
              <div className="aspect-[16/10] md:aspect-auto md:min-h-[300px] relative overflow-hidden">
                <img loading="lazy" decoding="async"
                  src={dealProduct.imageUrl || PRODUCT_IMG_FALLBACK}
                  alt={dealProduct.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-[1.03] transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                  }}
                />
                    <ShareProductButton productName={dealProduct.name} price={dealProduct.price} productId={dealProduct.id} slug={storeSlug} storeName={store.name} />
              </div>
              <div className="flex flex-col justify-center items-start p-8 md:p-12">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60 mb-3">Oferta especial</p>
                <p className="font-serif text-3xl md:text-4xl text-white leading-tight">Hasta -{dealPct}%</p>
                <p className="mt-3 text-white/80 text-sm font-light max-w-xs line-clamp-2">{dealProduct.name}</p>
                <span className="mt-7 inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:bg-stone-100 transition-colors">
                  Ver oferta <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.button>
          </section>
        )}

        {/* ── Packs / combos (funcionalidad intacta) ── */}
        {selectedCategory === 'all' && !searchQuery.trim() && (
          <div className="max-w-6xl mx-auto px-6 pt-14">
            <CombosSection products={products} store={store} storeSlug={storeSlug} primaryColor={store.colors.primary} />
          </div>
        )}

        {/* ── Catálogo ── */}
        <section id="coleccion" className="max-w-6xl mx-auto px-6 pt-14 pb-16 scroll-mt-32">
          <div className="flex items-end justify-between mb-7 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400 mb-2">Best sellers</p>
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight">
                {searchQuery.trim() ? 'Resultados' : (selectedCategory === 'all' ? 'Los más pedidos' : categories.find((c) => c.id === selectedCategory)?.name || 'Colección')}
              </h2>
            </div>
            {planId !== 'free' && (
              <div className="relative w-44 md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2.5 text-xs bg-transparent border border-stone-200 focus:outline-none focus:border-stone-900 placeholder:text-stone-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
                  >
                    <X className="w-2.5 h-2.5 text-stone-600" />
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-14 h-14 rounded-full bg-white mx-auto mb-5 flex items-center justify-center ring-1 ring-stone-200">
                <ShoppingBag className="w-6 h-6 text-stone-300" />
              </div>
              <p className="font-serif text-lg text-stone-400">
                {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos en esta categoría'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 border-b border-stone-400 pb-0.5 transition-colors"
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
                    <div className="aspect-[3/4] relative overflow-hidden bg-stone-100">
                      <img loading="lazy" decoding="async"
                        src={product.imageUrl || PRODUCT_IMG_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRODUCT_IMG_FALLBACK
                        }}
                      />
                    <ShareProductButton productName={product.name} price={product.price} productId={product.id} slug={storeSlug} storeName={store.name} />
                      {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                        <div
                          className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white"
                          style={{ backgroundColor: store.colors.primary }}
                        >
                          -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                        </div>
                      )}
                      {product.featured && !product.originalPrice && (
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-stone-900 text-white text-[10px] font-semibold tracking-widest uppercase">
                          Destacado
                        </div>
                      )}
                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/15 transition-colors duration-300" />
                      <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="block text-center py-2.5 bg-white/95 backdrop-blur-sm text-stone-900 text-[10px] font-bold uppercase tracking-[0.2em] shadow-md">
                          Ver detalle
                        </span>
                      </div>
                    </div>
                    <div className="mt-3.5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-stone-400 mb-1">
                        {categories.find((c) => c.id === product.categoryId)?.name || 'Producto'}
                      </p>
                      <h3 className="font-serif text-[15px] leading-snug">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-semibold" style={{ color: store.colors.primary }}>
                          S/{Number(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">S/{Number(product.originalPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Insignias de features en el cierre del catálogo */}
          <div className="mt-14 flex justify-center">
            <StoreFeatureBadges
              hasShipping={store.hasShipping}
              hasSecurePayment={store.hasSecurePayment}
              hasReturns={store.hasReturns}
              variant="light"
              primaryColor={store.colors.primary}
            />
          </div>
        </section>
      </main>

      {/* ── CTA final estilo newsletter → WhatsApp ── */}
      <section className="bg-stone-900">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50 mb-3">Atención personalizada</p>
          <h2 className="font-serif text-2xl md:text-3xl text-white tracking-tight">¿Listo para tu próximo favorito?</h2>
          <p className="mt-3 text-white/60 text-sm font-light max-w-md mx-auto">
            Escríbenos por WhatsApp y te ayudamos a elegir. Respondemos rápido.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:brightness-95 transition-all shadow-lg"
          >
            <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
          </a>
        </div>
      </section>

      {/* Formas de pago (Yape / Plin) y envíos */}
      <ShippingOptions store={store} />
      <PaymentMethods store={store} />

      {/* ── Footer oscuro elegante ── */}
      <footer className="bg-stone-950 text-white/70">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col items-center gap-3 text-center">
          {store.logo && <StoreLogo logo={store.logo} size={30} />}
          <p className="font-serif text-lg text-white">{store.name}</p>
          {store.description && (
            <p className="text-xs text-white/40 font-light max-w-sm leading-relaxed">{store.description}</p>
          )}
          <div className="h-px w-10 bg-white/20 my-2" />
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
            <a href="#coleccion" className="hover:text-white transition-colors">Colección</a>
            {categories.length > 0 && (
              <a href="#categorias" className="hover:text-white transition-colors">Categorías</a>
            )}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
          </div>
          {planId === 'free' && (
            <a href="/" className="mt-2 text-[10px] text-white/25 hover:text-white/50 transition-colors">
              Creado con TiendApp
            </a>
          )}
        </div>
      </footer>
    </div>
  )
}
