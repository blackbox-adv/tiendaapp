import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
    default: "TiendApp | Crea tu tienda online en Perú",
    template: "%s | TiendApp",
  },
  description: "Crea tu tienda online en minutos con TiendApp. La plataforma #1 en Perú para emprendedores. WhatsApp integrado, plantillas profesionales, pagos en soles. ¡Empieza gratis!",
  keywords: [
    "tienda online Perú", "e-commerce Perú", "crear tienda online", "TiendApp",
    "tienda digital", "WhatsApp Business", "ventas online Perú", "emprendimiento Perú",
    "tienda virtual", "e-commerce Lima", "pagos online soles", "plataforma e-commerce",
  ],
  authors: [{ name: "TiendApp" }],
  creator: "TiendApp",
  publisher: "TiendApp",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tiendapp.pe"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TiendApp | Crea tu tienda online en Perú",
    description: "La plataforma líder en Perú para crear tiendas online. WhatsApp integrado, plantillas profesionales y pagos en soles.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://tiendapp.pe",
    siteName: "TiendApp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TiendApp - Crea tu tienda online en Perú",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TiendApp | Crea tu tienda online en Perú",
    description: "La plataforma líder en Perú para crear tiendas online. WhatsApp integrado y pagos en soles.",
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
    google: "tiendapp",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <head>
        <meta name="geo.region" content="PE" />
        <meta name="geo.placename" content="Perú" />
        <meta name="language" content="es-PE" />
        <link rel="preconnect" href="https://wa.me" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* Organization JSON-LD for brand SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'TiendApp',
                url: 'https://tiendapp.pe',
                logo: 'https://tiendapp.pe/logo.svg',
                description: 'La plataforma lider en Peru para crear tiendas online sin conocimientos tecnicos. WhatsApp integrado, plantillas profesionales y pagos en soles.',
                email: 'hola@tiendapp.pe',
                telephone: '+51999888777',
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
                    name: 'Como crear una tienda online en Peru con TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Registrate gratis en TiendApp, completa el asistente de configuracion, elige tu plantilla favorita y agrega tus productos. En menos de 5 minutos tu tienda estara lista para recibir pedidos via WhatsApp.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Cuanto cuesta TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'TiendApp tiene un plan gratuito con hasta 5 productos. El plan Pro cuesta S/29.90/mes con hasta 20 productos, y el plan Premium cuesta S/59.90/mes con hasta 500 productos y funciones avanzadas como codigo QR y comparticion en redes sociales.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Necesito conocimientos tecnicos para usar TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'No. TiendApp esta disenada para emprendedores sin conocimientos tecnicos. Solo necesitas llenar formularios simples, elegir una plantilla y agregar tus productos. Todo se configura de forma visual e intuitiva.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Puedo integrar WhatsApp con mi tienda online?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Si. TiendApp integra WhatsApp directamente en tu tienda. Tus clientes pueden contactarte y realizar pedidos con un solo clic desde cualquier producto de tu catalogo.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Que metodos de pago acepta TiendApp?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Para pagar la suscripcion de TiendApp puedes usar Yape, transferencia bancaria, tarjeta de credito o debito a traves de Culqi o Niubiz. Los pagos de tus clientes se coordinan directamente contigo via WhatsApp.',
                    },
                  },
                ],
              }),
            }}
          />
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
