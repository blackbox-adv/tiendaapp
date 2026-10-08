'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'

// Categorías por defecto (se muestran si la tienda no tiene propias o como extra).
export const DEFAULT_CATEGORIES: string[] = [
  'Ropa', 'Accesorios', 'Electrónica', 'Hogar', 'Belleza',
  'Deportes', 'Alimentos', 'Juguetes', 'Otros',
]

/**
 * Devuelve las categorías para el selector del formulario de productos:
 * primero las creadas por el dueño (su tienda), luego las por defecto.
 * Así las categorías que crea en "Categorías" aparecen SÍ o SÍ al crear productos.
 */
export function useStoreCategories(): string[] {
  const { currentStore } = useAppStore()
  const [cats, setCats] = useState<string[]>(DEFAULT_CATEGORIES)
  const storeId = currentStore?.id

  useEffect(() => {
    if (!storeId) return
    let cancelled = false
    const token = localStorage.getItem('tiendapp_token')
    fetch(`/api/categories?storeId=${storeId}`, {
      headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return
        const names = data
          .map((c: { name?: string }) => (typeof c?.name === 'string' ? c.name.trim() : ''))
          .filter(Boolean)
        if (names.length === 0) return
        setCats([...names, ...DEFAULT_CATEGORIES.filter((d) => !names.includes(d))])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [storeId])

  return cats
}
