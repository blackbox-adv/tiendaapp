'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ModernaTemplate } from '@/components/store-templates/ModernaTemplate'
import { VibranteTemplate } from '@/components/store-templates/VibranteTemplate'
import { ClasicaTemplate } from '@/components/store-templates/ClasicaTemplate'
import { LuxuryTemplate } from '@/components/store-templates/LuxuryTemplate'
import { MinimalistTemplate } from '@/components/store-templates/MinimalistTemplate'
import { ProductDetailView } from '@/components/store-templates/ProductDetailView'
import { ArrowLeft, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Store, Product } from '@/lib/types'

const demoStores: Record<string, Store> = {
  luxury: {
    id: 'demo-luxury',
    name: 'Maison Dorée',
    slug: 'demo-luxury',
    description: 'Joyería y accesorios de alta gama. Piezas exclusivas para quienes buscan lo extraordinario.',
    logo: '💎',
    categoryId: 'accesorios',
    planId: 'premium',
    colors: { primary: '#c8a456', secondary: '#1a1a2e' },
    whatsappNumber: '+51999990001',
    template: 'luxury',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: false,
  },
  minimalist: {
    id: 'demo-minimalist',
    name: 'Nōva Studio',
    slug: 'demo-minimalist',
    description: 'Diseño contemporáneo para la vida moderna. Menos es más.',
    logo: '⬜',
    categoryId: 'hogar',
    planId: 'premium',
    colors: { primary: '#1a1a1a', secondary: '#f5f5f5' },
    whatsappNumber: '+51999990002',
    template: 'minimalist',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
  },
  moderna: {
    id: 'demo-moderna',
    name: 'TechStore',
    slug: 'demo-moderna',
    description: 'Tecnología y gadgets de última generación.',
    logo: '💻',
    categoryId: 'electronica',
    planId: 'pro',
    colors: { primary: '#7C3AED', secondary: '#10B981' },
    whatsappNumber: '+51999990003',
    template: 'moderna',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
  },
  vibrante: {
    id: 'demo-vibrante',
    name: 'Dulce Perú',
    slug: 'demo-vibrante',
    description: 'Postres artesanales y dulces peruanos.',
    logo: '🧁',
    categoryId: 'alimentos',
    planId: 'pro',
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4' },
    whatsappNumber: '+51999990004',
    template: 'vibrante',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: false, hasReturns: false,
  },
  clasica: {
    id: 'demo-clasica',
    name: 'Boutique Élégance',
    slug: 'demo-clasica',
    description: 'Moda y accesorios de alta calidad.',
    logo: '👗',
    categoryId: 'ropa',
    planId: 'pro',
    colors: { primary: '#D97706', secondary: '#FDE68A' },
    whatsappNumber: '+51999990005',
    template: 'clasica',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
  },
}

const demoProducts: Record<string, Product[]> = {
  luxury: [
    { id: 'dl1', name: 'Collar Imperial Dorado', description: 'Collar de oro 18K con diamantes incrustados. Pieza exclusiva de colección limitada.', price: 2850.0, originalPrice: 3500.0, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-01-15T10:00:00.000Z' },
    { id: 'dl2', name: 'Anillo Brillante Eterno', description: 'Anillo de compromiso con zafiro azul y halo de diamantes.', price: 4200.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600', isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dl3', name: 'Pulsera Cadena Elegance', description: 'Pulsera de oro blanco con cierre de seguridad y grabado personalizado.', price: 1800.0, originalPrice: 2200.0, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600', isActive: true, featured: false, rating: 4.5, storeId: 'demo-luxury', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dl4', name: 'Aros Perla Negra', description: 'Aros de perla negra Tahitiana montados en oro rosa 14K.', price: 960.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-luxury', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dl5', name: 'Reloj Clásico Dorado', description: 'Reloj suizo con caja de oro rosa 18K y correa de cocodrilo.', price: 6500.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dl6', name: 'Gargantilla Riviera', description: 'Gargantilla Riviera de diamantes en oro blanco 18K.', price: 3800.0, originalPrice: 4200.0, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', isActive: true, featured: false, rating: 4.5, storeId: 'demo-luxury', createdAt: '2024-04-10T10:00:00.000Z' },
  ],
  minimalist: [
    { id: 'dm1', name: 'Lámpara Arco', description: 'Lámpara de piso minimalista en acero negro mate con luz cálida.', price: 489.0, originalPrice: null, categoryId: 'hogar', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600', isActive: true, featured: true, rating: 4.5, storeId: 'demo-minimalist', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dm2', name: 'Vaso Cerámico Set', description: 'Set de 4 vasos de cerámica handmade. Tonos neutros.', price: 120.0, originalPrice: null, categoryId: 'hogar', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-02-15T10:00:00.000Z' },
    { id: 'dm3', name: 'Cuero Stand Tablet', description: 'Soporte de cuero vegano para tablet. Diseño plegable.', price: 189.0, originalPrice: 220.0, categoryId: 'electronica', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', isActive: true, featured: true, rating: 4.5, storeId: 'demo-minimalist', createdAt: '2024-03-05T10:00:00.000Z' },
    { id: 'dm4', name: 'Difusor Aroma', description: 'Difusor ultrasónico con luz LED ambiental. Blanco mate.', price: 145.0, originalPrice: null, categoryId: 'hogar', imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-03-20T10:00:00.000Z' },
    { id: 'dm5', name: 'Agenda Premium', description: 'Agenda 2024 en cuero italiano. Tapas duras, papel premium.', price: 95.0, originalPrice: null, categoryId: 'otros', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dm6', name: 'Maceta Concreto', description: 'Maceta de concreto minimalista. Ideal para suculentas.', price: 65.0, originalPrice: null, categoryId: 'hogar', imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600', isActive: true, featured: false, rating: 3.5, storeId: 'demo-minimalist', createdAt: '2024-04-15T10:00:00.000Z' },
    { id: 'dm7', name: 'Speaker Portátil', description: 'Speaker Bluetooth con diseño minimalista. 12h de batería.', price: 275.0, originalPrice: null, categoryId: 'electronica', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', isActive: true, featured: true, rating: 5, storeId: 'demo-minimalist', createdAt: '2024-05-01T10:00:00.000Z' },
    { id: 'dm8', name: 'Taza Cerámica', description: 'Taza de cerámica artesanal con acabado esmaltado natural.', price: 45.0, originalPrice: null, categoryId: 'hogar', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-05-10T10:00:00.000Z' },
  ],
  moderna: [
    { id: 'dmo1', name: 'AirPods Pro Max', description: 'Cancelación de ruido activa, sonido espacial.', price: 849.0, originalPrice: 999.0, categoryId: 'electronica', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', isActive: true, featured: true, rating: 5, storeId: 'demo-moderna', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dmo2', name: 'Smart Watch Series 9', description: 'Pantalla AMOLED, GPS, salud avanzada.', price: 1250.0, originalPrice: null, categoryId: 'electronica', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', isActive: true, featured: true, rating: 4.5, storeId: 'demo-moderna', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dmo3', name: 'Cargador MagSafe', description: 'Carga inalámbrica magnética 15W.', price: 189.0, originalPrice: null, categoryId: 'electronica', imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dmo4', name: 'Hub USB-C 8 en 1', description: 'HDMI, USB 3.0, SD, Ethernet y más.', price: 159.0, originalPrice: 199.0, categoryId: 'electronica', imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-03-15T10:00:00.000Z' },
  ],
  vibrante: [
    { id: 'dv1', name: 'Tres Leches Especial', description: 'Bizcocho de tres leches con frutos rojos y merengue.', price: 45.0, originalPrice: null, categoryId: 'alimentos', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', isActive: true, featured: true, rating: 5, storeId: 'demo-vibrante', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dv2', name: 'Cupcakes Artesanales x6', description: 'Set de 6 cupcakes con sabores variados.', price: 55.0, originalPrice: null, categoryId: 'alimentos', imageUrl: 'https://images.unsplash.com/photo-1558024920-b41e1887dc32?w=600', isActive: true, featured: false, rating: 4.5, storeId: 'demo-vibrante', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dv3', name: 'Churros Rellenos x12', description: 'Churros rellenos de dulce de leche con chocolate.', price: 35.0, originalPrice: null, categoryId: 'alimentos', imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600', isActive: true, featured: true, rating: 4, storeId: 'demo-vibrante', createdAt: '2024-03-01T10:00:00.000Z' },
  ],
  clasica: [
    { id: 'dc1', name: 'Blazer Oversize Negro', description: 'Blazer oversize con corte moderno.', price: 280.0, originalPrice: 350.0, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', isActive: true, featured: true, rating: 5, storeId: 'demo-clasica', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dc2', name: 'Vestido Midi Floral', description: 'Vestido midi con estampado floral exclusivo.', price: 189.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-clasica', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dc3', name: 'Bufanda de Seda', description: 'Bufanda de seda pura con estampado geométrico.', price: 120.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600', isActive: true, featured: false, rating: 4, storeId: 'demo-clasica', createdAt: '2024-03-01T10:00:00.000Z' },
  ],
}

export function DemoTemplateClient({ template }: { template: string }) {
  const store = demoStores[template]
  const products = demoProducts[template] || []
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  if (!store) return null

  const isPremium = template === 'luxury' || template === 'minimalist'

  // Populate Zustand store so ProductDetailView can find the data
  const setStoreData = () => {
    useAppStore.setState({
      stores: [store],
      products: products,
      currentStore: store,
    })
  }

  // Initialize Zustand on mount (useEffect instead of render-time mutation)
  useEffect(() => {
    setStoreData()
  }, [])

  // Handle product click from templates
  const handleProductClick = (productId: string) => {
    setStoreData()
    setSelectedProductId(productId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle back from product detail
  const handleBackToStore = () => {
    setSelectedProductId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // If a product is selected, show ProductDetailView
  if (selectedProductId) {
    return (
      <div className="relative">
        {/* Demo Banner */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className={`text-center py-2 text-xs font-medium ${isPremium ? 'bg-gradient-to-r from-[#c8a456] to-[#f0d078] text-[#1a1a2e]' : 'bg-violet-600 text-white'}`}>
            <div className="flex items-center justify-center gap-2">
              {isPremium ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Vista previa de la plantilla {store.name} — {isPremium ? 'Disponible en plan Premium' : 'Disponible en planes Pro y Premium'}</span>
            </div>
          </div>
        </div>
        {/* Spacer for fixed banner */}
        <div className="h-[40px]" />
        <ProductDetailView slug={store.slug} productId={selectedProductId} onDemoBack={handleBackToStore} />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className={`text-center py-2 text-xs font-medium ${isPremium ? 'bg-gradient-to-r from-[#c8a456] to-[#f0d078] text-[#1a1a2e]' : 'bg-violet-600 text-white'}`}>
          <div className="flex items-center justify-center gap-2">
            {isPremium ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Vista previa de la plantilla {store.name} — {isPremium ? 'Disponible en plan Premium' : 'Disponible en planes Pro y Premium'}</span>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <Button
            onClick={() => window.location.href = '/register'}
            size="sm"
            className={`rounded-lg text-xs font-semibold ${isPremium ? 'bg-[#c8a456] hover:bg-[#b8943e] text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
          >
            Crear mi tienda
          </Button>
        </div>
      </div>

      {/* Spacer for fixed banner */}
      <div className="h-[76px]" />

      {/* Template — pass onProductClick handler */}
      {template === 'luxury' && <LuxuryTemplate store={store} products={products} storeSlug={store.slug} planId="premium" onProductClick={handleProductClick} />}
      {template === 'minimalist' && <MinimalistTemplate store={store} products={products} storeSlug={store.slug} planId="premium" onProductClick={handleProductClick} />}
      {template === 'moderna' && <ModernaTemplate store={store} products={products} storeSlug={store.slug} planId="pro" onProductClick={handleProductClick} />}
      {template === 'vibrante' && <VibranteTemplate store={store} products={products} storeSlug={store.slug} planId="pro" onProductClick={handleProductClick} />}
      {template === 'clasica' && <ClasicaTemplate store={store} products={products} storeSlug={store.slug} planId="pro" onProductClick={handleProductClick} />}
    </div>
  )
}
