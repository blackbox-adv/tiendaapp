'use client'

import { motion } from 'framer-motion'
import { Gift, Sparkles, Rocket, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

/**
 * Escalera de crecimiento: muestra que TiendApp acompaña al emprendedor
 * desde el día 1 (catálogo gratis) hasta lanzar productos con IA y
 * escalar con la tienda completa. Es la respuesta visual a "¿y luego qué?".
 */
interface Level {
  icon: React.ElementType
  level: string
  title: string
  description: string
  badge: string
  badgeClass: string
  iconClass: string
  soon?: boolean
  cta?: { label: string; action: 'register' | 'scroll' }
}

const LEVELS: Level[] = [
  {
    icon: Gift,
    level: 'Empieza hoy',
    title: 'Tu catálogo gratis',
    description:
      'Crea tu tienda en 5 minutos con la plantilla Moderna. Sube tus productos, comparte tu link y recibe tus primeros pedidos por WhatsApp. Gratis para siempre, sin tarjeta.',
    badge: 'S/0 · Plan Gratis',
    badgeClass: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    iconClass: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30',
    cta: { label: 'Crear catálogo gratis', action: 'register' as const },
  },
  {
    icon: Sparkles,
    level: 'Próximamente',
    title: 'Landing con IA para lanzar productos',
    description:
      '¿Lanzaste un modelo nuevo de zapatillas? Sube una foto y la IA crea la página de lanzamiento con copy y diseño profesional. Comparte el link con tus clientes y mide qué producto encanta.',
    badge: 'Muy pronto · Premium',
    badgeClass: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    iconClass: 'text-amber-300 bg-amber-400/10 border-amber-400/30',
    soon: true,
  },
  {
    icon: Rocket,
    level: 'Cuando vendas más',
    title: 'La tienda completa',
    description:
      '8 diseños profesionales según tu rubro, buscador y filtros, packs con descuento, reportes de ventas descargables y hasta 3 tiendas. Todo lo que necesitas para vivir de tu negocio.',
    badge: `Desde S/19.90/mes`,
    badgeClass: 'bg-violet-400/15 text-violet-200 border-violet-400/30',
    iconClass: 'text-violet-200 bg-violet-400/10 border-violet-400/30',
    cta: { label: 'Ver planes', action: 'scroll' as const },
  },
]

export function GrowthLadder() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <section id="escala" className="relative py-20 sm:py-28 bg-gradient-to-b from-violet-950 via-violet-900 to-purple-950 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600 rounded-full filter blur-3xl opacity-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl opacity-10" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-300 uppercase tracking-wider">
            Tu negocio crece, TiendApp crece contigo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Empieza gratis. <span className="text-emerald-300">Vende.</span> Escala cuando
            lo necesites.
          </h2>
          <p className="text-lg text-violet-200/80 max-w-2xl mx-auto">
            No necesitas pagar para empezar. Necesitas pagar cuando tu negocio ya está
            volando — y ahí estamos nosotros.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LEVELS.map((lvl, i) => (
            <motion.div
              key={lvl.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: 'easeOut' }}
              className={`relative rounded-3xl p-7 border backdrop-blur-sm flex flex-col ${
                i === 2
                  ? 'bg-white/10 border-violet-400/40 shadow-2xl shadow-violet-900/50 md:-translate-y-3'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Step number */}
              <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold bg-white text-violet-900 shadow-md">
                PASO {i + 1}
              </span>

              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${lvl.iconClass}`}>
                <lvl.icon className="w-7 h-7" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300/70 mb-1">
                {lvl.level}
              </p>
              <h3 className="text-xl font-bold text-white mb-3">{lvl.title}</h3>
              <p className="text-sm text-violet-100/70 leading-relaxed mb-5 flex-1">
                {lvl.description}
              </p>

              <div className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border text-xs font-bold mb-5 ${lvl.badgeClass}`}>
                {lvl.badge}
              </div>

              {lvl.cta && !lvl.soon && (
                <Button
                  onClick={() =>
                    lvl.cta!.action === 'register'
                      ? navigate({ page: 'register' })
                      : document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className={`w-full font-bold rounded-xl ${
                    i === 0
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white'
                      : 'bg-white text-violet-800 hover:bg-violet-50'
                  }`}
                >
                  {lvl.cta.label}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
