import type { Metadata } from 'next'
import { APP_URL } from '@/lib/env'
import { PLAN_PRICES } from '@/lib/plans'
import { GamarraLanding } from './GamarraLanding'

// ============================================================
// Landing dedicada para el nicho Gamarra (SEO).
// La portada queda GENÉRICA (emprendedores, catálogo, WhatsApp):
// las keywords de nicho ("vender en Gamarra", "catálogo para
// Gamarra") se capturan aquí, no en la portada.
// ============================================================

const title = 'Kyllari para Gamarra | Crea tu catálogo online y vende por WhatsApp'
const description =
  '¿Vendes en Gamarra? Muestra tus polos, casacas y jeans en tu propio catálogo online con fotos, precios y tallas. Tus clientes piden por WhatsApp y tú cobras con Yape o Plin. Gratis, sin tarjeta y sin comisión por venta.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'vender en Gamarra online',
    'catálogo para Gamarra',
    'catálogo digital para Gamarra',
    'vender en Gamarra por internet',
    'mostrar mis polos online',
    'catálogo de ropa online',
    'vender ropa por WhatsApp',
    'tienda online para Gamarra',
  ],
  alternates: {
    canonical: '/gamarra',
  },
  openGraph: {
    title,
    description,
    url: `${APP_URL}/gamarra`,
    siteName: 'Kyllari',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    locale: 'es_LA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
}

// El texto de estas respuestas DEBE coincidir con el FAQ visible
// en GamarraLanding (regla de Google para FAQ rich snippets).
const faqData = [
  {
    q: 'Sirve para vender en Gamarra si no sé nada de tecnología?',
    a: 'Sí. Kyllari está hecho para comerciantes sin conocimientos técnicos: llenas formularios simples con el nombre de tu negocio, subes fotos de tus productos y eliges una plantilla. En 5 minutos tienes tu catálogo online funcionando, sin programar nada.',
  },
  {
    q: 'Mi cliente necesita descargar alguna aplicación?',
    a: 'No. Tu catálogo es una página web que abre en cualquier celular con el enlace o el código QR. Tu cliente ve tus productos con fotos y precios, toca el botón de WhatsApp y te escribe directo. Nada que instalar, nada que registrar.',
  },
  {
    q: 'Cuánto cuesta un catálogo online para Gamarra?',
    a: `Kyllari tiene un plan gratuito para siempre para empezar con tus primeros productos. Si necesitas más capacidad, el plan Pro cuesta S/${PLAN_PRICES.pro?.toFixed(2)}/mes y el Premium S/${PLAN_PRICES.premium?.toFixed(2)}/mes. Sin comisión por venta: lo que vendes es tuyo.`,
  },
]

export default function GamarraPage() {
  return (
    <>
      {/* FAQ JSON-LD: rich snippet de preguntas frecuentes en Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqData.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <GamarraLanding faq={faqData} />
    </>
  )
}
