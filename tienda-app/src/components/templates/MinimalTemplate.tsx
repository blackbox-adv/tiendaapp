'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Camera, Phone, Search, Star, Share2 } from 'lucide-react'

interface StoreData {
  id: string; name: string; description?: string; phone?: string; whatsapp?: string;
  email?: string; address?: string; instagram?: string; template?: string; category?: string;
  primaryColor?: string; secondaryColor?: string;
}
interface ProductData {
  id: string; name: string; description?: string; price: number; originalPrice?: number;
  images: { id: string; url: string; alt?: string; isPrimary?: boolean }[]
  rating?: number
}
interface StoreFeatures {
  showSearch: boolean
  showWhatsApp: boolean
  showRatings: boolean
  showDiscountBadge: boolean
  showShareButton: boolean
  showWatermark: boolean
  showInstagram: boolean
  animations: boolean
}

function WhatsAppFloat({ number }: { number: string }) {
  const msg = encodeURIComponent('Hola, estoy interesado/a en sus productos')
  return (
    <a href={`https://wa.me/${number}?text=${msg}`} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg flex items-center justify-center transition-transform hover:scale-110">
      <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </a>
  )
}

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
    <button onClick={handleShare} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center transition-colors">
      <Share2 className="w-3.5 h-3.5 text-gray-500" />
      {copied && <span className="absolute -bottom-6 text-[10px] text-gray-500">Copiado!</span>}
    </button>
  )
}

export default function MinimalTemplate({ store, products, showWhatsApp, features }: { store: StoreData; products: ProductData[]; showWhatsApp?: boolean; features?: StoreFeatures }) {
  const [searchQuery, setSearchQuery] = useState('')
  const f = features || { showSearch: false, showRatings: false, showDiscountBadge: false, showShareButton: false, showWatermark: false, showInstagram: false, animations: false }

  const filtered = f.showSearch && searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : products

  const Wrapper = f.animations ? motion.div : 'div' as any
  const animProps = f.animations ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } } : {}

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-100 py-8 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-gray-900">{store.name}</h1>
        {store.description && <p className="text-gray-400 mt-2 max-w-md mx-auto text-sm">{store.description}</p>}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          {f.showInstagram && store.instagram && <span>@{store.instagram.replace('@','')}</span>}
          {store.address && <span>{store.address}</span>}
        </div>
      </header>

      {/* Search Bar - only Pro/Premium */}
      {f.showSearch && (
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
            />
          </div>
        </div>
      )}

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p, i) => (
            <Wrapper key={p.id} {...(f.animations ? { transition: { delay: i * 0.05 } } : {})}>
              <div className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-50 overflow-hidden mb-3 relative">
                  {p.images[0] ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full bg-gray-100" />}
                  {f.showDiscountBadge && p.originalPrice && <span className="absolute top-2 left-2 bg-[#e91e63] text-white text-[10px] px-2 py-0.5 rounded-full">-{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>}
                  {f.showShareButton && <ShareButton productName={p.name} />}
                </div>
                <h3 className="text-sm font-medium text-gray-900 tracking-wide">{p.name}</h3>
                {f.showRatings && <RatingStars rating={p.rating} />}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-light text-gray-900">S/ {p.price.toLocaleString('es-PE')}</span>
                  {p.originalPrice && <span className="text-xs text-gray-300 line-through">S/ {p.originalPrice.toLocaleString('es-PE')}</span>}
                </div>
              </div>
            </Wrapper>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-300 py-20 text-sm">{f.showSearch && searchQuery ? 'No se encontraron productos' : 'Próximamente'}</p>}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-300">© {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
        {f.showInstagram && store.instagram && <div className="flex items-center justify-center gap-1.5 mt-2 text-gray-400 text-xs"><Camera className="h-3.5 w-3.5" /> {store.instagram}</div>}
        {/* Watermark - only Free plan */}
        {f.showWatermark && (
          <div className="mt-4">
            <a href="/" className="text-[10px] text-gray-300 hover:text-gray-400 transition-colors">Creado con TiendaApp</a>
          </div>
        )}
      </footer>

      {showWhatsApp && <WhatsAppFloat number={store.whatsapp!} />}
    </div>
  )
}
