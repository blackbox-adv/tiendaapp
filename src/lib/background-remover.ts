/**
 * Quita-fondos 100% en el navegador (gratis, sin costo por foto, sin servidor).
 *
 * - Modelo: briaai/RMBG-1.4 (versión cuantizada q8, ~45 MB) vía transformers.js.
 * - La librería se importa dinámicamente desde CDN solo cuando el usuario pulsa
 *   "Quitar fondo": no añade un solo byte al bundle de la app.
 * - El modelo se descarga UNA sola vez y queda en caché del navegador.
 * - Todo corre en el dispositivo del vendedor: sus fotos no viajan a ningún servicio.
 */

export type BgRemoveStage = 'download' | 'process'
export type BgRemoveProgress = (stage: BgRemoveStage, pct?: number) => void

const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1'
const MODEL_ID = 'briaai/RMBG-1.4'
const MAX_SIDE = 1200 // lado máximo de la imagen resultante (peso de subida)

// Caché del "motor" (librería + modelo + procesador) entre usos en la misma sesión.
let enginePromise: Promise<any> | null = null

async function getEngine(onProgress?: BgRemoveProgress) {
  if (!enginePromise) {
    enginePromise = (async () => {
      const mod = await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */ TRANSFORMERS_URL
      )
      mod.env.allowLocalModels = false

      const model = await mod.AutoModel.from_pretrained(MODEL_ID, {
        config: { model_type: 'custom' },
        dtype: 'q8',
        progress_callback: (p: any) => {
          if (onProgress && p?.status === 'progress' && typeof p.progress === 'number') {
            onProgress('download', Math.min(100, Math.max(0, Math.round(p.progress))))
          }
        },
      })

      const processor = await mod.AutoProcessor.from_pretrained(MODEL_ID, {
        config: {
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          feature_extractor_type: 'ImageFeatureExtractor',
          image_std: [1, 1, 1],
          resample: 2,
          rescale_factor: 0.00392156862745098,
          size: { width: 1024, height: 1024 },
        },
      })

      return { mod, model, processor }
    })().catch((err) => {
      // Si falla la descarga, permitir reintentar más tarde.
      enginePromise = null
      throw err
    })
  }
  return enginePromise
}

/** Convierte la máscara gris (RawImage, 1 canal) en un canvas blanco con alpha. */
function rawMaskToCanvas(mask: any): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = mask.width
  c.height = mask.height
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(mask.width, mask.height)
  const data: Uint8ClampedArray = mask.data
  const channels: number = mask.channels
  const n = mask.width * mask.height
  for (let i = 0; i < n; i++) {
    const v = data[i * channels]
    img.data[i * 4] = 255
    img.data[i * 4 + 1] = 255
    img.data[i * 4 + 2] = 255
    img.data[i * 4 + 3] = v
  }
  ctx.putImageData(img, 0, 0)
  return c
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen procesada'))),
      type
    )
  })
}

/**
 * Quita el fondo de una imagen (Blob/File) y devuelve un PNG con fondo transparente.
 * onProgress: 'download' = descargando el modelo (primera vez), 'process' = inferencia.
 */
export async function removeImageBackground(
  source: Blob,
  onProgress?: BgRemoveProgress
): Promise<Blob> {
  onProgress?.('download', 0)
  const { mod, model, processor } = await getEngine(onProgress)

  onProgress?.('process')

  // 1. Decodificar respetando la orientación EXIF (fotos de celular).
  const bmp = await createImageBitmap(source, { imageOrientation: 'from-image' })
  const src = document.createElement('canvas')
  src.width = bmp.width
  src.height = bmp.height
  src.getContext('2d')!.drawImage(bmp, 0, 0)
  bmp.close?.()

  // 2. RawImage desde el canvas (PNG intermedio sin EXIF -> sin giros inesperados).
  const pngBlob = await canvasToBlob(src)
  const image = await mod.RawImage.fromBlob(pngBlob)

  // 3. Inferencia -> máscara al tamaño original.
  //    (transformers.js >= 3.7: fromTensor exige [C,H,W]; output[0] es [1,H,W])
  const { pixel_values } = await processor(image)
  const { output } = await model({ input: pixel_values })
  const mask = await mod.RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(
    image.width,
    image.height
  )

  // 4. Componer original + máscara alfa (recorte).
  const out = document.createElement('canvas')
  out.width = image.width
  out.height = image.height
  const octx = out.getContext('2d')!
  octx.drawImage(src, 0, 0)
  octx.globalCompositeOperation = 'destination-in'
  octx.drawImage(rawMaskToCanvas(mask), 0, 0)
  octx.globalCompositeOperation = 'source-over'

  // 5. Redimensionar si es muy grande (ahorra datos y peso al subir).
  let finalCanvas = out
  const maxSide = Math.max(out.width, out.height)
  if (maxSide > MAX_SIDE) {
    const scale = MAX_SIDE / maxSide
    const small = document.createElement('canvas')
    small.width = Math.round(out.width * scale)
    small.height = Math.round(out.height * scale)
    small.getContext('2d')!.drawImage(out, 0, 0, small.width, small.height)
    finalCanvas = small
  }

  return canvasToBlob(finalCanvas)
}

/**
 * Sube la imagen procesada al endpoint existente /api/upload y devuelve su URL.
 * Mismo contrato que los handlers de subida del formulario de productos.
 */
export async function uploadProcessedImage(blob: Blob, token: string | null): Promise<string> {
  const formData = new FormData()
  formData.append('file', blob, 'producto-sin-fondo.png')
  formData.append('folder', 'product')

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'No se recibió la URL de la imagen')
  }
  return data.url as string
}
