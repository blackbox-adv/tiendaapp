import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Politica de Privacidad',
  description: 'Politica de privacidad de Kyllari. Conoce como protegemos tus datos personales y los de tus clientes.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Politica de Privacidad | Kyllari',
    description: 'Politica de privacidad de la plataforma Kyllari.',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kyllari.com'}/privacy`,
    type: 'website',
    siteName: 'Kyllari',
  },
}

export default function PrivacyPage() {
  return <AppRouter />
}
