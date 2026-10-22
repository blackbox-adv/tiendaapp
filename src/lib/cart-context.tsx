'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

// ── Cart item type ──
// key = identidad del ítem en el carrito: mismo producto puede convivir como
// unidad, como bulto (cajón x12) y como variantes de color distintas.
export interface CartItem {
  key: string
  productId: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  storeId: string
  // Venta por bulto: el precio ya ES el del bulto completo (no por unidad)
  isPack?: boolean
  unitLabel?: string      // "cajón", "docena", "pack"...
  unitsPerPack?: number   // unidades que trae el bulto (>=2)
  // Variante de color elegida
  variantId?: string
  variantColor?: string
}

// Clave compuesta: producto + presentación (bulto) + variante (color)
export function cartKey(productId: string, opts?: { isPack?: boolean; variantId?: string }): string {
  if (opts?.isPack) return `${productId}::pack`
  if (opts?.variantId) return `${productId}::v:${opts.variantId}`
  return productId
}

// ── Product input for addToCart ──
export interface CartProductInput {
  productId: string
  name: string
  price: number
  imageUrl: string
  storeId: string
  isPack?: boolean
  unitLabel?: string
  unitsPerPack?: number
  variantId?: string
  variantColor?: string
}

// ── Cart context value ──
interface CartContextValue {
  cartItems: CartItem[]
  addToCart: (product: CartProductInput, quantity?: number) => void
  removeFromCart: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
  totalItems: number
}

const CartContext = createContext<CartContextValue | null>(null)

// ── Persistencia local (sobrevive recargas de la página) ──
const CART_STORAGE_KEY = 'tiendapp_cart_v1'

function loadInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is CartItem =>
          !!item &&
          typeof item.productId === 'string' &&
          typeof item.name === 'string' &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' &&
          typeof item.storeId === 'string'
      )
      // Compatibilidad con carritos guardados antes de existir `key`
      .map((item) => ({ ...item, key: typeof item.key === 'string' && item.key ? item.key : item.productId }))
  } catch {
    return []
  }
}

// ── CartProvider ──
export function CartProvider({ children }: { children: ReactNode }) {
  // Hidratación segura: SSR y primer render del cliente parten vacíos,
  // luego se carga el pedido guardado para evitar mismatch de hydration.
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCartItems(loadInitialCart())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // localStorage lleno o bloqueado: el pedido solo vive en memoria
    }
  }, [cartItems, hydrated])

  const addToCart = useCallback((product: CartProductInput, quantity: number = 1) => {
    const key = cartKey(product.productId, { isPack: product.isPack, variantId: product.variantId })
    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key)
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity, price: product.price }
            : item
        )
      }
      return [...prev, { ...product, key, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.key !== key))
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalAmount,
      totalItems,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ── useCart hook ──
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
