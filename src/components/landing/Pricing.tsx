'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { PLANS } from '@/lib/mock-data'
import { Check, Zap, Crown, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

const iconMap: Record<string, React.ElementType> = { Gift, Zap, Crown }

export function Pricing() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Precios</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Planes que se adaptan a ti
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Comienza gratis y escala tu plan según crece tu negocio. Sin contratos ni sorpresas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => {
            const Icon = iconMap[plan.icon] || Gift
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.isPopular
                    ? 'bg-violet-600 text-white shadow-2xl shadow-violet-200 scale-105 z-10'
                    : 'bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                    MÁS POPULAR
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.isPopular ? 'bg-white/20' : 'bg-violet-100'
                }`}>
                  <Icon className={`w-6 h-6 ${plan.isPopular ? 'text-white' : 'text-violet-600'}`} />
                </div>

                <h3 className={`text-xl font-bold mb-1 ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.isPopular ? 'text-violet-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                    S/{plan.price.toFixed(2)}
                  </span>
                  <span className={`text-sm ${plan.isPopular ? 'text-violet-200' : 'text-gray-400'}`}>/mes</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.isPopular ? 'text-violet-200' : 'text-violet-600'}`} />
                      <span className={`text-sm ${plan.isPopular ? 'text-violet-50' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate({ page: 'register' })}
                  className={`w-full py-3 rounded-xl font-semibold ${
                    plan.isPopular
                      ? 'bg-white text-violet-700 hover:bg-violet-50'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {plan.price === 0 ? 'Comenzar gratis' : 'Comenzar ahora'}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
