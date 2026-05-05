'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Camera, MapPin, Phone, Search, Star, Share2 } from 'lucide-react'

interface StoreData { id: string; name: string; description?: string; phone?: string; whatsapp?: string; email?: string; address?: string; instagram?: string; template?: string; category?: string; primaryColor?: string; secondaryColor?: string }
interface ProductData { id: string; name: string; description?: string; price: number; originalPrice?: number; images: { id: string; url: string; alt?: string; isPrimary?: boolean }[]; rating?: number }
interface StoreFeatures { showSearch: boolean; showWhatsApp: boolean; showRatings: boolean; showDiscountBadge: boolean; showShareButton: boolean; showWatermark: boolean; showInstagram: boolean; animations: boolean }

function RatingStars({ rating }: { rating?: number }) {
  if (!rating || rating <= 0) return null
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} className="w-3 h-3 text-amber-400" fill="#fbbf24" />)}
      {half > 0 && <Star key="h" className="w-3 h-3 text-amber-400" fill="#fbbf24" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} className="w-3 h-3 text-gray-200" />)}
    </div>
  )
}

function ShareButton({ productName }: { productName: string }) {
  const [copied, setCopied] = useState(false)
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: productName, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button onClick={handleShare} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center transition-colors">
      <Share2 className="w-3.5 h-3.5 text-gray-500" />
      {copied && <span className="absolute -bottom-6 text-[10px] text-gray-500">Copiado!</span>}
    </button>
  )
}

export default function SaborTemplate({ store, products, showWhatsApp, features }: { store: StoreData; products: ProductData[]; showWhatsApp?: boolean; features?: StoreFeatures }) {
  const [searchQuery, setSearchQuery] = useState('')
  const f = features || { showSearch: false, showRatings: false, showDiscountBadge: false, showShareButton: false, showWatermark: false, showInstagram: false, animations: false }

  const filtered = f.showSearch && searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : products

  const Wrapper = f.animations ? motion.div : 'div' as any

  return (
    <div className="min-h-screen bg-[#fff8f0] font-sans">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#ff6b35] to-[#e85d26] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold">{store.name}</h1>
          {store.description && <p className="text-white/80 mt-3 text-lg">{store.description}</p>}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/70">
            {store.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{store.phone}</span>}
            {store.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{store.address}</span>}
          </div>
        </div>
      </div>

      {/* Search Bar - only Pro/Premium */}
      {f.showSearch && (
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              type="text"
              placeholder="Buscar en el menú..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
            />
          </div>
        </div>
      )}

      {/* Products */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-[#2d2d2d] mb-6 text-center">Nuestros Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((p, i) => (
            <Wrapper key={p.id} {...(f.animations ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } } : {})}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] overflow-hidden relative">
                  {p.images[0] ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#f4a261]/20" />}
                  {f.showDiscountBadge && p.originalPrice && <span className="absolute top-3 left-3 bg-[#ff6b35] text-white text-xs px-3 py-1 rounded-full font-semibold">OFERTA</span>}
                  {f.showShareButton && <ShareButton productName={p.name} />}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#2d2d2d] text-lg">{p.name}</h3>
                  {p.description && <p className="text-sm text-[#666] mt-1 line-clamp-2">{p.description}</p>}
                  {f.showRatings && <div className="mt-2"><RatingStars rating={p.rating} /></div>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-[#ff6b35]">S/ {p.price.toLocaleString('es-PE')}</span>
                      {p.originalPrice && <span className="text-sm text-gray-400 line-through">S/ {p.originalPrice.toLocaleString('es-PE')}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Wrapper>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-[#999] py-20">{f.showSearch && searchQuery ? 'No encontramos ese producto' : '¡Próximamente nuevos platos!'}</p>}
      </section>

      {/* Footer */}
      <footer className="bg-[#2d2d2d] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-bold text-xl">{store.name}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-white/50">
            {f.showInstagram && store.instagram && <span>{store.instagram}</span>}
            {store.address && <span>{store.address}</span>}
          </div>
          <p className="text-xs text-white/30 mt-4">© {new Date().getFullYear()} {store.name}</p>
          {/* Watermark - only Free plan */}
          {f.showWatermark && (
            <div className="mt-3">
              <a href="/" className="text-[10px] text-white/20 hover:text-white/40 transition-colors">Creado con TiendaApp</a>
            </div>
          )}
        </div>
      </footer>

      {showWhatsApp && store.whatsapp && (
        <a href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Hola! Quiero hacer un pedido')}`} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg flex items-center justify-center transition-transform hover:scale-110">
          <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        </a>
      )}
    </div>
  )
}
