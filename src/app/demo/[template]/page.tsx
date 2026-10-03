import { DemoTemplateClient } from './DemoTemplateClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const templateMeta: Record<string, { name: string; description: string }> = {
  luxury: {
    name: 'Luxury',
    description: 'Demo de la plantilla Luxury exclusiva Premium - TiendApp',
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Demo de la plantilla Minimalist exclusiva Premium - TiendApp',
  },
  moderna: {
    name: 'Moderna',
    description: 'Demo de la plantilla Moderna - TiendApp',
  },
  vibrante: {
    name: 'Vibrante',
    description: 'Demo de la plantilla Vibrante - TiendApp',
  },
  clasica: {
    name: 'Clasica',
    description: 'Demo de la plantilla Clasica - TiendApp',
  },
  bodega: {
    name: 'Mercadito',
    description: 'Demo de la plantilla Mercadito para bodegas y abarrotes - TiendApp',
  },
  sabor: {
    name: 'Sabores',
    description: 'Demo de la plantilla Sabores para restaurantes - TiendApp',
  },
  moda: {
    name: 'Pasarela',
    description: 'Demo de la plantilla Pasarela para boutiques de moda - TiendApp',
  },
  vitrina: {
    name: 'Vitrina',
    description: 'Demo de la plantilla Vitrina estilo lookbook editorial para joyería, flores y belleza - TiendApp',
  },
  neon: {
    name: 'Neón',
    description: 'Demo de la plantilla Neón tech para celulares y electrónica - TiendApp',
  },
  boutique: {
    name: 'Boutique',
    description: 'Demo de la plantilla Boutique estilo marca de moda: hero editorial, categorías con foto y grilla lookbook - TiendApp',
  },
  editorial: {
    name: 'Editorial',
    description: 'Demo de la plantilla Editorial estilo catálogo de revista: portada tipográfica, índice numerado y fichas de producto - TiendApp',
  },
  atelier: {
    name: 'Atelier',
    description: 'Demo de la plantilla Atelier de moda femenina delicada: arcos, serif itálica y rosa empolvado - TiendApp',
  },
  terracota: {
    name: 'Terracota',
    description: 'Demo de la plantilla Terracota artesanal y cálida: hecho a mano, valores del oficio y ofertas del mes - TiendApp',
  },
  dulce: {
    name: 'Dulce',
    description: 'Demo de la plantilla Dulce para pastelerías y postres: lila pastel, stickers y encargos por WhatsApp - TiendApp',
  },
  calle: {
    name: 'Calle',
    description: 'Demo de la plantilla Calle streetwear urbano: negro y lima ácido, drops limitados y tipografía gigante - TiendApp',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ template: string }> }): Promise<Metadata> {
  const { template } = await params
  const meta = templateMeta[template]
  if (!meta) return { title: 'Demo | TiendApp' }
  return {
    title: `Demo: ${meta.name} | TiendApp`,
    description: meta.description,
  }
}

export default async function DemoTemplatePage({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params

  if (!templateMeta[template]) {
    notFound()
  }

  return <DemoTemplateClient template={template} />
}
