'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Check, Crown, Zap, Gift, Building2, QrCode, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ── Types ──────────────────────────────────────────────

interface ApiPlan {
  id: string
  type: string
  name: string
  price: number
  currency: string
  maxProducts: number
  description: string
  features: string[]
  popular: boolean
}

interface PaymentIntent {
  amount: number
  currency: string
  description: string
  metadata: {
    userId: string
    planId: string
    planName: string
    storeId: string | null
    email: string
  }
}

// ── Helpers ────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  free: Gift,
  pro: Zap,
  premium: Crown,
}

function isPlanCurrent(plan: ApiPlan, currentPlanId: string): boolean {
  return plan.id === currentPlanId || plan.type === currentPlanId
}

function buildComparisonRows() {
  return [
    { label: 'Productos', fn: (p: ApiPlan) => (p.maxProducts === -1 ? '∞' : String(p.maxProducts)), isText: true },
    { label: 'Plantilla básica', fn: () => true },
    { label: 'Todas las plantillas', fn: (p: ApiPlan) => p.type !== 'free' },
    { label: 'Botón WhatsApp', fn: () => true },
    { label: 'Dominio personalizado', fn: (p: ApiPlan) => p.type !== 'free' },
    { label: 'Estadísticas avanzadas', fn: (p: ApiPlan) => p.type !== 'free' },
    { label: 'Soporte prioritario', fn: (p: ApiPlan) => p.type !== 'free' },
    { label: 'Soporte 24/7', fn: (p: ApiPlan) => p.type === 'premium' },
    { label: 'Sin marca TiendApp', fn: (p: ApiPlan) => p.type === 'premium' },
  ]
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tiendapp_token') || ''
  }
  return ''
}

const COMPARISON_ROWS = buildComparisonRows()

// ── Component ──────────────────────────────────────────

export function PlanManager() {
  const { currentUser, products, currentStore, changePlan } = useAppStore()

  // Plan list state
  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ApiPlan | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null)
  const [voucherNumber, setVoucherNumber] = useState('')
  const [creatingIntent, setCreatingIntent] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)

  // ── Fetch plans from API ──

  useEffect(() => {
    let cancelled = false

    async function fetchPlans() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/plans')
        if (!res.ok) throw new Error('Error al cargar los planes')
        const data = await res.json()
        if (!cancelled) {
          setPlans(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPlans()
    return () => {
      cancelled = true
    }
  }, [])

  // ── Derived values ──

  const currentPlanId = currentUser?.planId || ''
  const currentPlan =
    plans.find((p) => p.id === currentPlanId) ||
    plans.find((p) => p.type === currentPlanId)
  const storeProducts = currentStore
    ? products.filter((p) => p.storeId === currentStore.id).length
    : 0

  // ── Plan change handler ──

  const handleUpgradePlan = useCallback(
    async (plan: ApiPlan) => {
      if (!currentUser || !currentStore) {
        toast.error('Necesitas tener una tienda para cambiar de plan')
        return
      }

      // ── Free plan: activate subscription directly via API ──
      if (plan.type === 'free') {
        try {
          const token = getToken()
          const res = await fetch('/api/subscriptions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              userId: currentUser.id,
              storeId: currentStore.id,
              planId: plan.id,
              status: 'active',
            }),
          })

          if (res.ok) {
            changePlan(plan.id)
            toast.success(`Has cambiado al plan ${plan.name}`)
          } else {
            const data = await res.json().catch(() => ({}))
            toast.error(data.error || 'Error al cambiar de plan')
          }
        } catch {
          toast.error('Error de conexión')
        }
        return
      }

      // ── Paid plan: create payment intent then show dialog ──
      try {
        setCreatingIntent(true)
        const token = getToken()
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            planId: plan.id,
            storeId: currentStore.id,
            paymentMethod: 'manual',
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          toast.error(data.error || 'Error al iniciar el pago')
          return
        }

        const data = await res.json()

        setSelectedPlan(plan)
        setPaymentIntent(data.paymentIntent)
        setVoucherNumber('')
        setPaymentDialogOpen(true)
      } catch {
        toast.error('Error de conexión al iniciar el pago')
      } finally {
        setCreatingIntent(false)
      }
    },
    [currentUser, currentStore, changePlan],
  )

  // ── Confirm payment (submit voucher) ──

  const handleConfirmPayment = useCallback(async () => {
    if (!voucherNumber.trim()) {
      toast.error('Ingresa el número de operación')
      return
    }
    if (!currentUser || !currentStore || !selectedPlan) return

    try {
      setSubmittingPayment(true)
      const token = getToken()
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          storeId: currentStore.id,
          externalRef: voucherNumber.trim(),
          paymentMethod: 'yape',
        }),
      })

      if (res.ok) {
        setPaymentDialogOpen(false)
        toast.success('¡Pago registrado! Verificaremos tu comprobante pronto.')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al registrar el pago')
      }
    } catch {
      toast.error('Error de conexión al registrar el pago')
    } finally {
      setSubmittingPayment(false)
    }
  }, [currentUser, currentStore, selectedPlan, voucherNumber])

  // ── Render: Loading skeleton ──

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="rounded-xl border border-violet-200 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-6">
          <Skeleton className="h-6 w-36 mb-6" />
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex items-center border-b border-gray-50 py-3 gap-4">
                <Skeleton className="h-4 w-40" />
                <div className="flex-1 flex justify-around">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-5 w-5 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Error state ──

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Plan</h1>
          <p className="text-gray-500 mt-1">Gestiona tu suscripción y mejora tu plan</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Render: No user ──

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="rounded-xl border border-violet-200 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Main content ──

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Plan</h1>
        <p className="text-gray-500 mt-1">
          Gestiona tu suscripción y mejora tu plan
        </p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
                  {(() => {
                    const Icon = iconMap[currentPlan.type] || Gift
                    return <Icon className="w-7 h-7 text-violet-600" />
                  })()}
                </div>
                <div>
                  <p className="text-sm text-violet-600 font-medium">Plan actual</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentPlan.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {currentPlan.maxProducts >= 100
                      ? `${currentPlan.maxProducts} productos`
                      : `${storeProducts}/${currentPlan.maxProducts} productos`}
                    {' · '}S/{currentPlan.price.toFixed(2)}/mes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparar planes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Función
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4">
                      <div
                        className={`text-sm font-bold ${
                          isPlanCurrent(plan, currentPlanId)
                            ? 'text-violet-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {plan.name}
                      </div>
                      <div className="text-lg font-extrabold text-gray-900">
                        S/{plan.price.toFixed(2)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{row.label}</td>
                    {plans.map((plan) => {
                      const val = row.fn(plan)
                      return (
                        <td key={plan.id} className="py-3 px-4 text-center">
                          {row.isText ? (
                            <span className="text-sm font-medium text-gray-700">
                              {val as string}
                            </span>
                          ) : val ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Action row */}
                <tr>
                  <td />
                  {plans.map((plan) => {
                    const isCurrent = isPlanCurrent(plan, currentPlanId)
                    return (
                      <td key={plan.id} className="py-4 px-4 text-center">
                        {isCurrent ? (
                          <div className="text-sm font-semibold text-violet-600 bg-violet-50 py-2 rounded-lg">
                            Plan actual
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleUpgradePlan(plan)}
                            size="sm"
                            disabled={creatingIntent}
                            className={
                              plan.popular
                                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                                : 'border-violet-200 text-violet-600 hover:bg-violet-50'
                            }
                            variant={plan.popular ? 'default' : 'outline'}
                          >
                            {creatingIntent && (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            )}
                            {plan.price === 0 ? 'Downgrade' : 'Cambiar'}
                          </Button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Payment Dialog ── */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completa tu pago</DialogTitle>
            <DialogDescription>
              Realiza el pago por el monto indicado y registra tu comprobante.
            </DialogDescription>
          </DialogHeader>

          {paymentIntent && selectedPlan && (
            <div className="space-y-6 pt-2">
              {/* Amount display */}
              <div className="rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-4 text-center">
                <p className="text-sm text-violet-600 font-medium">Monto a pagar</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  S/{(paymentIntent.amount / 100).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {paymentIntent.description}
                </p>
              </div>

              {/* Yape / Plin info */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-violet-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Pago por Yape / Plin
                  </h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">Número:</span>{' '}
                    +51 999 888 777
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Nombre:</span>{' '}
                    TiendApp SAC
                  </p>
                  <p className="text-xs text-gray-400">
                    Escanea el QR desde la app de Yape o Plin y envía el monto
                    exacto.
                  </p>
                </div>
              </div>

              {/* Bank transfer info */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-violet-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Transferencia bancaria (BCP)
                  </h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">Banco:</span> BCP
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Cuenta:</span>{' '}
                    193-2847561-0-42
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">CCI:</span>{' '}
                    002-193-128475610042
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Nombre:</span>{' '}
                    TiendApp SAC
                  </p>
                </div>
              </div>

              {/* Voucher number input */}
              <div className="space-y-2">
                <Label htmlFor="voucher-number">Número de operación</Label>
                <Input
                  id="voucher-number"
                  placeholder="Ej: 000123456789"
                  value={voucherNumber}
                  onChange={(e) => setVoucherNumber(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Ingresa el número de operación o código de transacción que
                  aparece en tu comprobante.
                </p>
              </div>

              {/* Confirm button */}
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleConfirmPayment}
                disabled={submittingPayment || !voucherNumber.trim()}
              >
                {submittingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar pago'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
