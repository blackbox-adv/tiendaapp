/**
 * Compresión de imágenes en el navegador (antes de subir).
 * Objetivo: que las fotos de celular no pesen demasiado (datos móviles)
 * y que ningún archivo rompa el límite de 5MB del endpoint de subida.
 * - JPEG/WebP: se re-escala a máx 1200px y se guarda JPEG calidad 0.85.
 * - PNG: se re-escala como PNG (conserva transparencia); si pesa >2MB se pasa a JPEG.
 * - GIF: se deja intacto (animaciones).
 * Si algo falla, devuelve el archivo original (nunca rompe la subida).
 */

const MAX_SIDE = 1200
const MIN_SIZE_TO_COMPRESS = 150 * 1024 // <150KB: no vale la pena
const PNG_FALLBACK_SIZE = 2 * 1024 * 1024 // PNG resultante >2MB -> JPEG

export async function compressImage(file: File): Promise<File> {
  if (typeof window === 'undefined') return file
  if (file.type === 'image/gif') return file
  if (file.size < MIN_SIZE_TO_COMPRESS) return file

  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
    const w = Math.max(1, Math.round(bmp.width * scale))
    const h = Math.max(1, Math.round(bmp.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bmp, 0, 0, w, h)
    bmp.close?.()

    let outBlob: Blob | null = null
    if (file.type === 'image/png') {
      const pngBlob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
      if (pngBlob && pngBlob.size <= PNG_FALLBACK_SIZE) {
        outBlob = pngBlob
      } else {
        outBlob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
      }
    } else {
      outBlob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
    }

    if (!outBlob || outBlob.size >= file.size) return file // no mejoró: original

    const ext = outBlob.type === 'image/png' ? 'png' : 'jpg'
    const base = file.name.replace(/\.[^.]+$/, '').replace(/-opt$/, '')
    return new File([outBlob], `${base}-opt.${ext}`, { type: outBlob.type })
  } catch {
    return file
  }
}
