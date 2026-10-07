import { APP_URL } from '@/lib/env'
import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Terminos y Condiciones',
  description: 'Terminos y condiciones de uso de Kyllari. Lee los terminos de servicio para la creacion de tiendas online en Peru.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terminos y Condiciones | Kyllari',
    description: 'Terminos y condiciones de uso de la plataforma Kyllari.',
    url: `${APP_URL}/terms`,
    type: 'website',
    siteName: 'Kyllari',
  },
}

export default function TermsPage() {
  return <AppRouter />
}
