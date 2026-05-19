import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce TiendApp, la plataforma lider en Peru para crear tiendas online. Nuestra mision es democratizar el e-commerce para emprendedores peruanos.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Sobre Nosotros | TiendApp',
    description: 'Conoce TiendApp, la plataforma lider en Peru para crear tiendas online.',
    url: 'https://tiendapp.pe/about',
    type: 'website',
    siteName: 'TiendApp',
  },
}

export default function AboutPage() {
  return <AppRouter />
}
