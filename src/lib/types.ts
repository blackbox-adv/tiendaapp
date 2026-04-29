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
  | { page: 'admin' }
  | { page: 'admin-stores' }
  | { page: 'admin-users' }
  | { page: 'admin-plans' }
  | { page: 'admin-settings' }

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'owner' | 'admin'
  planId: string
  storeId: string | null
  isActive: boolean
  createdAt: string
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
  template: 'moderna' | 'vibrante' | 'clasica'
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
  isActive: boolean
  featured: boolean
  rating: number
  storeId: string
  createdAt: string
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
