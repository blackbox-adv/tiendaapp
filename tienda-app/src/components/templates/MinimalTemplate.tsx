'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Camera, MapPin, Phone, Star } from 'lucide-react'

interface StoreData {
  id: string; name: string; description?: string; phone?: string; whatsapp?: string;
  email?: string; address?: string; instagram?: string; template?: string; category?: string;
  primaryColor?: string; secondaryColor?: string;
}
interface ProductData {
  id: string; name: string; description?: string; price: number; originalPrice?: number;
  images: { id: string; url: string; alt?: string; isPrimary?: boolean }[]
}

interface TemplateProps {
  store: StoreData
  products: ProductData[]
  showWhatsApp?: boolean
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

export default function MinimalTemplate({ store, products, showWhatsApp }: TemplateProps) {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-100 py-8 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-gray-900">{store.name}</h1>
        {store.description && <p className="text-gray-400 mt-2 max-w-md mx-auto text-sm">{store.description}</p>}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          {store.instagram && <span>@{store.instagram.replace('@','')}</span>}
          {store.address && <span>{store.address}</span>}
        </div>
      </header>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-50 overflow-hidden mb-3 relative">
                  {p.images[0] ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full bg-gray-100" />}
                  {p.originalPrice && <span className="absolute top-2 left-2 bg-[#e91e63] text-white text-[10px] px-2 py-0.5 rounded-full">-{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>}
                </div>
                <h3 className="text-sm font-medium text-gray-900 tracking-wide">{p.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-light text-gray-900">S/ {p.price.toLocaleString('es-PE')}</span>
                  {p.originalPrice && <span className="text-xs text-gray-300 line-through">S/ {p.originalPrice.toLocaleString('es-PE')}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {products.length === 0 && <p className="text-center text-gray-300 py-20 text-sm">Próximamente</p>}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-300">
        <p>© {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
        {store.instagram && <div className="flex items-center justify-center gap-1.5 mt-2 text-gray-400"><Camera className="h-3.5 w-3.5" /> {store.instagram}</div>}
      </footer>

      {showWhatsApp && store.whatsapp && <WhatsAppFloat number={store.whatsapp} />}
    </div>
  )
}
