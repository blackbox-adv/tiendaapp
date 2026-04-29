import { create } from 'zustand'

export type PageRoute =
  | { page: 'landing' }
  | { page: 'pricing' }
  | { page: 'register' }
  | { page: 'login' }
  | { page: 'dashboard' }
  | { page: 'dashboard-products' }
  | { page: 'dashboard-product-form'; productId?: string }
  | { page: 'dashboard-appearance' }
  | { page: 'dashboard-settings' }
  | { page: 'dashboard-plan' }
  | { page: 'store-preview' }
  | { page: 'view-store'; storeSlug: string }
  | { page: 'super-admin' }

interface AppState {
  route: PageRoute
  currentUser: { id: string; email: string; name: string; role: string; plan: string } | null
  currentStore: Record<string, unknown> | null
  navigate: (route: PageRoute) => void
  login: (user: { id: string; email: string; name: string; role: string; plan: string }) => void
  logout: () => void
  setStore: (store: Record<string, unknown> | null) => void
}

export const useStore = create<AppState>((set) => ({
  route: { page: 'landing' },
  currentUser: null,
  currentStore: null,
  navigate: (route) => set({ route }),
  login: (user) => set({ currentUser: user, route: { page: 'dashboard' } }),
  logout: () => set({ currentUser: null, currentStore: null, route: { page: 'landing' } }),
  setStore: (store) => set({ currentStore: store }),
}))
