'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Camera, Phone, Star, Search, Share2 } from 'lucide-react'

interface StoreData { id: string; name: string; description?: string; phone?: string; whatsapp?: string; email?: string; address?: string; instagram?: string; template?: string; category?: string; primaryColor?: string; secondaryColor?: string }
interface ProductData { id: string; name: string; description?: string; price: number; originalPrice?: number; images: { id: string; url: string; alt?: string; isPrimary?: boolean }[]; rating?: number }
interface StoreFeatures { showSearch: boolean; showWhatsApp: boolean; showRatings: boolean; showDiscountBadge: boolean; showShareButton: boolean; showWatermark: boolean; showInstagram: boolean; animations: boolean }

function RatingStars({ rating, gold }: { rating?: number; gold: string }) {
  if (!rating || rating <= 0) return null
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} className="w-3 h-3" style={{ color: gold }} fill={gold} />)}
      {half > 0 && <Star key="h" className="w-3 h-3" style={{ color: gold }} fill={gold} style2={{ clipPath: 'inset(0 50% 0 0)' } as any} />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} className="w-3 h-3" style={{ color: gold + '33' }} />)}
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
    <button onClick={handleShare} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors">
      <Share2 className="w-3.5 h-3.5 text-white/70" />
      {copied && <span className="absolute -bottom-6 text-[10px] text-white/50">Copiado!</span>}
    </button>
  )
}

export default function EleganceTemplate({ store, products, showWhatsApp, features }: { store: StoreData; products: ProductData[]; showWhatsApp?: boolean; features?: StoreFeatures }) {
  const [searchQuery, setSearchQuery] = useState('')
  const gold = store.secondaryColor || '#c8a456'
  const dark = store.primaryColor || '#0a0a0a'
  const f = features || { showSearch: false, showRatings: false, showDiscountBadge: false, showShareButton: false, showWatermark: false, showInstagram: false, animations: false }

  const filtered = f.showSearch && searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : products

  const Wrapper = f.animations ? motion.div : 'div' as any

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: dark }}>
      {/* Header */}
      <header className="border-b py-10 px-4 text-center" style={{ borderColor: gold + '33' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-12" style={{ backgroundColor: gold }} />
            <Star className="w-4 h-4" style={{ color: gold }} fill={gold} />
            <div className="h-px w-12" style={{ backgroundColor: gold }} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-[0.15em] uppercase" style={{ color: gold }}>{store.name}</h1>
          {store.description && <p className="text-white/40 mt-3 text-sm tracking-wider max-w-lg mx-auto">{store.description}</p>}
        </div>
      </header>

      {/* Search Bar - only Pro/Premium */}
      {f.showSearch && (
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: gold + '44' }} />
            <input
              type="text"
              placeholder="Buscar en la colección..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 transition"
              style={{ borderColor: gold + '22', '--tw-ring-color': gold + '33' } as any}
            />
          </div>
        </div>
      )}

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-center text-white/60 text-xs uppercase tracking-[0.3em] mb-10">Colección Exclusiva</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <Wrapper key={p.id} {...(f.animations ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } } : {})}>
              <div className="group cursor-pointer relative overflow-hidden" style={{ border: `1px solid ${gold}22` }}>
                <div className="aspect-square overflow-hidden bg-black/50 relative">
                  {p.images[0] ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 group-hover:brightness-75" /> : <div className="w-full h-full bg-black/30" />}
                  {f.showDiscountBadge && p.originalPrice && (
                    <span className="absolute top-3 left-3 text-white text-[10px] px-2 py-0.5 rounded-sm font-semibold tracking-wider uppercase" style={{ backgroundColor: gold }}>-{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>
                  )}
                  {f.showShareButton && <ShareButton productName={p.name} />}
                </div>
                <div className="p-5" style={{ backgroundColor: '#111' }}>
                  <h3 className="font-light text-white tracking-wider text-sm uppercase">{p.name}</h3>
                  {p.description && <p className="text-white/30 text-xs mt-1 line-clamp-2">{p.description}</p>}
                  {f.showRatings && <div className="mt-2"><RatingStars rating={p.rating} gold={gold} /></div>}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-light" style={{ color: gold }}>S/ {p.price.toLocaleString('es-PE')}</span>
                    {p.originalPrice && <span className="text-xs text-white/20 line-through">S/ {p.originalPrice.toLocaleString('es-PE')}</span>}
                  </div>
                </div>
                {/* Gold hover border */}
                <div className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm" style={{ borderColor: gold }} />
              </div>
            </Wrapper>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-white/20 py-20 tracking-widest text-sm">{f.showSearch && searchQuery ? 'NO SE ENCONTRARON RESULTADOS' : 'COLECCIÓN PRÓXIMAMENTE'}</p>}
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: `1px solid ${gold}22` }}>
        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: gold + '88' }}>© {new Date().getFullYear()} {store.name}</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          {f.showInstagram && store.instagram && <span className="text-white/30 text-xs">{store.instagram}</span>}
          {store.phone && <span className="text-white/30 text-xs">{store.phone}</span>}
        </div>
        {/* Watermark - only Free plan */}
        {f.showWatermark && (
          <div className="mt-3">
            <a href="/" className="text-[10px] tracking-wider uppercase transition-colors" style={{ color: gold + '22' }}>Creado con TiendaApp</a>
          </div>
        )}
      </footer>

      {showWhatsApp && store.whatsapp && (
        <a href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Hola, me interesa su colección')}`} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
          style={{ backgroundColor: gold }}>
          <MessageCircle className="w-7 h-7" style={{ color: dark }} strokeWidth={2.5} />
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: gold }} />
        </a>
      )}
    </div>
  )
}
