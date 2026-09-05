'use client'

// ============================================================
// Landing IA — Panel del vendedor (Premium)
// Flujo: describir producto (+ fotos) → IA genera el copy
// (Gemini vía /api/ai/landing) → vendedor ajusta → publica en
// /l/[slug]. Solo capa nueva; no toca funcionalidades existentes.
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Wand2, Upload, Trash2, ExternalLink, Rocket, CheckCircle2, Lock } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface LandingRow {
  id: string
  title: string
  slug: string
  headline: string
  published: boolean
  views: number
}

interface LandingFull {
  id: string
  slug: string
  title: string
  headline: string
  subheadline: string
  description: string
  benefits: unknown
  ctaText: string
  price: number | null
  offerPrice: number | null
  offerText: string | null
  photos: unknown
  published: boolean
}

function benefitsToText(v: unknown): string {
  if (!Array.isArray(v)) return ''
  return v.filter((b): b is string => typeof b === 'string').join('\n')
}

function textToBenefits(t: string): string[] {
  return t.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 4)
}

export default function LandingAIClient() {
  const { currentStore } = useAppStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('tiendapp_token') : null

  const [mode, setMode] = useState<'form' | 'preview' | 'done'>('form')
  const [planBlocked, setPlanBlocked] = useState(false)
  const [noKey, setNoKey] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Formulario
  const [productName, setProductName] = useState('')
  const [productInfo, setProductInfo] = useState('')
  const [price, setPrice] = useState('')
  const [offerText, setOfferText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  // Borrador editable
  const [landing, setLanding] = useState<LandingFull | null>(null)
  const [headline, setHeadline] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [description, setDescription] = useState('')
  const [benefitsText, setBenefitsText] = useState('')
  const [ctaText, setCtaText] = useState('Pedir por WhatsApp')
  const [editPrice, setEditPrice] = useState('')
  const [editOfferPrice, setEditOfferPrice] = useState('')

  // Lista existente
  const [rows, setRows] = useState<LandingRow[]>([])

  const authHeaders = useCallback(
    (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  )

  const loadList = useCallback(async () => {
    if (!currentStore) return
    try {
      const res = await fetch(`/api/landings?storeId=${currentStore.id}`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        const list = (data.data ?? data) as LandingRow[]
        setRows(Array.isArray(list) ? list : [])
      }
    } catch {
      /* silencio: la lista es secundaria */
    }
  }, [currentStore, authHeaders])

  useEffect(() => {
    loadList()
  }, [loadList])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentStore) return
    setUploading(true)
    setError('')
    try {
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, 4)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', 'landings')
        const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: fd })
        if (res.ok) {
          const data = await res.json()
          const url = data.url || data.data?.url
          if (url) urls.push(url)
        }
      }
      if (urls.length === 0) {
        setError('No se pudieron subir las fotos. Intenta de nuevo.')
      } else {
        setPhotos((prev) => [...prev, ...urls].slice(0, 4))
      }
    } finally {
      setUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!currentStore) return
    setError('')
    setNoKey(false)
    if (productName.trim().length < 2) {
      setError('Escribe el nombre del producto.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/ai/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          storeId: currentStore.id,
          productName,
          productInfo,
          price,
          offerText,
          photos,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const l = (data.data ?? data) as LandingFull
        setLanding(l)
        setHeadline(l.headline)
        setSubheadline(l.subheadline)
        setDescription(l.description)
        setBenefitsText(benefitsToText(l.benefits))
        setCtaText(l.ctaText || 'Pedir por WhatsApp')
        setEditPrice(l.price != null ? String(l.price) : price)
        setEditOfferPrice('')
        setMode('preview')
        loadList()
      } else if (data.code === 'PLAN_REQUIRED') {
        setPlanBlocked(true)
      } else if (data.code === 'GEMINI_NO_KEY') {
        setNoKey(true)
        setError(data.error || 'La IA aún no está configurada en el servidor.')
      } else {
        setError(data.error || 'No se pudo generar la landing. Intenta de nuevo.')
      }
    } catch {
      setError('Error de red. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const handlePublish = async (publish: boolean) => {
    if (!landing) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/landings/${landing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          published: publish,
          headline,
          subheadline,
          description,
          benefits: textToBenefits(benefitsText),
          ctaText,
          price: editPrice,
          offerPrice: editOfferPrice,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const l = (data.data ?? data) as LandingFull
        setLanding({ ...l, photos: landing.photos })
        setMode('done')
        loadList()
      } else {
        setError(data.error || 'No se pudo guardar. Intenta de nuevo.')
      }
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const togglePublish = async (row: LandingRow) => {
    await fetch(`/api/landings/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ published: !row.published }),
    })
    loadList()
  }

  const removeLanding = async (row: LandingRow) => {
    if (!confirm('¿Eliminar esta landing? No se puede deshacer.')) return
    await fetch(`/api/landings/${row.id}`, { method: 'DELETE', headers: authHeaders() })
    loadList()
  }

  const resetAll = () => {
    setMode('form')
    setLanding(null)
    setProductName('')
    setProductInfo('')
    setPrice('')
    setOfferText('')
    setPhotos([])
    setError('')
  }

  const publicUrl = landing && typeof window !== 'undefined' ? `${window.location.origin}/l/${landing.slug}` : ''

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
          <Sparkles className="h-6 w-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Landing IA</h1>
          <p className="text-sm text-gray-500">
            Describe tu lanzamiento y la IA crea la página de venta. Exclusivo Premium.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {noKey && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          El dueño aún debe configurar la clave de Gemini (GEMINI_API_KEY) en Vercel para activar la IA.
        </div>
      )}

      {planBlocked && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center">
          <Lock className="mx-auto mb-2 h-8 w-8 text-violet-600" />
          <p className="font-semibold text-violet-900">La Landing IA es del plan Premium</p>
          <p className="mt-1 text-sm text-violet-700">
            Genera páginas de lanzamiento con IA para vender más.
          </p>
          <Link
            href="/dashboard/plan"
            className="mt-3 inline-block rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Ver planes
          </Link>
        </div>
      )}

      {/* PASO 1: formulario */}
      {mode === 'form' && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ¿Qué producto lanzas? *
            </label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: Mochila antirrobo impermeable"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              maxLength={120}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cuéntale a la IA los detalles
            </label>
            <textarea
              value={productInfo}
              onChange={(e) => setProductInfo(e.target.value)}
              placeholder="Ej: es impermeable, tiene puerto USB, ideal para delivery y universitarios, 6 colores"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              maxLength={600}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Precio (opcional)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 89.90"
                inputMode="decimal"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Oferta de lanzamiento (opcional)
              </label>
              <input
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                placeholder="Ej: 20% de descuento esta semana"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
                maxLength={80}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fotos (hasta 4, opcional pero recomendado)
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600">
              <Upload className="h-4 w-4" />
              {uploading ? 'Subiendo…' : 'Elegir fotos desde tu celular'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt={`foto ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                    <button
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      aria-label="Quitar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={busy || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            {busy ? 'La IA está escribiendo…' : 'Generar mi landing con IA'}
          </button>
        </div>
      )}

      {/* PASO 2: revisar y ajustar */}
      {mode === 'preview' && landing && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-violet-700">
            <Sparkles className="h-4 w-4" />
            La IA terminó. Revisa, ajusta lo que quieras y publica.
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Título principal</label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              maxLength={60}
            />
            <p className="mt-1 text-xs text-gray-400">{headline.length}/60</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Subtítulo</label>
            <input
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              maxLength={100}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              maxLength={500}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Beneficios (uno por línea, máx. 4)
            </label>
            <textarea
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Precio normal</label>
              <input
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Precio de oferta (opcional)
              </label>
              <input
                value={editOfferPrice}
                onChange={(e) => setEditOfferPrice(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Texto del botón</label>
            <input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
              maxLength={30}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handlePublish(true)}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <Rocket className="h-4 w-4" />
              {busy ? 'Publicando…' : 'Publicar landing'}
            </button>
            <button
              onClick={resetAll}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm text-gray-600 hover:bg-gray-50"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: publicada */}
      {mode === 'done' && landing && (
        <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
          <p className="font-semibold text-green-900">
            {landing.published ? '¡Tu landing está publicada!' : 'Guardado'}
          </p>
          <p className="text-sm text-green-800">
            Comparte este enlace por WhatsApp para vender desde el primer minuto:
          </p>
          <code className="block break-all rounded-lg bg-white px-4 py-3 text-xs text-gray-700">
            {publicUrl}
          </code>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`/l/${landing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4" /> Ver mi landing
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${landing.headline || landing.title}: ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-green-300 px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Compartir por WhatsApp
            </a>
            <button
              onClick={resetAll}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Crear otra
            </button>
          </div>
        </div>
      )}

      {/* Lista de landings */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-gray-900">Mis landings ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aún no tienes landings. Genera la primera con la IA arriba.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-400">
                    {r.published ? `Publicada · ${r.views} vistas` : 'Borrador'} · /l/{r.slug}
                  </p>
                </div>
                <div className="flex flex-none items-center gap-2">
                  <a
                    href={`/l/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Ver
                  </a>
                  <button
                    onClick={() => togglePublish(r)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      r.published
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                    }`}
                  >
                    {r.published ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    onClick={() => removeLanding(r)}
                    className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
