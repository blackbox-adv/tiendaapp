'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Camera, MapPin, Phone, Star } from 'lucide-react'

interface StoreData { id: string; name: string; description?: string; phone?: string; whatsapp?: string; email?: string; address?: string; instagram?: string; template?: string; category?: string; primaryColor?: string; secondaryColor?: string }
interface ProductData { id: string; name: string; description?: string; price: number; originalPrice?: number; images: { id: string; url: string; alt?: string; isPrimary?: boolean }[] }

export default function EleganceTemplate({ store, products, showWhatsApp }: { store: StoreData; products: ProductData[]; showWhatsApp?: boolean }) {
  const gold = store.secondaryColor || '#c8a456'
  const dark = store.primaryColor || '#0a0a0a'

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

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-center text-white/60 text-xs uppercase tracking-[0.3em] mb-10">Colección Exclusiva</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="group cursor-pointer relative overflow-hidden" style={{ border: `1px solid ${gold}22` }}>
                <div className="aspect-square overflow-hidden bg-black/50">
                  {p.images[0] ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 group-hover:brightness-75" /> : <div className="w-full h-full bg-black/30" />}
                </div>
                <div className="p-5" style={{ backgroundColor: '#111' }}>
                  <h3 className="font-light text-white tracking-wider text-sm uppercase">{p.name}</h3>
                  {p.description && <p className="text-white/30 text-xs mt-1 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-light" style={{ color: gold }}>S/ {p.price.toLocaleString('es-PE')}</span>
                    {p.originalPrice && <span className="text-xs text-white/20 line-through">S/ {p.originalPrice.toLocaleString('es-PE')}</span>}
                  </div>
                </div>
                {/* Gold hover border */}
                <div className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm" style={{ borderColor: gold }} />
              </div>
            </motion.div>
          ))}
        </div>
        {products.length === 0 && <p className="text-center text-white/20 py-20 tracking-widest text-sm">COLECCIÓN PRÓXIMAMENTE</p>}
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: `1px solid ${gold}22` }}>
        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: gold + '88' }}>© {new Date().getFullYear()} {store.name}</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          {store.instagram && <span className="text-white/30 text-xs">{store.instagram}</span>}
          {store.phone && <span className="text-white/30 text-xs">{store.phone}</span>}
        </div>
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
