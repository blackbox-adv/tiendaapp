'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Check, Gift, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const iconMap: Record<string, React.ElementType> = { free: Gift, pro: Zap, premium: Crown }

interface Plan {
  id: string
  type: string
  name: string
  price: number
  maxProducts: number
  description: string
  features: string[]
  popular: boolean
}

export function Pricing() {
  const navigate = useAppStore((s) => s.navigate)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlans(data)
      })
      .catch(() => { /* fallback: empty */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl p-8 bg-white border border-gray-200 space-y-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-20" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-4 w-full" />)}
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const Icon = iconMap[plan.type] || Gift
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    plan.popular
                      ? 'bg-violet-600 text-white shadow-2xl shadow-violet-200 scale-105 z-10'
                      : 'bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                      MAS POPULAR
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-white/20' : 'bg-violet-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-violet-600'}`} />
                  </div>

                  <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-violet-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price === 0 ? 'Gratis' : `S/${plan.price.toFixed(2)}`}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm ${plan.popular ? 'text-violet-200' : 'text-gray-400'}`}>/mes</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-violet-200' : 'text-violet-600'}`} />
                        <span className={`text-sm ${plan.popular ? 'text-violet-50' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => navigate({ page: 'register' })}
                    className={`w-full py-3 rounded-xl font-semibold ${
                      plan.popular
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
        )}
      </div>
    </section>
  )
}
