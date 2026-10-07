import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce Kyllari, la plataforma lider en Peru para crear tiendas online. Nuestra mision es democratizar el e-commerce para emprendedores peruanos.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Sobre Nosotros | Kyllari',
    description: 'Conoce Kyllari, la plataforma lider en Peru para crear tiendas online.',
    url: 'https://kyllari.com/about',
    type: 'website',
    siteName: 'Kyllari',
  },
}

export default function AboutPage() {
  return <AppRouter />
}
