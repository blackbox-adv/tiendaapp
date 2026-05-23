import { create } from 'zustand'
import type { PageRoute, User, Store, Product } from './types'
import { PLANS, MOCK_USERS, MOCK_STORES, MOCK_PRODUCTS, CATEGORIES } from './mock-data'

// ── Schema transformation helpers (API → Frontend) ──

function transformApiStore(apiStore: Record<string, unknown>): Store {
  const subs = (apiStore.subscriptions as Array<Record<string, unknown>>) || []
  const latestSub = subs.length > 0 ? subs[subs.length - 1] : null
  // Determine planId: prefer subscription's plan type, then planId, then 'free'
  const subPlan = latestSub?.plan as Record<string, unknown> | undefined
  const planId = (subPlan?.type as string) || (latestSub?.planId as string) || 'free'

  return {
    id: apiStore.id as string,
    name: apiStore.name as string,
    slug: apiStore.slug as string,
    description: (apiStore.description as string) || '',
    logo: (apiStore.logo as string) ?? '',
    categoryId: (apiStore.category as string) || '',
    planId,
    colors: {
      primary: (apiStore.primaryColor as string) || '#7C3AED',
      secondary: (apiStore.secondaryColor as string) || '#10B981',
    },
    whatsappNumber: (apiStore.whatsappNumber as string) || '',
    template: (apiStore.template as 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist') || 'moderna',
    bannerUrl: (apiStore.bannerUrl as string) || '',
    userId: apiStore.ownerId as string,
    isActive: (apiStore.isActive as boolean) ?? true,
    createdAt: (apiStore.createdAt as string) || new Date().toISOString(),
    hasShipping: (apiStore.hasShipping as boolean) ?? false,
    hasSecurePayment: (apiStore.hasSecurePayment as boolean) ?? false,
    hasReturns: (apiStore.hasReturns as boolean) ?? false,
    // Promo Popup fields
    popupEnabled: (apiStore.popupEnabled as boolean) ?? false,
    popupType: (apiStore.popupType as 'product' | 'custom') ?? 'product',
    popupProductId: (apiStore.popupProductId as string | null) ?? null,
    popupCustomImage: (apiStore.popupCustomImage as string | null) ?? null,
    popupTitle: (apiStore.popupTitle as string | null) ?? null,
    popupButtonText: (apiStore.popupButtonText as string) ?? 'Ver oferta',
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
  // Price/originalPrice/rating may come as Decimal (string) from Prisma JSON serialization
  const rawPrice = apiProduct.price
  const rawOriginalPrice = apiProduct.originalPrice
  const rawRating = apiProduct.rating

  const toNum = (v: unknown): number => {
    if (typeof v === 'number') return v
    if (typeof v === 'string') return parseFloat(v) || 0
    return 0
  }

  return {
    id: apiProduct.id as string,
    name: (apiProduct.name as string) || '',
    description: (apiProduct.description as string) || '',
    price: toNum(rawPrice),
    originalPrice: rawOriginalPrice != null ? toNum(rawOriginalPrice) : null,
    categoryId: (apiProduct.category as string) || '',
    imageUrl: (apiProduct.imageUrl as string) || '',
    isActive: (apiProduct.isActive as boolean) ?? true,
    featured: (apiProduct.featured as boolean) ?? false,
    rating: toNum(rawRating),
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

    // 1) Restore user session from localStorage token
    if (token) {
      try {
        const authRes = await fetch('/api/auth', { headers })
        if (authRes.ok) {
          const { user: apiUser } = await authRes.json()
          const user = transformApiUser({ ...apiUser, role: apiUser.role })
          useAppStore.setState({ currentUser: user })

          // 2) Fetch THIS user's stores (owner or admin)
          const storesRes = await fetch('/api/stores', { headers })
          if (storesRes.ok) {
            const apiStores = await storesRes.json()
            console.log('[Zustand] Stores API response:', Array.isArray(apiStores) ? `${apiStores.length} stores` : typeof apiStores, apiStores)
            // Handle both array directly and wrapped { data: [...] }
            const storesArray = Array.isArray(apiStores) ? apiStores : (apiStores?.data && Array.isArray(apiStores.data) ? apiStores.data : null)
            if (storesArray) {
              const transformedStores = storesArray.map(transformApiStore)

              // Set currentStore to the first store (owner typically has 1)
              if (transformedStores.length > 0) {
                useAppStore.setState({ currentStore: transformedStores[0] })
                console.log('[Zustand] currentStore set:', transformedStores[0].name, 'planId:', transformedStores[0].planId)
              } else {
                console.warn('[Zustand] No stores found for this user — redirecting to wizard')
                // No stores — user should be on wizard, not dashboard
                const currentRoute = useAppStore.getState().route
                if (currentRoute.page.startsWith('dashboard')) {
                  useAppStore.setState({ route: { page: 'wizard' }, history: [{ page: 'wizard' }] })
                }
              }

              // Replace stores entirely (no mock data mixing)
              useAppStore.setState({ stores: transformedStores })

              // 3) Fetch products for user's stores
              const allProducts: Product[] = []
              for (const store of transformedStores) {
                const productsRes = await fetch(`/api/store-products?storeId=${store.id}`, { headers })
                if (productsRes.ok) {
                  const apiProducts = await productsRes.json()
                  const productsArray = Array.isArray(apiProducts) ? apiProducts : (apiProducts?.data && Array.isArray(apiProducts.data) ? apiProducts.data : [])
                  if (Array.isArray(productsArray)) {
                    allProducts.push(...productsArray.map(transformApiProduct))
                  }
                }
              }
              useAppStore.setState({ products: allProducts })
            } else {
              console.warn('[Zustand] Stores API returned unexpected format:', typeof apiStores)
            }
          } else {
            console.warn('[Zustand] Stores API failed with status:', storesRes.status)
            const errText = await storesRes.text().catch(() => '')
            console.warn('[Zustand] Stores API error body:', errText.substring(0, 200))
          }

          // 4) If admin, also fetch all users
          if (user.role === 'admin') {
            const usersRes = await fetch('/api/users', { headers })
            if (usersRes.ok) {
              const apiUsers = await usersRes.json()
              if (Array.isArray(apiUsers) && apiUsers.length > 0) {
                useAppStore.setState({ users: apiUsers.map(transformApiUser) })
              }
            }

            // 5) Load platform settings from API
            const settingsRes = await fetch('/api/settings')
            if (settingsRes.ok) {
              const settingsData = await settingsRes.json()
              if (settingsData && typeof settingsData === 'object') {
                useAppStore.setState({
                  platformSettings: {
                    name: settingsData.name || 'TiendApp',
                    defaultPlanId: settingsData.defaultPlanId || 'free',
                    maintenanceMode: settingsData.maintenanceMode === 'true',
                    registrationsEnabled: settingsData.registrationsEnabled !== 'false',
                    contactEmail: settingsData.contactEmail || 'hola@tiendapp.pe',
                    contactPhone: settingsData.contactPhone || '+51999888777',
                  },
                })
              }
            }
          }
        } else {
          // Auth failed (401) — token is invalid/expired, clear session
          console.warn('[Zustand] Auth failed with status:', authRes.status, '— clearing session')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('tiendapp_token')
            localStorage.removeItem('tiendapp_user')
          }
          // Reset to landing page if user was on a protected route
          const currentRoute = useAppStore.getState().route
          if (currentRoute.page.startsWith('dashboard') || currentRoute.page === 'wizard') {
            useAppStore.setState({ route: { page: 'login' }, currentUser: null, currentStore: null })
          }
        }
      } catch (err) {
        // Network error — DON'T clear token (could be temporary)
        // Only clear session on explicit 401 from the auth endpoint above
        console.warn('[Zustand] Network error during sync (keeping session):', err)
      }
    }

    console.log('[Zustand] Synced from API successfully')
  } catch (error) {
    console.warn('[Zustand] API sync failed, using defaults:', error)
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
  isSyncing: boolean
  wizardStep: number
  wizardData: {
    planId: string
    storeName: string
    storeDescription: string
    storeLogo: string
    storeCategory: string
    storeColors: { primary: string; secondary: string }
    storeWhatsapp: string
    template: 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist'
  }
  platformSettings: {
    name: string
    defaultPlanId: string
    maintenanceMode: boolean
    registrationsEnabled: boolean
    contactEmail: string
    contactPhone: string
  }

  navigate: (route: PageRoute) => void
  goBack: () => void
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  getToken: () => string
  setWizardStep: (step: number) => void
  updateWizardData: (data: Partial<AppState['wizardData']>) => void
  completeWizard: () => Promise<void>
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => void
  updateStoreSettings: (data: Partial<Store>) => Promise<{ success: boolean; error?: string }>
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
  users: [],
  stores: [],
  products: [],
  isSyncing: false,
  wizardStep: 1,
  wizardData: { ...defaultWizardData },
  platformSettings: {
    name: 'TiendApp',
    defaultPlanId: 'free',
    maintenanceMode: false,
    registrationsEnabled: true,
    contactEmail: 'hola@tiendapp.pe',
    contactPhone: '+51999888777',
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

      // Fetch stores for this user (GET /api/stores now returns owner's own stores)
      let store: Store | null = null
      const storesRes = await fetch('/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (storesRes.ok) {
        const apiStores = await storesRes.json()
        if (Array.isArray(apiStores) && apiStores.length > 0) {
          const transformedStores = apiStores.map(transformApiStore)
          store = transformedStores[0]
          set({ stores: transformedStores })

          // Fetch products for the store
          const allProducts: Product[] = []
          for (const s of transformedStores) {
            const productsRes = await fetch(`/api/store-products?storeId=${s.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (productsRes.ok) {
              const apiProducts = await productsRes.json()
              if (Array.isArray(apiProducts)) {
                allProducts.push(...apiProducts.map(transformApiProduct))
              }
            }
          }
          set({ products: allProducts })
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

      if (!res.ok) {
        // FIXED: Read actual error message from API instead of generic "email ya registrado"
        try {
          const errorData = await res.json()
          return { success: false, error: errorData.error || 'Error al registrarse' }
        } catch {
          return { success: false, error: 'Error al registrarse' }
        }
      }

      // Auto-login after register
      const loginResult = await get().login(email, password)
      return loginResult ? { success: true } : { success: false, error: 'Cuenta creada pero error al iniciar sesión. Intenta iniciar sesión manualmente.' }
    } catch {
      return { success: false, error: 'Error de conexión. Intenta de nuevo.' }
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

  completeWizard: async () => {
    const { currentUser, wizardData } = get()
    if (!currentUser) return

    // Optimistic local store for instant UI
    const tempStore: Store = {
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
      bannerUrl: '',
      userId: currentUser.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      hasShipping: false,
      hasSecurePayment: false,
      hasReturns: false,
      popupEnabled: false,
      popupType: 'product' as const,
      popupProductId: null,
      popupCustomImage: null,
      popupTitle: null,
      popupButtonText: 'Ver oferta',
    }

    set((state) => ({
      stores: [...state.stores, tempStore],
      currentStore: tempStore,
      currentUser: { ...currentUser, storeId: tempStore.id, planId: wizardData.planId },
      users: state.users.map((u) =>
        u.id === currentUser.id ? { ...u, storeId: tempStore.id, planId: wizardData.planId } : u
      ),
      route: { page: 'dashboard' },
      history: [{ page: 'dashboard' }],
    }))

    // Persist to API
    try {
      const token = getToken()
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: wizardData.storeName,
          description: wizardData.storeDescription,
          category: wizardData.storeCategory || 'general',
          logo: wizardData.storeLogo || '🏪',
          primaryColor: wizardData.storeColors.primary,
          secondaryColor: wizardData.storeColors.secondary || '#10B981',
          whatsappNumber: wizardData.storeWhatsapp,
          template: wizardData.template,
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        const realStore = transformApiStore(saved)
        // Replace temp store with real one from API
        set((state) => ({
          stores: state.stores.map((s) => s.id === tempStore.id ? realStore : s),
          currentStore: realStore,
          currentUser: { ...state.currentUser!, storeId: realStore.id },
        }))
      } else {
        const data = await res.json().catch(() => ({}))
        console.warn('[Store] Failed to create store on server:', data.error)
      }
    } catch (error) {
      console.warn('[Store] Error creating store:', error)
    }
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

  updateStoreSettings: async (data) => {
    const storeId = get().currentStore?.id
    if (!storeId) return { success: false, error: 'No hay tienda seleccionada' }

    // Update local state immediately (optimistic)
    set((state) => ({
      currentStore: state.currentStore ? { ...state.currentStore, ...data } : null,
      stores: state.stores.map((s) => (s.id === storeId ? { ...s, ...data } : s)),
    }))

    // Persist to API
    try {
      const token = getToken()
      const apiData: Record<string, unknown> = { id: storeId }
      if (data.name !== undefined) apiData.name = data.name
      if (data.description !== undefined) apiData.description = data.description
      if (data.whatsappNumber !== undefined) apiData.whatsappNumber = data.whatsappNumber
      if (data.template !== undefined) apiData.template = data.template
      if (data.categoryId !== undefined) apiData.category = data.categoryId
      if (data.colors) {
        apiData.primaryColor = data.colors.primary
        apiData.secondaryColor = data.colors.secondary
      }
      if (data.logo !== undefined) apiData.logo = data.logo
      if (data.bannerUrl !== undefined) apiData.bannerUrl = data.bannerUrl
      if (data.hasShipping !== undefined) apiData.hasShipping = data.hasShipping
      if (data.hasSecurePayment !== undefined) apiData.hasSecurePayment = data.hasSecurePayment
      if (data.hasReturns !== undefined) apiData.hasReturns = data.hasReturns
      // Popup fields
      if (data.popupEnabled !== undefined) apiData.popupEnabled = data.popupEnabled
      if (data.popupType !== undefined) apiData.popupType = data.popupType
      if (data.popupProductId !== undefined) apiData.popupProductId = data.popupProductId
      if (data.popupCustomImage !== undefined) apiData.popupCustomImage = data.popupCustomImage
      if (data.popupTitle !== undefined) apiData.popupTitle = data.popupTitle
      if (data.popupButtonText !== undefined) apiData.popupButtonText = data.popupButtonText

      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(apiData),
      })

      if (res.ok) {
        const saved = await res.json()
        const realStore = transformApiStore(saved)
        set((state) => ({
          currentStore: realStore,
          stores: state.stores.map((s) => (s.id === storeId ? realStore : s)),
        }))
        return { success: true }
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('[Store] Failed to update store settings via API:', errorData.error || res.status)
        return { success: false, error: errorData.error || 'Error al guardar en el servidor' }
      }
    } catch (error) {
      console.error('[Store] Error updating store settings:', error)
      return { success: false, error: 'Error de conexión al guardar' }
    }
  },

  changePlan: (planId) => {
    // Update local state immediately (optimistic)
    set((state) => {
      const userId = state.currentUser?.id
      if (!userId) return state
      return {
        currentUser: state.currentUser ? { ...state.currentUser, planId } : null,
        users: state.users.map((u) => (u.id === userId ? { ...u, planId } : u)),
      }
    })

    // Persist to API (create or update subscription)
    const state = get()
    const userId = state.currentUser?.id
    const storeId = state.currentStore?.id
    if (!userId) return

    ;(async () => {
      try {
        const token = getToken()
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            userId,
            storeId: storeId || '',
            planId,
            status: 'active',
          }),
        })
        if (res.ok) {
          console.log('[Store] Plan changed via API:', planId)
        } else {
          console.warn('[Store] Failed to change plan via API')
        }
      } catch (error) {
        console.warn('[Store] Error changing plan:', error)
      }
    })()
  },

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
  // Mark sync as in-progress to prevent auth guard race condition
  useAppStore.setState({ isSyncing: true })
  syncFromAPI().finally(() => {
    useAppStore.setState({ isSyncing: false })
  })
}
