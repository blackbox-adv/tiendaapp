import type { Metadata } from 'next'
import LandingAIClient from './LandingAIClient'

export const metadata: Metadata = {
  title: 'Landing IA | TiendApp',
  robots: { index: false, follow: false },
}

export default function LandingIAPage() {
  return <LandingAIClient />
}
