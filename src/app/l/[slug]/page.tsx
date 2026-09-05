// ============================================================
// /l/[slug] — Landing de lanzamiento generada con IA (pública)
// Server component: carga la landing publicada + su tienda,
// incrementa el contador de vistas y renderiza una página de
// venta móvil-first con CTA directo a WhatsApp. SEO dinámico.
// ============================================================
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import ShareLandingButton from './ShareLandingButton'

export const dynamic = 'force-dynamic'

async function getLanding(slug: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return null
  return db.landingPage.findUnique({
    where: { slug, published: true },
    select: {
      id: true, title: true, headline: true, subheadline: true, description: true,
      benefits: true, price: true, offerPrice: true, offerText: true, ctaText: true,
      photos: true, views: true, seoTitle: true, seoDescription: true,
      store: {
        select: {
          name: true, slug: true, whatsappNumber: true,
          primaryColor: true, secondaryColor: true, logo: true,
        },
      },
    },
  })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const landing = await getLanding(slug).catch(() => null)
  if (!landing) {
    return { title: 'Landing no encontrada | TiendApp' }
  }
  const ogImages = asStringArray(landing.photos)
  return {
    title: landing.seoTitle || landing.headline || landing.title,
    description: landing.seoDescription || landing.subheadline || undefined,
    openGraph: {
      title: landing.seoTitle || landing.headline || landing.title,
      description: landing.seoDescription || landing.subheadline || undefined,
      images: ogImages.length > 0 ? [ogImages[0]] : undefined,
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && x.length > 0).slice(0, 4)
}

function asNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) && n > 0 ? n : null
}

const SOLES = (n: number) => `S/ ${n.toFixed(2)}`

export default async function LandingPublicPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const landing = await getLanding(slug).catch(() => null)
  if (!landing) notFound()

  // Contador de vistas (best-effort: si falla, la página igual se muestra)
  await db.landingPage.update({
    where: { id: landing.id },
    data: { views: { increment: 1 } },
  }).catch(() => null)

  const benefits = asStringArray(landing.benefits)
  const photos = asStringArray(landing.photos)
  const price = asNumber(landing.price)
  const offerPrice = asNumber(landing.offerPrice)
  const accent = landing.store.primaryColor || '#7C3AED'
  const waDigits = (landing.store.whatsappNumber || '').replace(/[^0-9]/g, '')
  const waMessage = encodeURIComponent(
    `Hola ${landing.store.name}, vi el lanzamiento de "${landing.title}" y quiero más información.`
  )
  const hasWa = waDigits.length >= 9

  return (
    <main className="min-h-screen bg-neutral-50">
      <article className="mx-auto max-w-3xl bg-white shadow-sm">
        {/* Foto principal */}
        {photos[0] && (
          <div className="relative w-full bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[0]}
              alt={landing.title}
              className="w-full max-h-[420px] object-cover"
            />
            {landing.offerText && (
              <span
                className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold text-white shadow"
                style={{ backgroundColor: '#F59E0B' }}
              >
                {landing.offerText}
              </span>
            )}
          </div>
        )}

        <div className="px-5 py-8 sm:px-10 space-y-6">
          {/* Tienda */}
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            {landing.store.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={landing.store.logo} alt={landing.store.name} className="h-6 w-6 rounded-full object-cover" />
            )}
            <span>
              Lanzamiento de <strong className="text-neutral-700">{landing.store.name}</strong>
            </span>
          </div>

          {/* Copys de la IA */}
          <header className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-neutral-900">
              {landing.headline}
            </h1>
            {landing.subheadline && (
              <p className="text-lg text-neutral-600">{landing.subheadline}</p>
            )}
          </header>

          {landing.description && (
            <p className="text-neutral-700 whitespace-pre-line leading-relaxed">
              {landing.description}
            </p>
          )}

          {/* Beneficios */}
          {benefits.length > 0 && (
            <ul className="space-y-2.5">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    ✓
                  </span>
                  <span className="text-neutral-800">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Precio */}
          {(price || offerPrice) && (
            <div className="flex items-end gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4">
              {offerPrice ? (
                <>
                  <span className="text-3xl font-extrabold" style={{ color: accent }}>
                    {SOLES(offerPrice)}
                  </span>
                  {price && price > offerPrice && (
                    <span className="text-lg text-neutral-400 line-through">{SOLES(price)}</span>
                  )}
                </>
              ) : (
                price && (
                  <span className="text-3xl font-extrabold" style={{ color: accent }}>
                    {SOLES(price)}
                  </span>
                )
              )}
            </div>
          )}

          {/* Galería extra */}
          {photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(1).map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={p}
                  alt={`${landing.title} ${i + 2}`}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* CTA principal: WhatsApp */}
          <div className="space-y-3 pt-2">
            {hasWa ? (
              <a
                href={`https://wa.me/${waDigits}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#22C55E] px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#16A34A]"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                  <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm0 18.02c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 4.55 0 8.24 3.69 8.24 8.23s-3.69 8.24-8.23 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
                </svg>
                {landing.ctaText || 'Pedir por WhatsApp'}
              </a>
            ) : (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Esta tienda aun no configura su número de WhatsApp.
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/store/${landing.store.slug}`}
                className="text-sm font-medium underline-offset-2 hover:underline"
                style={{ color: accent }}
              >
                Ver tienda completa de {landing.store.name}
              </Link>
              <ShareLandingButton title={landing.headline || landing.title} />
            </div>
          </div>
        </div>

        <footer className="border-t border-neutral-100 px-5 py-5 text-center text-xs text-neutral-400">
          Hecho con TiendApp — crea tu catálogo y vende por WhatsApp
        </footer>
      </article>
    </main>
  )
}
