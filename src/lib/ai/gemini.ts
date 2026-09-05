// ============================================================
// CLIENTE GEMINI (REST puro, sin dependencias) — Landing IA v1
// La API key se configura en Vercel como GEMINI_API_KEY
// (Google AI Studio: capa gratuita). Modelo configurable vía
// GEMINI_MODEL (default: gemini-2.5-flash-lite, el más generoso
// en la capa gratis).
// ============================================================

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.5-flash-lite'
const REQUEST_TIMEOUT_MS = 25_000

export interface LandingCopyInput {
  storeName: string
  storeCategory?: string
  productName: string
  productInfo?: string
  price?: number | null
  offerText?: string | null
}

export interface LandingCopy {
  headline: string
  subheadline: string
  description: string
  benefits: string[]
  ctaText: string
  seoTitle: string
  seoDescription: string
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

export class GeminiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

function limit(s: string, max: number): string {
  return (s || '').trim().slice(0, max)
}

// Prompt cuidadosamente acotado: copy de venta en español peruano,
// salida JSON estricta con longitudes máximas por campo.
function buildPrompt(input: LandingCopyInput): string {
  const precio = typeof input.price === 'number' && input.price > 0
    ? `Precio de venta: S/ ${input.price.toFixed(2)}.`
    : 'El vendedor NO dio precio: no inventes precios ni menciones montos.'
  const oferta = input.offerText ? `Oferta/lanzamiento: ${input.offerText}.` : ''
  const extra = input.productInfo ? `Detalles que contó el vendedor: ${input.productInfo}.` : ''

  return `Escribe el copy para la landing de lanzamiento de un producto. Todo en español de Perú, tono cercano y vendedor (como hablar por WhatsApp), sin emojis, sin comillas dobles dentro de los textos.

Negocio: ${input.storeName}${input.storeCategory ? ` (rubro: ${input.storeCategory})` : ''}.
Producto: ${input.productName}.
${precio}
${oferta}
${extra}

Devuelve EXACTAMENTE este JSON (sin texto adicional):
{
  "headline": "título gancho, máximo 55 caracteres, específico y con beneficio",
  "subheadline": "frase que amplía el gancho, máximo 90 caracteres",
  "description": "párrafo de venta de 3 a 4 frases, natural, que invite a escribir por WhatsApp, máximo 420 caracteres",
  "benefits": ["4 beneficios cortos, cada uno máximo 45 caracteres"],
  "ctaText": "llamado a acción para pedir por WhatsApp, máximo 25 caracteres, ejemplo: Pedir por WhatsApp",
  "seoTitle": "título SEO, máximo 60 caracteres, incluye producto y ciudad/nación Perú si es natural",
  "seoDescription": "descripción SEO, máximo 150 caracteres, con llamado a la acción"
}`
}

function extractJson(text: string): LandingCopy {
  // Los modelos a veces envuelven el JSON en fences o texto extra
  let raw = text.trim()
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) raw = fence[1].trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new GeminiError('GEMINI_PARSE', 'La respuesta de la IA no contiene JSON')
  }
  const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>

  const benefits = Array.isArray(parsed.benefits)
    ? parsed.benefits.filter((b): b is string => typeof b === 'string' && b.trim().length > 0).slice(0, 4)
    : []

  return {
    headline: limit(String(parsed.headline ?? ''), 60),
    subheadline: limit(String(parsed.subheadline ?? ''), 100),
    description: limit(String(parsed.description ?? ''), 450),
    benefits: benefits.length > 0 ? benefits : ['Atención rápida por WhatsApp', 'Producto disponible hoy'],
    ctaText: limit(String(parsed.ctaText ?? ''), 30) || 'Pedir por WhatsApp',
    seoTitle: limit(String(parsed.seoTitle ?? ''), 64),
    seoDescription: limit(String(parsed.seoDescription ?? ''), 158),
  }
}

export async function generateLandingCopy(input: LandingCopyInput): Promise<LandingCopy> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new GeminiError('GEMINI_NO_KEY', 'La IA no está configurada. Falta la clave de Gemini.')
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  let res: Response
  try {
    res = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new GeminiError('GEMINI_TIMEOUT', `No se pudo contactar a la IA (${msg})`)
  }

  if (res.status === 429) {
    throw new GeminiError('GEMINI_QUOTA', 'La IA alcanzó su límite por ahora. Intenta en un minuto.')
  }
  if (res.status === 403 || res.status === 400) {
    const body = await res.text().catch(() => '')
    if (body.includes('API key not valid') || body.includes('API_KEY_INVALID')) {
      throw new GeminiError('GEMINI_BAD_KEY', 'La clave de Gemini no es válida. Revísala en Vercel.')
    }
    throw new GeminiError('GEMINI_ERROR', `La IA rechazó la solicitud (${res.status})`)
  }
  if (!res.ok) {
    throw new GeminiError('GEMINI_ERROR', `Error de la IA (${res.status}). Intenta de nuevo.`)
  }

  const data = (await res.json().catch(() => null)) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  } | null
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new GeminiError('GEMINI_EMPTY', 'La IA no devolvió contenido. Intenta de nuevo.')
  }
  return extractJson(text)
}
