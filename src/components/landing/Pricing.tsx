'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Check, Gift, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CANONICAL_PLANS } from '@/lib/plans'

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

// Fallback = los planes canónicos (fuente única de verdad: src/lib/plans.ts)
const FALLBACK_PLANS: Plan[] = CANONICAL_PLANS.map((p) => ({ id: p.type, ...p, features: [...p.features] }))

export function Pricing() {
  const navigate = useAppStore((s) => s.navigate)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data)
        } else {
          // API returned empty or non-array — use fallback
          setPlans(FALLBACK_PLANS)
        }
      })
      .catch(() => {
        // API failed — use fallback plans
        setPlans(FALLBACK_PLANS)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-terra-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-[#BC5A38] uppercase tracking-wider">Precios</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-4">
            Planes que se adaptan a ti
          </h2>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Comienza gratis y escala tu plan según crece tu negocio. Sin contratos ni sorpresas.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl p-8 bg-white border border-[#E5DCCB] space-y-4">
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
                      ? 'bg-stone-900 text-white shadow-2xl shadow-stone-900/30 scale-105 z-10 border-2 border-[#BC5A38]'
                      : 'bg-white border border-[#E5DCCB] hover:border-[#BC5A38]/40 hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#BC5A38] text-white text-xs font-bold rounded-full">
                      MÁS ELEGIDO
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-[#BC5A38]/20' : 'bg-[#F6E7DE]'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-[#E29B77]' : 'text-[#BC5A38]'}`} />
                  </div>

                  <h3 className={`font-display text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-stone-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-stone-300' : 'text-stone-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-2">
                    <span className={`text-4xl font-extrabold font-display ${plan.popular ? 'text-white' : 'text-stone-900'}`}>
                      {plan.price === 0 ? 'Gratis' : `S/${plan.price.toFixed(2)}`}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm ${plan.popular ? 'text-stone-400' : 'text-stone-400'}`}>/mes</span>
                    )}
                  </div>
                  {plan.price > 0 && (
                    <p className={`text-xs mb-4 ${plan.popular ? 'text-[#E29B77]' : 'text-stone-400'}`}>
                      ≈ US$ {Math.round(plan.price / 3.7)} · pagas en la moneda de tu país
                    </p>
                  )}

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-[#E29B77]' : 'text-[#BC5A38]'}`} />
                        <span className={`text-sm ${plan.popular ? 'text-stone-200' : 'text-stone-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => {
                      // Usuario logueado: free → dashboard, planes pagos → Mi Plan (upgrade).
                      // Visitante: flujo de registro normal.
                      const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('tiendapp_token')
                      if (isLoggedIn) {
                        window.location.href = plan.type === 'free' ? '/dashboard' : '/dashboard/plan'
                        return
                      }
                      navigate({ page: 'register' })
                    }}
                    className={`w-full py-3 rounded-full font-semibold ${
                      plan.popular
                        ? 'bg-white text-stone-900 hover:bg-[#F6E7DE]'
                        : 'bg-stone-900 text-white hover:bg-[#BC5A38]'
                    }`}
                  >
                    {plan.type === 'free' && 'Crear mi tienda gratis'}
                    {plan.type === 'pro' && 'Empezar con Pro'}
                    {plan.type === 'premium' && 'Empezar con Premium'}
                  </Button>
                  <p className={`text-xs text-center mt-3 ${plan.popular ? 'text-stone-400' : 'text-stone-400'}`}>
                    {plan.price === 0
                      ? 'Sin tarjeta · Sin compromiso'
                      : 'Yape, Plin, Mercado Pago o transferencia'}
                  </p>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
