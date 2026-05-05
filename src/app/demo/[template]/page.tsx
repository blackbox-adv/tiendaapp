import { DemoTemplateClient } from './DemoTemplateClient'
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Plantilla no encontrada</p>
      </div>
    )
  }

  return <DemoTemplateClient template={template} />
}
