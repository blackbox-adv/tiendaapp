/**
 * Store categories utility
 * Dynamically derives categories from the store's products
 * Falls back to a default list if no products have categories
 */

// Default fallback categories for stores without products
export const DEFAULT_CATEGORIES = [
  { id: 'ropa', name: 'Ropa' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'electronica', name: 'Electrónica' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'belleza', name: 'Belleza' },
  { id: 'deportes', name: 'Deportes' },
  { id: 'alimentos', name: 'Alimentos' },
  { id: 'juguetes', name: 'Juguetes' },
  { id: 'otros', name: 'Otros' },
]

/**
 * Extract unique categories from a list of products.
 * Each product's `categoryId` field is used as the category identifier.
 * Returns an array of { id, name } objects.
 */
export function getStoreCategories(products: { categoryId?: string; category?: string }[]): { id: string; name: string }[] {
  const categorySet = new Set<string>()

  for (const product of products) {
    const cat = product.categoryId || product.category || ''
    if (cat && cat.trim()) {
      categorySet.add(cat.trim())
    }
  }

  if (categorySet.size === 0) {
    return DEFAULT_CATEGORIES
  }

  // Convert to { id, name } format, using the category string as both id and name
  const categories = Array.from(categorySet).map((cat) => ({
    id: cat.toLowerCase().replace(/\s+/g, '-'),
    name: cat,
  }))

  // Sort alphabetically
  categories.sort((a, b) => a.name.localeCompare(b.name))

  return categories
}
