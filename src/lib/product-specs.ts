/**
 * Especificaciones de producto a partir de la descripcion (sin campo nuevo en BD).
 *
 * Idea: el vendedor escribe la descripcion normal y, si quiere, agrega
 * especificaciones una por linea con el formato "Etiqueta: valor":
 *
 *   Hermoso conjunto bañado en oro, hecho a mano.
 *
 *   Material: acero inoxidable
 *   Baño: oro 18k
 *   Incluye: caja de regalo + cadena
 *
 * parseProductSpecs() separa esas lineas para que la tienda las muestre
 * como ficha tecnica (lista limpia con checks) y el resto como descripcion.
 */

export interface ProductSpec {
  label: string
  value: string
}

/** Linea "Etiqueta: valor" — etiqueta corta (1-40 chars), valor hasta 120 chars. */
const SPEC_LINE = /^\s*[-•*]?\s*([^:\n]{1,40}):\s*(.{1,120}?)\s*$/

/** Minimo de lineas tipo especificacion para activar el render de ficha tecnica. */
const MIN_SPECS = 2

export function parseProductSpecs(description: string | null | undefined): {
  intro: string
  specs: ProductSpec[]
} {
  const empty = { intro: '', specs: [] as ProductSpec[] }
  if (!description || typeof description !== 'string') return empty

  const introLines: string[] = []
  const specs: ProductSpec[] = []

  for (const raw of description.split('\n')) {
    if (!raw.trim()) {
      introLines.push('')
      continue
    }
    const m = raw.match(SPEC_LINE)
    if (m) {
      const label = m[1].trim()
      const value = m[2].trim()
      // Guardas: descartar URLs, horarios con "am/pm" largos, frases con guiones raros
      const looksLikeUrl = /^https?$/i.test(label) || /^www\.?$/i.test(label)
      const labelHasWords = label.length >= 2
      if (!looksLikeUrl && labelHasWords && value) {
        specs.push({ label, value })
        continue
      }
    }
    introLines.push(raw)
  }

  // Con menos de MIN_SPECS lineas validas, probablemente no es una ficha tecnica
  // intencional (puede ser una frase suelta con ":") -> dejar la descripcion intacta.
  if (specs.length < MIN_SPECS) {
    return { intro: description.trim(), specs: [] }
  }

  return { intro: introLines.join('\n').replace(/\n{3,}/g, '\n\n').trim(), specs }
}
