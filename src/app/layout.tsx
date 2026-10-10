import { APP_URL } from '@/lib/env'
import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/CookieConsent";
import { CartProvider } from "@/lib/cart-context";
import { getPlatformContact } from "@/lib/platform-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serif editorial para los titulares de la landing (estilo tienda premium).
// Solo se usa via la clase .font-display — el resto de la app sigue con Geist.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  // SEO: "tienda online" es la keyword principal (mayor volumen), "catálogo digital"
  // la secundaria (menor competencia). Foco Perú primero; LatAm queda como visión
  // en /about, no como promesa del hero.
  title: {
    default: "Kyllari | Tienda online gratis y pedidos por WhatsApp — Perú",
    template: "%s | Kyllari",
  },
  description: "Crea tu tienda online o catálogo digital en 5 minutos y recibe pedidos por WhatsApp. Cobra con Yape, Plin o como prefieras. Hecho en Perú: gratis, sin tarjeta y sin comisión por venta.",
  keywords: [
    "tienda online gratis", "tienda online Perú", "crear tienda online",
    "crear catálogo online", "catálogo digital Perú", "catálogo digital WhatsApp",
    "vender por WhatsApp", "vender por WhatsApp Perú", "vender por internet Perú",
    "catálogo virtual", "catálogo virtual ropa", "tienda virtual gratis",
    "tienda online para bodega", "carta digital para restaurante", "carta digital QR",
    "catálogo para emprendedores", "mostrar mis productos online",
    "cómo vender mis productos por WhatsApp", "Kyllari",
  ],
  authors: [{ name: "Kyllari" }],
  creator: "Kyllari",
  publisher: "Kyllari",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kyllari | Tienda online gratis y pedidos por WhatsApp",
    description: "Tu tienda online o catálogo con pedidos por WhatsApp y Yape, Plin incluidos. Lista en 5 minutos, gratis y sin comisión por venta.",
    url: APP_URL,
    siteName: "Kyllari",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kyllari - Crea tu tienda online en Perú",
      },
    ],
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kyllari | Tienda online gratis y pedidos por WhatsApp",
    description: "Tu tienda con pedidos por WhatsApp y Yape, Plin incluidos. Gratis, sin comisión por venta.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
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
                name: 'Kyllari',
                url: APP_URL,
                logo: `${APP_URL}/logo.svg`,
                description: 'Plataforma peruana para crear tiendas online y catálogos digitales sin conocimientos técnicos. Pedidos por WhatsApp, métodos de pago locales (Yape, Plin) y plantillas por rubro.',
                email: contact.contactEmail,
                telephone: contact.contactPhone,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Lima',
                  addressCountry: 'PE',
                },
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
                name: 'Kyllari',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                description: 'Crea tu tienda online o catálogo digital en 5 minutos y recibe pedidos por WhatsApp. Cobra con Yape, Plin o como prefieras, con plantillas por rubro.',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'PEN',
                  description: 'Plan gratis para siempre. Plan Pro y Premium disponibles.',
                },
                // NOTA SEO: sin aggregateRating — las reseñas inventadas violan las
                // políticas de datos estructurados de Google (riesgo de penalización
                // manual). Se agrega solo cuando haya reseñas reales de usuarios.
              }),
            }}
          />
          {/* NOTA SEO: el FAQPage JSON-LD vive en src/components/landing/FAQ.tsx,
              generado desde la MISMA lista de preguntas visibles (FAQ_ITEMS).
              Estar aquí (layout global) lo inyectaba en TODAS las páginas,
              incluyendo las de tiendas, donde esas preguntas no existen:
              violación de las políticas de datos estructurados de Google. */}
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
