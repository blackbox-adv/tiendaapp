import type { Metadata } from 'next'
import AppRouter from '@/components/AppRouter'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta al equipo de TiendApp. Estamos aqui para ayudarte a crear tu tienda online en Peru. Escribenos a hola@tiendapp.pe.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contacto | TiendApp',
    description: 'Contacta al equipo de TiendApp para crear tu tienda online en Peru.',
    url: 'https://tiendapp.pe/contact',
    type: 'website',
    siteName: 'TiendApp',
  },
}

export default function ContactPage() {
  return <AppRouter />
}
