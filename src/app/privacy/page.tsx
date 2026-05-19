import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Politica de Privacidad',
  description: 'Politica de privacidad de TiendApp. Conoce como protegemos tus datos personales y los de tus clientes.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Politica de Privacidad | TiendApp',
    description: 'Politica de privacidad de la plataforma TiendApp.',
    url: 'https://tiendapp.pe/privacy',
    type: 'website',
    siteName: 'TiendApp',
  },
}

export default function PrivacyPage() {
  return <AppRouter />
}
