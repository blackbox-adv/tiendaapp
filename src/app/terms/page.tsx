import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Terminos y Condiciones',
  description: 'Terminos y condiciones de uso de TiendApp. Lee los terminos de servicio para la creacion de tiendas online en Peru.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terminos y Condiciones | TiendApp',
    description: 'Terminos y condiciones de uso de la plataforma TiendApp.',
    url: 'https://tiendapp.pe/terms',
    type: 'website',
    siteName: 'TiendApp',
  },
}

export default function TermsPage() {
  return <AppRouter />
}
