'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag } from 'lucide-react'
import type { Store, Product } from '@/lib/types'

interface PromoPopupProps {
  store: Store
  products: Product[]
  onProductClick?: (productId: string) => void
}

export function PromoPopup({ store, products, onProductClick }: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissPermanently, setDismissPermanently] = useState(false)
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (products.length === 0) return

    // Check if popup was dismissed
    const dismissed = localStorage.getItem(`popup-dismissed-${store.id}`)
    if (dismissed === 'true') return

    // Find featured product, or newest product
    const featured = products.find((p) => p.featured && p.isActive)
    const newest = [...products]
      .filter((p) => p.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    const product = featured || newest

    if (!product) return

    setFeaturedProduct(product)

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [store.id, products])

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
    if (featuredProduct && onProductClick) {
      onProductClick(featuredProduct.id)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && featuredProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Overlay backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Popup card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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

            {/* Product image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={featuredProduct.imageUrl}
                alt={featuredProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f5f5f5" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ccc">Imagen no disponible</text></svg>'
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Offer badge */}
              <div
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-lg"
                style={{ backgroundColor: store.colors.primary }}
              >
                <Tag className="w-3 h-3" />
                Oferta
              </div>
              {/* Product name on image */}
              <div className="absolute bottom-3 left-3 right-12">
                <h3 className="text-white font-bold text-lg leading-tight truncate">
                  {featuredProduct.name}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-2xl font-bold"
                  style={{ color: store.colors.primary }}
                >
                  S/{Number(featuredProduct.price).toFixed(2)}
                </span>
                {featuredProduct.originalPrice && Number(featuredProduct.originalPrice) > Number(featuredProduct.price) && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      S/{Number(featuredProduct.originalPrice).toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      -{Math.round((1 - Number(featuredProduct.price) / Number(featuredProduct.originalPrice)) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* CTA button */}
              <button
                onClick={handleCtaClick}
                className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: store.colors.primary }}
              >
                Ver oferta
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
