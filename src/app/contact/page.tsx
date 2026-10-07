import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta al equipo de Kyllari. Estamos aqui para ayudarte a crear tu tienda online en Peru.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contacto | Kyllari',
    description: 'Contacta al equipo de Kyllari para crear tu tienda online en Peru.',
    url: 'https://kyllari.com/contact',
    type: 'website',
    siteName: 'Kyllari',
  },
}

export default function ContactPage() {
  return <AppRouter />
}
