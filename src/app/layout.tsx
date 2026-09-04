import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/CookieConsent";
import { CartProvider } from "@/lib/cart-context";
import { getPlatformContact } from "@/lib/platform-settings";
import { PLAN_PRICES } from "@/lib/plans";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TiendApp | Crea tu catálogo online y vende por WhatsApp — Latinoamérica",
    template: "%s | TiendApp",
  },
  description: "Crea tu catálogo online en 5 minutos y recibe pedidos por WhatsApp. Tus métodos de pago locales (Yape, Plin, Mercado Pago y más), tus opciones de envío y plantillas por rubro. Gratis, sin tarjeta y sin comisión por venta.",
  keywords: [
    "tienda online gratis", "crear catálogo online", "vender por WhatsApp",
    "catálogo digital WhatsApp", "tienda online para bodega", "carta digital para restaurante",
    "catálogo virtual ropa", "TiendApp", "tienda virtual gratis",
    "vender por internet", "emprendimiento", "catálogo para Gamarra", "carta digital QR",
    "tienda online Perú", "tienda online México", "vender por WhatsApp Colombia",
    "catálogo digital Argentina", "tienda online Chile", "e-commerce Latinoamérica",
  ],
  authors: [{ name: "TiendApp" }],
  creator: "TiendApp",
  publisher: "TiendApp",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tienda.blackboxperu.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TiendApp | Crea tu catálogo online y vende por WhatsApp",
    description: "Tu tienda con pedidos por WhatsApp, los métodos de pago de tu país y tus opciones de envío. Lista en 5 minutos, gratis y sin comisión por venta.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://tienda.blackboxperu.com",
    siteName: "TiendApp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TiendApp - Crea tu tienda online en Latinoamérica",
      },
    ],
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TiendApp | Crea tu catálogo online y vende por WhatsApp",
    description: "Tu tienda con pedidos por WhatsApp y los métodos de pago de tu país. Gratis, sin comisión por venta.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "REPLACE_WITH_REAL_GOOGLE_VERIFICATION_CODE",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch contact info from DB for JSON-LD (server-side, cached)
  const contact = await getPlatformContact()

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="language" content="Spanish" />
        <link rel="preconnect" href="https://web.whatsapp.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <CartProvider>
          {/* Organization JSON-LD for brand SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'TiendApp',
                url: process.env.NEXT_PUBLIC_APP_URL || 'https://tienda.blackboxperu.com',
                logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tienda.blackboxperu.com'}/logo.svg`,
                description: 'La plataforma para crear tiendas online sin conocimientos técnicos en toda Latinoamérica. WhatsApp integrado, plantillas profesionales, tus métodos de pago locales y tus opciones de envío.',
                email: contact.contactEmail,
                telephone: contact.contactPhone,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Lima',
                  addressCountry: 'PE',
                },
                sameAs: [
                  'https://twitter.com/tiendapp',
                  'https://instagram.com/tiendapp',
                  'https://facebook.com/tiendapp',
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  availableLanguage: ['Spanish'],
                },
              }),
            }}
          />
          {/* SoftwareApplication JSON-LD (rich result con precios de planes) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'TiendApp',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                description: 'Crea tu catálogo online en 5 minutos y recibe pedidos por WhatsApp. Con los métodos de pago de tu país, tus opciones de envío y plantillas por rubro.',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'PEN',
                  description: 'Plan gratis para siempre. Plan Pro y Premium disponibles.',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  ratingCount: '127',
                },
              }),
            }}
          />
          {/* FAQ JSON-LD for rich snippets */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'Cómo crear una tienda online gratis con TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Regístrate gratis en TiendApp, completa el asistente de configuración, elige tu plantilla favorita y agrega tus productos. En menos de 5 minutos tu tienda estará lista para recibir pedidos vía WhatsApp.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Cuánto cuesta TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: `TiendApp tiene un plan gratuito con hasta 5 productos. El plan Pro cuesta S/${PLAN_PRICES.pro?.toFixed(2)}/mes con hasta 20 productos y buscador, y el plan Premium cuesta S/${PLAN_PRICES.premium?.toFixed(2)}/mes con hasta 100 productos, filtros avanzados y funciones premium.`,
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Necesito conocimientos técnicos para usar TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'No. TiendApp está diseñada para emprendedores sin conocimientos técnicos. Solo necesitas llenar formularios simples, elegir una plantilla y agregar tus productos. Todo se configura de forma visual e intuitiva.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Puedo integrar WhatsApp con mi tienda online?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Sí. TiendApp integra WhatsApp directamente en tu tienda. Tus clientes pueden contactarte y realizar pedidos con un solo clic desde cualquier producto de tu catálogo.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Qué métodos de pago acepta TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Para pagar la suscripción de TiendApp puedes usar Yape, Plin, Mercado Pago, transferencia bancaria, tarjeta de crédito o débito. Además, en tu tienda puedes mostrar los métodos de pago que uses en tu país (Yape, Plin, Mercado Pago, Nequi, Sinpe Móvil y más) y tus opciones de envío.',
                    },
                  },
                ],
              }),
            }}
          />
          {/* Cookie Consent Banner */}
          <CookieConsent />
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
