import { create } from 'zustand'
import type { PageRoute, User, Store, Product } from './types'
import { PLANS, MOCK_USERS, MOCK_STORES, MOCK_PRODUCTS, CATEGORIES } from './mock-data'

// ── Schema transformation helpers (API → Frontend) ──

function transformApiStore(apiStore: Record<string, unknown>): Store {
  const subs = (apiStore.subscriptions as Array<Record<string, unknown>>) || []
  const latestSub = subs.length > 0 ? subs[subs.length - 1] : null
  const planId = (latestSub?.planId as string) || 'free'

  return {
    id: apiStore.id as string,
    name: apiStore.name as string,
    slug: apiStore.slug as string,
    description: (apiStore.description as string) || '',
    logo: (apiStore.logo as string) || '🛍️',
    categoryId: (apiStore.category as string) || '',
    planId,
    colors: {
      primary: (apiStore.primaryColor as string) || '#7C3AED',
      secondary: (apiStore.secondaryColor as string) || '#10B981',
    },
    whatsappNumber: (apiStore.whatsappNumber as string) || '',
    template: (apiStore.template as 'moderna' | 'vibrante' | 'clasica') || 'moderna',
    userId: apiStore.ownerId as string,
    isActive: (apiStore.isActive as boolean) ?? true,
    createdAt: (apiStore.createdAt as string) || new Date().toISOString(),
  }
}

function transformApiUser(apiUser: Record<string, unknown>): User {
  const stores = (apiUser.stores as Array<Record<string, unknown>>) || []
  const storeId = stores.length > 0 ? stores[0].id : null

  const subs = (apiUser.subscriptions as Array<Record<string, unknown>>) || []
  const latestSub = subs.length > 0 ? subs[subs.length - 1] : null
  const planId = (latestSub?.planId as string) || 'free'

  const apiRole = apiUser.role as string

  return {
    id: apiUser.id as string,
    name: (apiUser.name as string) || '',
    email: (apiUser.email as string) || '',
    password: '',
    role: apiRole === 'super_admin' ? 'admin' : 'owner',
    planId,
    storeId: storeId as string | null,
    isActive: (apiUser.isActive as boolean) ?? true,
    createdAt: (apiUser.createdAt as string) || new Date().toISOString(),
  }
}

function transformApiProduct(apiProduct: Record<string, unknown>): Product {
  return {
    id: apiProduct.id as string,
    name: (apiProduct.name as string) || '',
    description: (apiProduct.description as string) || '',
    price: (apiProduct.price as number) || 0,
    originalPrice: (apiProduct.originalPrice as number) || null,
    categoryId: (apiProduct.category as string) || '',
    imageUrl: (apiProduct.imageUrl as string) || '',
    isActive: (apiProduct.isActive as boolean) ?? true,
    featured: (apiProduct.featured as boolean) ?? false,
    rating: (apiProduct.rating as number) || 0,
    storeId: (apiProduct.storeId as string) || '',
    createdAt: (apiProduct.createdAt as string) || new Date().toISOString(),
  }
}

// ── Token helper ──

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tiendapp_token') || ''
  }
  return ''
}

// ── API sync function ──

async function syncFromAPI() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tiendapp_token') : null
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    // Fetch stores
    const storesRes = await fetch('/api/stores', { headers })
    if (storesRes.ok) {
      const apiStores = await storesRes.json()
      if (Array.isArray(apiStores) && apiStores.length > 0) {
        const transformedStores = apiStores.map(transformApiStore)
        // Merge with mock fallback stores that aren't in the API
        const existingSlugs = new Set(transformedStores.map((s: Store) => s.slug))
        const fallbackStores = MOCK_STORES.filter((s) => !existingSlugs.has(s.slug))
        useAppStore.setState({ stores: [...transformedStores, ...fallbackStores] })
      }
    }

    // Fetch products (need store IDs to fetch)
    const currentStores = useAppStore.getState().stores
    if (currentStores.length > 0) {
      const allProducts: Product[] = []
      // Fetch products for each store
      for (const store of currentStores) {
        const productsRes = await fetch(`/api/store-products?storeId=${store.id}`, { headers })
        if (productsRes.ok) {
          const apiProducts = await productsRes.json()
          if (Array.isArray(apiProducts)) {
            allProducts.push(...apiProducts.map(transformApiProduct))
          }
        }
      }
      if (allProducts.length > 0) {
        useAppStore.setState({ products: allProducts })
      }
    }

    // Fetch users (admin only, may fail for non-admin)
    const usersRes = await fetch('/api/users', { headers })
    if (usersRes.ok) {
      const apiUsers = await usersRes.json()
      if (Array.isArray(apiUsers) && apiUsers.length > 0) {
        const transformedUsers = apiUsers.map(transformApiUser)
        // Keep the admin user from mock data
        const mockAdmin = MOCK_USERS.find((u) => u.role === 'admin')
        const hasAdmin = apiUsers.some((u: Record<string, unknown>) => u.role === 'super_admin')
        if (mockAdmin && !hasAdmin) {
          transformedUsers.unshift(mockAdmin)
        }
        useAppStore.setState({ users: transformedUsers })
      }
    }

    // Restore user session from localStorage if token exists
    if (token) {
      const authRes = await fetch('/api/auth', { headers })
      if (authRes.ok) {
        const { user: apiUser } = await authRes.json()
        const user = transformApiUser({ ...apiUser, role: apiUser.role })
        useAppStore.setState({ currentUser: user })
      }
    }

    console.log('[Zustand] Synced from API successfully')
  } catch (error) {
    console.warn('[Zustand] API sync failed, using mock data fallback:', error)
  }
}

interface AppState {
  route: PageRoute
  history: PageRoute[]
  currentUser: User | null
  currentStore: Store | null
  users: User[]
  stores: Store[]
  products: Product[]
  wizardStep: number
  wizardData: {
    planId: string
    storeName: string
    storeDescription: string
    storeLogo: string
    storeCategory: string
    storeColors: { primary: string; secondary: string }
    storeWhatsapp: string
    template: 'moderna' | 'vibrante' | 'clasica'
  }
  platformSettings: {
    name: string
    defaultPlanId: string
    maintenanceMode: boolean
    registrationsEnabled: boolean
  }

  navigate: (route: PageRoute) => void
  goBack: () => void
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  getToken: () => string
  setWizardStep: (step: number) => void
  updateWizardData: (data: Partial<AppState['wizardData']>) => void
  completeWizard: () => void
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => void
  updateStoreSettings: (data: Partial<Store>) => void
  changePlan: (planId: string) => void
  toggleStoreActive: (storeId: string) => void
  toggleUserActive: (userId: string) => void
  updatePlatformSettings: (data: Partial<AppState['platformSettings']>) => void
  syncFromAPI: () => Promise<void>
}

const defaultWizardData = {
  planId: 'free',
  storeName: '',
  storeDescription: '',
  storeLogo: '',
  storeCategory: '',
  storeColors: { primary: '#7C3AED', secondary: '#A78BFA' },
  storeWhatsapp: '',
  template: 'moderna' as const,
}

export const useAppStore = create<AppState>((set, get) => ({
  route: { page: 'landing' },
  history: [{ page: 'landing' }],
  currentUser: null,
  currentStore: null,
  users: [...MOCK_USERS],
  stores: [...MOCK_STORES],
  products: [...MOCK_PRODUCTS],
  wizardStep: 1,
  wizardData: { ...defaultWizardData },
  platformSettings: {
    name: 'TiendApp',
    defaultPlanId: 'free',
    maintenanceMode: false,
    registrationsEnabled: true,
  },

  navigate: (route) =>
    set((state) => ({
      route,
      history: [...state.history, route],
    })),

  goBack: () =>
    set((state) => {
      const newHistory = state.history.slice(0, -1)
      const prev = newHistory[newHistory.length - 1] || { page: 'landing' as const }
      return {
        route: prev,
        history: newHistory.length > 0 ? newHistory : [{ page: 'landing' as const }],
      }
    }),

  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false

      const data = await res.json()
      const { token, user: apiUser } = data

      // Store JWT in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('tiendapp_token', token)
        localStorage.setItem('tiendapp_user', JSON.stringify(apiUser))
      }

      // Map to internal User type
      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        password: '',
        role: apiUser.role === 'super_admin' ? 'admin' : 'owner',
        planId: '',
        storeId: null,
        isActive: apiUser.isActive,
        createdAt: new Date().toISOString(),
      }

      // Fetch store for this user
      let store: Store | null = null
      const storesRes = await fetch('/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (storesRes.ok) {
        const stores = await storesRes.json()
        const myStore = Array.isArray(stores) ? stores.find((s: { ownerId: string }) => s.ownerId === apiUser.id) : null
        if (myStore) {
          store = transformApiStore(myStore)
        }
      }

      set({ currentUser: user, currentStore: store })

      if (user.role === 'admin') {
        set({ route: { page: 'admin' }, history: [{ page: 'admin' }] })
      } else if (store) {
        set({ route: { page: 'dashboard' }, history: [{ page: 'dashboard' }] })
      } else {
        set({ route: { page: 'wizard' }, history: [{ page: 'wizard' }] })
      }
      return true
    } catch {
      return false
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) return false

      // Auto-login after register
      return get().login(email, password)
    } catch {
      return false
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tiendapp_token')
      localStorage.removeItem('tiendapp_user')
    }
    set({
      currentUser: null,
      currentStore: null,
      route: { page: 'landing' },
      history: [{ page: 'landing' }],
      wizardStep: 1,
      wizardData: { ...defaultWizardData },
    })
  },

  getToken,

  setWizardStep: (step) => set({ wizardStep: step }),

  updateWizardData: (data) =>
    set((state) => ({
      wizardData: { ...state.wizardData, ...data },
    })),

  completeWizard: () => {
    const { currentUser, wizardData } = get()
    if (!currentUser) return

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: wizardData.storeName,
      slug: wizardData.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: wizardData.storeDescription,
      logo: wizardData.storeLogo || '🏪',
      categoryId: wizardData.storeCategory,
      planId: wizardData.planId,
      colors: wizardData.storeColors,
      whatsappNumber: wizardData.storeWhatsapp,
      template: wizardData.template,
      userId: currentUser.id,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      stores: [...state.stores, newStore],
      currentStore: newStore,
      currentUser: { ...currentUser, storeId: newStore.id, planId: wizardData.planId },
      users: state.users.map((u) =>
        u.id === currentUser.id ? { ...u, storeId: newStore.id, planId: wizardData.planId } : u
      ),
      route: { page: 'dashboard' },
      history: [{ page: 'dashboard' }],
    }))
  },

  addProduct: async (product) => {
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ products: [...state.products, newProduct] }))
    // Persist to API
    try {
      const token = getToken()
      const res = await fetch('/api/store-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          storeId: product.storeId,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          imageUrl: product.imageUrl,
          category: product.categoryId,
          isActive: product.isActive,
          featured: product.featured,
          rating: product.rating,
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        set((state) => ({
          products: state.products.map((p) => (p.id === newProduct.id ? { ...p, id: saved.id } : p)),
        }))
      }
    } catch { /* fallback to local state */ }
  },

  updateProduct: async (id, data) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
    // Persist to API
    try {
      const token = getToken()
      const res = await fetch('/api/store-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, ...data, category: data.categoryId }),
      })
      if (res.ok) {
        const saved = await res.json()
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? {
            ...p,
            name: saved.name ?? p.name,
            description: saved.description ?? p.description,
            price: saved.price ?? p.price,
            originalPrice: saved.originalPrice ?? p.originalPrice,
            imageUrl: saved.imageUrl ?? p.imageUrl,
            featured: saved.featured ?? p.featured,
            rating: saved.rating ?? p.rating,
            isActive: saved.isActive ?? p.isActive,
          } : p)),
        }))
      }
    } catch { /* fallback to local state */ }
  },

  deleteProduct: async (id) => {
    // Remove from local state immediately (optimistic)
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
    // Persist to API
    try {
      const token = getToken()
      const res = await fetch(`/api/store-products/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (!res.ok) {
        console.warn('[Store] Failed to delete product on server:', res.status)
        // Optionally: re-fetch products to restore consistency
      }
    } catch (error) {
      console.warn('[Store] Error deleting product:', error)
    }
  },

  updateStoreSettings: (data) =>
    set((state) => {
      const storeId = state.currentStore?.id
      if (!storeId) return state
      return {
        currentStore: state.currentStore ? { ...state.currentStore, ...data } : null,
        stores: state.stores.map((s) => (s.id === storeId ? { ...s, ...data } : s)),
      }
    }),

  changePlan: (planId) =>
    set((state) => {
      const userId = state.currentUser?.id
      if (!userId) return state
      return {
        currentUser: state.currentUser ? { ...state.currentUser, planId } : null,
        users: state.users.map((u) => (u.id === userId ? { ...u, planId } : u)),
      }
    }),

  toggleStoreActive: (storeId) =>
    set((state) => ({
      stores: state.stores.map((s) =>
        s.id === storeId ? { ...s, isActive: !s.isActive } : s
      ),
    })),

  toggleUserActive: (userId) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      ),
    })),

  updatePlatformSettings: (data) =>
    set((state) => ({
      platformSettings: { ...state.platformSettings, ...data },
    })),

  syncFromAPI,
}))

// ── Auto-sync on module load ──
if (typeof window !== 'undefined') {
  syncFromAPI()
}
