'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Gift, Sparkles, Percent } from 'lucide-react'
import type { Store, Product } from '@/lib/types'

interface PromoPopupProps {
  store: Store
  products: Product[]
  onProductClick?: (productId: string) => void
}

export function PromoPopup({ store, products, onProductClick }: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissPermanently, setDismissPermanently] = useState(false)
  const [popupProduct, setPopupProduct] = useState<Product | null>(null)

  // Only render if popup is enabled and store has a paid plan
  const isPaidPlan = store.planId && store.planId !== 'free'
  const shouldRender = store.popupEnabled === true && isPaidPlan

  useEffect(() => {
    if (!shouldRender) return

    // Check if popup was dismissed
    const dismissed = localStorage.getItem(`popup-dismissed-${store.id}`)
    if (dismissed === 'true') return

    // Determine which product to feature
    if (store.popupType === 'product' && store.popupProductId) {
      const found = products.find((p) => p.id === store.popupProductId && p.isActive)
      if (found) {
        setPopupProduct(found)
      }
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [store.id, store.popupEnabled, store.popupType, store.popupProductId, products, shouldRender])

  const handleClose = () => {
    setIsVisible(false)
    if (dismissPermanently) {
      localStorage.setItem(`popup-dismissed-${store.id}`, 'true')
    }
  }

  const handleCtaClick = () => {
    setIsVisible(false)
    if (dismissPermanently) {
      localStorage.setItem(`popup-dismissed-${store.id}`, 'true')
    }
    // Navigate to product if it's a product popup
    if (store.popupType === 'product' && popupProduct && onProductClick) {
      onProductClick(popupProduct.id)
    }
  }

  // Determine what to display based on popup type
  const isProductType = store.popupType === 'product'
  const isCustomType = store.popupType === 'custom'
  const displayTitle = store.popupTitle || (isProductType ? '¡Oferta especial!' : '¡Promoción exclusiva!')
  const ctaText = store.popupButtonText || 'Ver oferta'

  // For product type, we need the product to show
  if (isProductType && !popupProduct) return null
  // For custom type, we need the custom image
  if (isCustomType && !store.popupCustomImage) return null

  // Calculate discount percentage for product type
  const discountPercent = isProductType && popupProduct?.originalPrice && Number(popupProduct.originalPrice) > Number(popupProduct.price)
    ? Math.round((1 - Number(popupProduct.price) / Number(popupProduct.originalPrice)) * 100)
    : 0

  // Determine image source
  const imageSrc = isProductType && popupProduct
    ? popupProduct.imageUrl
    : isCustomType && store.popupCustomImage
    ? store.popupCustomImage
    : ''

  return (
    <AnimatePresence>
      {isVisible && shouldRender && (isProductType ? popupProduct : isCustomType ? store.popupCustomImage : false) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Overlay backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Popup card */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative confetti/sparkle banner at top */}
            <div className="relative h-2 overflow-hidden" style={{ background: `linear-gradient(90deg, ${store.colors.primary}, #F59E0B, #EC4899, ${store.colors.primary})` }}>
              {/* Animated shimmer */}
              <div className="absolute inset-0 opacity-50" style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                animation: 'shimmer 2s infinite',
              }} />
            </div>

            {/* Gift/Offer header strip */}
            <div className="relative py-3 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: store.colors.primary }}>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-bold tracking-wide uppercase">Oferta especial</span>
              <Gift className="w-4 h-4 text-yellow-300" />
              {/* Decorative dots */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30" />
            </div>

            {/* Image section */}
            <div className="relative aspect-[3/2] overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={isProductType && popupProduct ? popupProduct.name : displayTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f5f5f5" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ccc">Imagen no disponible</text></svg>'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-gray-300" />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Prominent discount badge */}
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3">
                  <div className="relative">
                    <div className="px-3 py-1.5 rounded-xl text-white text-sm font-extrabold shadow-lg flex items-center gap-1.5" style={{ backgroundColor: '#EF4444' }}>
                      <Percent className="w-3.5 h-3.5" />
                      -{discountPercent}%
                    </div>
                    {/* Badge shine effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white/30 rounded-full blur-[2px]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Product name on image (for product type) */}
              {isProductType && popupProduct && !displayTitle && (
                <div className="absolute bottom-3 left-3 right-12">
                  <h3 className="text-white font-bold text-lg leading-tight truncate drop-shadow-lg">
                    {popupProduct.name}
                  </h3>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{displayTitle}</h3>

              {/* Product name (if different from title) */}
              {isProductType && popupProduct && displayTitle && popupProduct.name !== displayTitle && (
                <p className="text-sm text-gray-500 mb-2 truncate">{popupProduct.name}</p>
              )}

              {/* Price (only for product type) */}
              {isProductType && popupProduct && (
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: store.colors.primary }}
                  >
                    S/{Number(popupProduct.price).toFixed(2)}
                  </span>
                  {popupProduct.originalPrice && Number(popupProduct.originalPrice) > Number(popupProduct.price) && (
                    <span className="text-base text-gray-400 line-through">
                      S/{Number(popupProduct.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              {/* CTA button */}
              <button
                onClick={handleCtaClick}
                className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: store.colors.primary }}
              >
                <Gift className="w-4 h-4" />
                {ctaText}
              </button>

              {/* Dismiss checkbox */}
              <label className="flex items-center gap-2 mt-3 cursor-pointer justify-center">
                <input
                  type="checkbox"
                  checked={dismissPermanently}
                  onChange={(e) => setDismissPermanently(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300"
                  style={{ accentColor: store.colors.primary }}
                />
                <span className="text-xs text-gray-400">No mostrar de nuevo</span>
              </label>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
