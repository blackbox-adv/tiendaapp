import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// ── Validate environment variables at startup ──
import { validateEnvironment } from "@/lib/env";
const envCheck = validateEnvironment();
if (!envCheck.valid) {
  console.error("[STARTUP] Environment validation FAILED:", envCheck.errors.join(" | "));
}
for (const w of envCheck.warnings) {
  console.warn(`[STARTUP] ${w}`);
}

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
  metadataBase: new URL("https://tiendapp.pe"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TiendApp | Crea tu tienda online en Perú",
    description: "La plataforma líder en Perú para crear tiendas online. WhatsApp integrado, plantillas profesionales y pagos en soles.",
    url: "https://tiendapp.pe",
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
    google: "TU_CODIGO_VERIFICACION_GOOGLE",
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
