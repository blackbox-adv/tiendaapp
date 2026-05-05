'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
const CATEGORIES = [
  { id: 'ropa', name: 'Ropa' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'electronica', name: 'Electronica' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'belleza', name: 'Belleza' },
  { id: 'deportes', name: 'Deportes' },
  { id: 'alimentos', name: 'Alimentos' },
  { id: 'juguetes', name: 'Juguetes' },
  { id: 'otros', name: 'Otros' },
]
import {
  ArrowLeft,
  MessageCircle,
  Tag,
  Share2,
  ShoppingBag,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  QrCode,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductBadges } from './ProductBadges'
import type { Product, Store } from '@/lib/types'

export function ProductDetailView({ slug, productId }: { slug: string; productId: string }) {
  const { stores, products, navigate, goBack } = useAppStore()
  const [showYape, setShowYape] = useState(false)

  const zustandStore = stores.find((s) => s.slug === slug && s.isActive)
  const zustandProduct = products.find((p) => p.id === productId && p.isActive)

  // API fallback: if product not found in Zustand, fetch from API
  const [apiLoading, setApiLoading] = useState(!zustandStore || !zustandProduct)
  const [apiStore, setApiStore] = useState<Store | null>(null)
  const [apiProduct, setApiProduct] = useState<Product | null>(null)
  const [apiProducts, setApiProducts] = useState<Product[]>([])

  useEffect(() => {
    if (zustandStore && zustandProduct) return
    const fetchFromApi = async () => {
      try {
        const res = await fetch(`/api/stores?slug=${slug}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.id) {
            const mappedStore: Store = {
              id: data.id,
              name: data.name,
              slug: data.slug,
              description: data.description || '',
              logo: data.logo || '\uD83D\uDED2',
              categoryId: data.category || '',
              planId: '',
              colors: {
                primary: data.primaryColor || '#7C3AED',
                secondary: data.secondaryColor || '#10B981',
              },
              whatsappNumber: data.whatsappNumber || '',
              template: (data.template as 'moderna' | 'vibrante' | 'clasica') || 'moderna',
              userId: data.ownerId || '',
              isActive: data.isActive ?? true,
              createdAt: data.createdAt || new Date().toISOString(),
            }
            setApiStore(mappedStore)

            if (data.products && Array.isArray(data.products)) {
              const mapped: Product[] = data.products.map((p: Record<string, unknown>) => ({
                id: p.id as string,
                name: (p.name as string) || '',
                description: (p.description as string) || '',
                price: (p.price as number) || 0,
                originalPrice: (p.originalPrice as number) || null,
                categoryId: (p.category as string) || '',
                imageUrl: (p.imageUrl as string) || '',
                isActive: (p.isActive as boolean) ?? true,
                featured: (p.featured as boolean) ?? false,
                rating: (p.rating as number) || 0,
                storeId: (p.storeId as string) || '',
                createdAt: (p.createdAt as string) || new Date().toISOString(),
              }))
              setApiProducts(mapped)
              const found = mapped.find((p) => p.id === productId && p.isActive)
              setApiProduct(found || null)
            }
          }
        }
      } catch {
        // API fallback failed
      }
      setApiLoading(false)
    }
    fetchFromApi()
  }, [slug, productId, zustandStore, zustandProduct])

  const displayStore = zustandStore || apiStore
  const displayProduct = zustandProduct || apiProduct

  // SEO: Update document title and meta description
  useEffect(() => {
    if (!displayStore || !displayProduct) return
    const title = `${displayProduct.name} | ${displayStore.name}`
    const description = displayProduct.description
      ? `${displayProduct.description.substring(0, 160)} - ${displayStore.name} en TiendApp.`
      : `Compra ${displayProduct.name} por S/${displayProduct.price.toFixed(2)} en ${displayStore.name}. Visita la tienda en TiendApp.`

    document.title = title
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description)

    // Update Open Graph
    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', prop)
        document.head.appendChild(el)
      }
      el.content = content
    }
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('og:image', displayProduct.imageUrl)
    setMeta('og:type', 'product')
    setMeta('product:price:amount', displayProduct.price.toString())
    setMeta('product:price:currency', 'PEN')

    return () => {
      document.title = 'TiendApp | Crea tu tienda online en Perú'
      if (metaDesc) metaDesc.setAttribute('content', 'Crea tu tienda online en minutos con TiendApp. La plataforma #1 en Perú para emprendedores.')
    }
  }, [displayStore, displayProduct])

  if (apiLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-7 bg-gray-200 rounded animate-pulse" />
              <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-full h-20 bg-gray-100 rounded-xl animate-pulse mt-4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!displayStore || !displayProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
        <p className="text-gray-500 mb-6">Este producto no existe o ya no está disponible.</p>
        <Button
          onClick={() => (displayStore ? navigate({ page: 'store', slug }) : navigate({ page: 'landing' }))}
          className="gap-2 rounded-xl"
          style={{ backgroundColor: displayStore?.colors.primary || '#7C3AED' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Button>
      </div>
    )
  }

  // Aliases for cleaner code below
  const product = displayProduct
  const store = displayStore

  const category = CATEGORIES.find((c) => c.id === product.categoryId)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0
  const savings = product.originalPrice ? product.originalPrice - product.price : 0

  const isNewProduct = (() => {
    const created = new Date(product.createdAt)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  })()

  // Related products: try Zustand first, fallback to API products
  const allProducts = products.length > 0 ? products : apiProducts
  const relatedProducts = allProducts.filter(
    (p) => p.storeId === store.id && p.isActive && p.categoryId === product.categoryId && p.id !== product.id
  ).slice(0, 4)

  const openWhatsApp = async () => {
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          productName: product.name,
          productPrice: product.price,
        }),
      })
      const data = await res.json()
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank')
        return
      }
    } catch {
      // Fallback
    }
    const msg = encodeURIComponent(
      `Hola! Me interesa el producto: ${product.name}\nPrecio: S/${product.price.toFixed(2)}\nLo vi en tu tienda en TiendApp.`
    )
    window.open(`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank')
  }

  const shareProduct = async () => {
    const shareData = {
      title: `${product.name} - ${store.name}`,
      text: `Mira este producto: ${product.name} por S/${product.price.toFixed(2)} en ${store.name}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url)
      }
    } catch {
      // User cancelled or clipboard failed
    }
  }

  const imgFallback =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="%23fafafa" width="600" height="600"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23ccc">Imagen no disponible</text></svg>'

  const renderStars = (rating: number, showLabel: boolean = false) => {
    if (rating <= 0) return null
    const formattedRating = rating % 1 === 0 ? rating.toFixed(1) : rating.toString()
    const getRatingLabel = (r: number) => {
      if (r >= 4.5) return 'Excelente'
      if (r >= 3.5) return 'Muy bueno'
      if (r >= 2.5) return 'Bueno'
      if (r >= 1.5) return 'Regular'
      return 'Bajo'
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => {
            let fillClass = 'text-gray-200'
            if (rating >= star) {
              fillClass = 'fill-yellow-400 text-yellow-400'
            } else if (rating >= star - 0.5) {
              fillClass = 'fill-yellow-400/50 text-yellow-400'
            }
            return (
              <Star
                key={star}
                size={showLabel ? 20 : 16}
                className={fillClass}
              />
            )
          })}
        </div>
        {showLabel ? (
          <div className="flex items-center gap-2">
            <span className="bg-yellow-50 text-yellow-700 text-sm font-semibold px-2 py-0.5 rounded-md">
              {formattedRating}
            </span>
            <span className="text-sm text-gray-500">{getRatingLabel(rating)}</span>
            <span className="text-sm text-gray-400">· {Math.floor(Math.random() * 50 + 5)} valoraciones</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500 ml-0.5">{formattedRating}</span>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Volver</span>
        </button>
        <button
          onClick={() => navigate({ page: 'store', slug })}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span className="text-lg">{store.logo}</span>
          <span className="font-semibold text-sm">{store.name}</span>
        </button>
        <button onClick={shareProduct} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Compartir</span>
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-gray-400">
          <button
            onClick={() => navigate({ page: 'landing' })}
            className="hover:text-gray-600 transition-colors"
          >
            Inicio
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => navigate({ page: 'store', slug })}
            className="hover:text-gray-600 transition-colors"
          >
            {store.name}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto px-4 py-6 md:py-10"
      >
        {/* Main content: Image + Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 sticky top-16">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = imgFallback
                }}
              />
              {/* Badges */}
              <ProductBadges product={product} primaryColor={store.colors.primary} />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            {category && (
              <div className="flex items-center gap-1.5 mb-3">
                <Tag className="w-3.5 h-3.5" style={{ color: store.colors.primary }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: store.colors.primary }}
                >
                  {category.name}
                </span>
              </div>
            )}

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating & Featured Badge */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {renderStars(product.rating, true)}
              {product.featured && (
                <Badge className="bg-amber-100 text-amber-700 text-xs font-semibold border-0">
                  Destacado
                </Badge>
              )}
              {isNewProduct && (
                <Badge className="bg-green-100 text-green-700 text-xs font-semibold border-0">
                  Nuevo
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="mt-6 p-5 rounded-2xl" style={{ backgroundColor: store.colors.primary + '08' }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ color: store.colors.primary }}
                >
                  S/{product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      S/{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm mt-2 font-medium" style={{ color: store.colors.primary }}>
                  Ahorras S/{savings.toFixed(2)} con este precio especial
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                Descripcion del producto
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description || 'Este producto no tiene una descripcion detallada todavia. Contacta al vendedor por WhatsApp para mas informacion.'}
              </div>
            </div>

            {/* Features / Benefits */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50">
                <Truck className="w-5 h-5 mb-1.5" style={{ color: store.colors.primary }} />
                <span className="text-[11px] text-gray-500 font-medium">Envio disponible</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50">
                <ShieldCheck className="w-5 h-5 mb-1.5" style={{ color: store.colors.primary }} />
                <span className="text-[11px] text-gray-500 font-medium">Pago seguro</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50">
                <RotateCcw className="w-5 h-5 mb-1.5" style={{ color: store.colors.primary }} />
                <span className="text-[11px] text-gray-500 font-medium">Devoluciones</span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-8 flex flex-col gap-3">
              <Button
                className="w-full text-white gap-3 rounded-2xl py-6 text-base font-bold shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#25D366' }}
                onClick={openWhatsApp}
              >
                <MessageCircle className="w-5 h-5" />
                Comprar por WhatsApp
              </Button>
              <p className="text-xs text-center text-gray-400">
                Se abrira WhatsApp para coordinar la compra con el vendedor
              </p>
            </div>

            {/* Yape/Plin Payment Option */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowYape(!showYape)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-purple-200 hover:border-purple-300 bg-purple-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Pagar con Yape / Plin</p>
                    <p className="text-xs text-gray-500">Escanea el QR y confirma tu pago</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showYape ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showYape && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 mt-2 rounded-2xl border border-purple-100 bg-white space-y-4">
                      {/* QR Code */}
                      <div className="text-center">
                        <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(store.whatsappNumber)}&bgcolor=ffffff&color=7C3AED`}
                            alt="QR Yape/Plin"
                            className="w-48 h-48"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-3">Escanea con Yape o Plin</p>
                      </div>

                      {/* Amount to pay */}
                      <div className="text-center p-4 rounded-xl bg-purple-50">
                        <p className="text-xs text-gray-500 mb-1">Monto a transferir</p>
                        <p className="text-2xl font-bold" style={{ color: store.colors.primary }}>
                          S/{product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">por {product.name}</p>
                      </div>

                      {/* Steps */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-purple-600">1</span>
                          </div>
                          <p className="text-sm text-gray-600">Abre <b>Yape</b> o <b>Plin</b> en tu celular</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-purple-600">2</span>
                          </div>
                          <p className="text-sm text-gray-600">Escanea el codigo QR y transfiere <b>S/{product.price.toFixed(2)}</b></p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-purple-600">3</span>
                          </div>
                          <p className="text-sm text-gray-600">Confirma tu pago enviando el comprobante por WhatsApp</p>
                        </div>
                      </div>

                      {/* Confirm via WhatsApp */}
                      <Button
                        className="w-full text-white gap-3 rounded-2xl py-5 text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#25D366' }}
                        onClick={() => {
                          const msg = encodeURIComponent(
                            `Hola! Acabo de realizar el pago por Yape/Plin de S/${product.price.toFixed(2)} por: ${product.name}\nPor favor confirmar mi pedido.`
                          )
                          window.open(`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank')
                        }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        Enviar comprobante por WhatsApp
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Store info */}
            <div className="mt-8 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg">
                  {store.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{store.name}</p>
                  <p className="text-xs text-gray-400">Vendedor verificado en TiendApp</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-lg gap-1"
                  onClick={() => navigate({ page: 'store', slug })}
                >
                  Ver tienda
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Productos relacionados</h2>
              <button
                onClick={() => navigate({ page: 'store', slug })}
                className="text-sm font-medium flex items-center gap-1 transition-colors hover:underline"
                style={{ color: store.colors.primary }}
              >
                Ver todo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <motion.div
                  key={rp.id}
                  whileHover={{ y: -4 }}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate({ page: 'product-detail', slug, productId: rp.id })}
                >
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={rp.imageUrl}
                      alt={rp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = imgFallback
                      }}
                    />
                    <ProductBadges product={rp} primaryColor={store.colors.primary} />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 truncate">{rp.name}</h3>
                    {rp.rating > 0 && (
                      <div className="mt-1">
                        {renderStars(rp.rating)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: store.colors.primary }}
                      >
                        S/{rp.price.toFixed(2)}
                      </span>
                      {rp.originalPrice && (
                        <span className="text-xs text-gray-300 line-through">
                          S/{rp.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Back to store link */}
        <div className="mt-12 pb-8 text-center">
          <button
            onClick={() => navigate({ page: 'store', slug })}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
            style={{ color: store.colors.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Ver todos los productos de {store.name}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
