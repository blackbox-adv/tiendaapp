export type PageRoute =
  | { page: 'landing' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'reset-password' }
  | { page: 'wizard'; step?: number }
  | { page: 'store'; slug: string }
  | { page: 'product-detail'; slug: string; productId: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'terms' }
  | { page: 'privacy' }
  | { page: 'dashboard' }
  | { page: 'dashboard-products' }
  | { page: 'dashboard-product-form'; productId?: string }
  | { page: 'dashboard-settings' }
  | { page: 'dashboard-templates' }
  | { page: 'dashboard-plan' }
  | { page: 'dashboard-qr' }
  | { page: 'dashboard-popup' }
  | { page: 'admin' }
  | { page: 'admin-stores' }
  | { page: 'admin-users' }
  | { page: 'admin-plans' }
  | { page: 'admin-payments' }
  | { page: 'admin-settings' }
  | { page: 'admin-notifications' }

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'owner' | 'admin' | 'store_owner' | 'super_admin'
  planId: string
  storeId: string | null
  isActive: boolean
  createdAt: string
}

// Opción de envío que la tienda ofrece (ej: "Delivery en Lima", S/10, 24h)
export interface ShippingOption {
  label: string
  price: number | null   // null o 0 = gratis
  time: string           // tiempo estimado ("24 horas", "2-3 días")
}

// Método de pago local de cualquier país (Mercado Pago, Nequi, Sinpe Móvil, etc.)
export interface OtherPayment {
  label: string
  number: string
}

export interface Store {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  categoryId: string
  planId: string
  colors: { primary: string; secondary: string }
  whatsappNumber: string
  template: 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist' | 'bodega' | 'sabor' | 'moda'
  bannerUrl: string
  hasShipping: boolean
  hasSecurePayment: boolean
  hasReturns: boolean
  popupEnabled: boolean
  popupType: 'product' | 'custom'
  popupProductId: string | null
  popupCustomImage: string | null
  popupTitle: string | null
  popupButtonText: string
  yapeQrUrl: string | null
  plinQrUrl: string | null
  yapeNumber: string | null
  plinNumber: string | null
  otherPayments?: OtherPayment[]
  shippingOptions?: ShippingOption[]
  announcementText?: string | null
  announcementLink?: string | null
  userId: string
  isActive: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  categoryId: string
  imageUrl: string
  images: string[]      // Array of additional image URLs for gallery
  color: string | null  // Product color variant
  stock?: number        // -1 = unlimited, 0 = out of stock, >0 = available units (default: -1)
  isActive: boolean
  featured: boolean
  rating: number
  storeId: string
  createdAt: string
}

export interface StoreOrder {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'cancelled'
  customerName: string
  customerPhone: string
  customerEmail: string | null
  totalAmount: number
  items: Array<{ productId: string; name: string; price: number; quantity: number; imageUrl: string }>
  whatsappMessage: string | null
  notes: string | null
  storeId: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
}

export interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  productLimit: number
  isPopular: boolean
  icon: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  storeName: string
  comment: string
  rating: number
  avatar: string
}
