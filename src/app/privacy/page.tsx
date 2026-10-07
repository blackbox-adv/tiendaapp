import { APP_URL } from '@/lib/env'
import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Politica de Privacidad',
  description: 'Politica de privacidad de Kyllari. Conoce como protegemos tus datos personales y los de tus clientes.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Politica de Privacidad | Kyllari',
    description: 'Politica de privacidad de la plataforma Kyllari.',
    url: `${APP_URL}/privacy`,
    type: 'website',
    siteName: 'Kyllari',
  },
}

export default function PrivacyPage() {
  return <AppRouter />
}
