// ============================================================
// Placeholder de imagen de producto.
// Se usa como src cuando el producto no tiene foto (imageUrl
// vacío) para que la tienda NUNCA muestre imágenes rotas.
// Los onError existentes siguen cubriendo URLs rotas reales.
// ============================================================

const PRODUCT_IMG_FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
  '<rect fill="#f5f5f4" width="400" height="400"/>' +
  '<g fill="none" stroke="#d6d3d1" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="118" y="122" width="164" height="136" rx="16"/>' +
  '<path d="M126 236l42-42 32 32 30-30 46 46"/>' +
  '</g>' +
  '<circle cx="166" cy="166" r="15" fill="#d6d3d1"/>' +
  '</svg>'

export const PRODUCT_IMG_FALLBACK = `data:image/svg+xml,${encodeURIComponent(PRODUCT_IMG_FALLBACK_SVG)}`
