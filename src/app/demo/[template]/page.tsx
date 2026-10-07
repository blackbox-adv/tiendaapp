import { DemoTemplateClient } from './DemoTemplateClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const templateMeta: Record<string, { name: string; description: string }> = {
  luxury: {
    name: 'Luxury',
    description: 'Demo de la plantilla Luxury exclusiva Premium - Kyllari',
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Demo de la plantilla Minimalist exclusiva Premium - Kyllari',
  },
  moderna: {
    name: 'Moderna',
    description: 'Demo de la plantilla Moderna - Kyllari',
  },
  vibrante: {
    name: 'Vibrante',
    description: 'Demo de la plantilla Vibrante - Kyllari',
  },
  clasica: {
    name: 'Clasica',
    description: 'Demo de la plantilla Clasica - Kyllari',
  },
  bodega: {
    name: 'Mercadito',
    description: 'Demo de la plantilla Mercadito para bodegas y abarrotes - Kyllari',
  },
  sabor: {
    name: 'Sabores',
    description: 'Demo de la plantilla Sabores para restaurantes - Kyllari',
  },
  moda: {
    name: 'Pasarela',
    description: 'Demo de la plantilla Pasarela para boutiques de moda - Kyllari',
  },
  vitrina: {
    name: 'Vitrina',
    description: 'Demo de la plantilla Vitrina estilo lookbook editorial para joyería, flores y belleza - Kyllari',
  },
  neon: {
    name: 'Tech',
    description: 'Demo de la plantilla Tech blanca premium con banner para celulares y electrónica - Kyllari',
  },
  boutique: {
    name: 'Boutique',
    description: 'Demo de la plantilla Boutique estilo marca de moda: hero editorial, categorías con foto y grilla lookbook - Kyllari',
  },
  editorial: {
    name: 'Editorial',
    description: 'Demo de la plantilla Editorial estilo catálogo de revista: portada tipográfica, índice numerado y fichas de producto - Kyllari',
  },
  atelier: {
    name: 'Atelier',
    description: 'Demo de la plantilla Atelier de moda femenina delicada: arcos, serif itálica y rosa empolvado - Kyllari',
  },
  terracota: {
    name: 'Terracota',
    description: 'Demo de la plantilla Terracota artesanal y cálida: hecho a mano, valores del oficio y ofertas del mes - Kyllari',
  },
  dulce: {
    name: 'Dulce',
    description: 'Demo de la plantilla Dulce para pastelerías y postres: lila pastel, stickers y encargos por WhatsApp - Kyllari',
  },
  calle: {
    name: 'Calle',
    description: 'Demo de la plantilla Calle streetwear urbano: negro y lima ácido, drops limitados y tipografía gigante - Kyllari',
  },
  aura: {
    name: 'Aura',
    description: 'Demo de la plantilla Aura para joyerías y accesorios finos: champán y oro, serif editorial y líneas doradas - Kyllari',
  },
  teca: {
    name: 'Teca',
    description: 'Demo de la plantilla Teca para hogar y decoración: verde salvia, madera cálida y ambiente acogedor - Kyllari',
  },
  volt: {
    name: 'Volt',
    description: 'Demo de la plantilla Volt para deporte y fitness: azul marino y naranja eléctrico, envío 24h y energía pura - Kyllari',
  },
  grano: {
    name: 'Grano',
    description: 'Demo de la plantilla Grano para cafeterías y panadería artesanal: crema y espresso, carta estilo menú - Kyllari',
  },
  flora: {
    name: 'Flora',
    description: 'Demo de la plantilla Flora para florerías y regalos: verde botánico, rosa empolvado y ramos frescos - Kyllari',
  },
  mesa: {
    name: 'Mesa',
    description: 'Demo de la plantilla Mesa para restaurantes: menú del día, carta elegante y reservas por WhatsApp - Kyllari',
  },
  sushi: {
    name: 'Nikkei',
    description: 'Demo de la plantilla Nikkei para sushi bars: rojo japonés, barra de rolls y tablas para compartir - Kyllari',
  },
  cafe: {
    name: 'Barista',
    description: 'Demo de la plantilla Barista para cafeterías: lattes, frappés, postres y pan artesanal - Kyllari',
  },
  bar: {
    name: 'Barra',
    description: 'Demo de la plantilla Barra para bares: happy hour, tragos artesanales y piqueos - Kyllari',
  },
  pop: {
    name: 'Pop',
    description: 'Demo de la plantilla Pop para e-commerce multi-rubro: ofertas, envíos rápidos y catálogo limpio - Kyllari',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ template: string }> }): Promise<Metadata> {
  const { template } = await params
  const meta = templateMeta[template]
  if (!meta) return { title: 'Demo | Kyllari' }
  return {
    title: `Demo: ${meta.name} | Kyllari`,
    description: meta.description,
    // Canonical propia: sin esto heredan canonical "/" del layout raíz y Google
    // trata las demos como duplicados de la home (no posicionan).
    alternates: { canonical: `/demo/${template}` },
  }
}

export default async function DemoTemplatePage({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params

  if (!templateMeta[template]) {
    notFound()
  }

  return <DemoTemplateClient template={template} />
}
