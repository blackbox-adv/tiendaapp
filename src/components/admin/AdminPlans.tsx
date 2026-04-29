'use client'

import { useEffect, useState } from 'react'
import { CreditCard, TrendingUp, CheckCircle2, XCircle, Clock, Eye, RefreshCw, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PaymentRecord {
  id: string; amount: number; currency: string; status: string; paymentMethod: string | null
  externalRef: string | null; notes: string | null; verifiedAt: string | null; createdAt: string
  user: { name: string; email: string }; store: { name: string; slug: string }; plan: { name: string; price: number }
  subscription: { status: string }
}

interface SubscriptionRecord {
  id: string; status: string; startDate: string; endDate: string | null; nextBillingDate: string | null
  billingCycle: string; amountPaid: number
  user: { id: string; name: string; email: string }; store: { id: string; name: string; slug: string }
  plan: { id: string; name: string; price: number; type: string }
}

export function AdminPlans() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [tab, setTab] = useState<'subscriptions' | 'payments' | 'verify'>('subscriptions')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tiendapp_token') : null
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

      const [payRes, subRes] = await Promise.all([
        fetch('/api/payments', { headers }),
        fetch('/api/subscriptions', { headers }),
      ])

      if (payRes.ok) { const d = await payRes.json(); setPayments(d.payments || []) }
      if (subRes.ok) setSubscriptions(await subRes.json())
    } catch (err) {
      console.error('Error loading plans:', err)
    } finally {
      setLoading(false)
    }
  }

  async function verifyPayment(paymentId: string, status: string, notes?: string) {
    setActionLoading(paymentId)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: paymentId, status, notes }),
      })
      if (res.ok) {
        await loadData()
      }
    } catch (err) {
      console.error('Error verifying payment:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function changeSubscription(subId: string, newPlanId: string) {
    setActionLoading(subId)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: subId, planId: newPlanId }),
      })
      if (res.ok) await loadData()
    } catch (err) {
      console.error('Error changing subscription:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function cancelSubscription(subId: string) {
    if (!confirm('¿Cancelar esta suscripción? El usuario será degradado al plan Free.')) return
    setActionLoading(subId)
    try {
      const token = localStorage.getItem('tiendapp_token')
      // Get the free plan
      const plansRes = await fetch('/api/plans')
      const plans = await plansRes.json()
      const freePlan = plans.find((p: any) => p.type === 'free')
      if (!freePlan) return

      const res = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: subId, planId: freePlan.id, status: 'cancelled' }),
      })
      if (res.ok) await loadData()
    } catch (err) {
      console.error('Error cancelling subscription:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function runBillingCheck() {
    if (!confirm('¿Ejecutar verificación de facturación ahora? Esto marcará suscripciones vencidas y degradará las que llevan 7+ días sin pago.')) return
    setActionLoading('billing')
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/billing/check', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result = await res.json()
        alert(result.message)
        await loadData()
      }
    } catch (err) {
      console.error('Error running billing check:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    active: { label: 'Activo', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    past_due: { label: 'Vencido', color: 'bg-orange-100 text-orange-700', icon: Clock },
    expired: { label: 'Expirado', color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-600', icon: XCircle },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    completed: { label: 'Verificado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    failed: { label: 'Fallido', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded: { label: 'Reembolsado', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  }

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length
  const completedRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const mrr = subscriptions.filter(s => s.status === 'active' && s.plan.type !== 'free').reduce((s, sub) => s + sub.plan.price, 0)

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes y Pagos</h1>
          <p className="text-gray-500 mt-1">Gestiona suscripciones, verifica pagos y controla accesos</p>
        </div>
        <Button variant="outline" onClick={runBillingCheck} disabled={!!actionLoading}
          className="border-orange-300 text-orange-700 hover:bg-orange-50">
          <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading === 'billing' ? 'animate-spin' : ''}`} />
          Verificar facturación
        </Button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
          <CardContent className="p-5">
            <p className="text-sm text-violet-200">MRR (Ingresos Recurrentes)</p>
            <p className="text-3xl font-bold mt-2">S/{mrr.toFixed(2)}</p>
            <p className="text-xs text-violet-200 mt-1">{subscriptions.filter(s => s.status === 'active' && s.plan.type !== 'free').length} suscripciones de pago</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-5">
            <p className="text-sm text-green-700 font-medium">Pagos verificados</p>
            <p className="text-3xl font-bold text-green-700 mt-2">S/{completedRevenue.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">{payments.filter(p => p.status === 'completed').length} pagos completados</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-5">
            <p className="text-sm text-yellow-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Pagos pendientes
            </p>
            <p className="text-3xl font-bold text-yellow-700 mt-2">{pendingPaymentsCount}</p>
            <p className="text-xs text-yellow-600 mt-1">Requieren tu verificación</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {[
          { key: 'subscriptions', label: `Suscripciones (${subscriptions.length})` },
          { key: 'payments', label: `Historial de pagos (${payments.length})` },
          { key: 'verify', label: `Verificar pagos (${pendingPaymentsCount})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Subscriptions Tab */}
      {tab === 'subscriptions' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tienda</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Próx. cobro</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr></thead>
                <tbody>
                  {subscriptions.map(sub => {
                    const sc = statusConfig[sub.status] || statusConfig.active
                    const StatusIcon = sc.icon
                    return (
                      <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{sub.user.name}</p>
                          <p className="text-xs text-gray-400">{sub.user.email}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{sub.store.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{sub.plan.name} - S/{sub.plan.price.toFixed(2)}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${sc.color} gap-1`}><StatusIcon className="w-3 h-3" />{sc.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('es-PE') : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {sub.plan.type !== 'free' && sub.status === 'active' && (
                            <div className="flex justify-end gap-1">
                              <select className="text-xs border rounded px-2 py-1"
                                value={sub.plan.id}
                                onChange={e => changeSubscription(sub.id, e.target.value)}
                                disabled={!!actionLoading}>
                                <option value="free">Free (S/0)</option>
                                <option value="pro">Pro (S/29.99)</option>
                                <option value="premium">Premium (S/79.99)</option>
                              </select>
                              <Button size="sm" variant="ghost" className="text-red-600 h-7 text-xs"
                                onClick={() => cancelSubscription(sub.id)}>Cancelar</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments History Tab */}
      {tab === 'payments' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tienda</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Plan</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Método</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                </tr></thead>
                <tbody>
                  {payments.map(pay => {
                    const sc = statusConfig[pay.status] || statusConfig.pending
                    const StatusIcon = sc.icon
                    return (
                      <tr key={pay.id} className="border-b border-gray-50">
                        <td className="py-3 px-4 text-gray-500 text-xs">{new Date(pay.createdAt).toLocaleDateString('es-PE')}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{pay.user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{pay.store.name}</td>
                        <td className="py-3 px-4"><Badge variant="outline">{pay.plan.name}</Badge></td>
                        <td className="py-3 px-4 text-right font-semibold">S/{pay.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{pay.paymentMethod || 'Manual'}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${sc.color} gap-1`}><StatusIcon className="w-3 h-3" />{sc.label}</Badge>
                          {pay.verifiedAt && <p className="text-[10px] text-gray-400 mt-1">Verificado: {new Date(pay.verifiedAt).toLocaleDateString('es-PE')}</p>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verify Payments Tab */}
      {tab === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Pagos pendientes de verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.filter(p => p.status === 'pending').length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay pagos pendientes de verificación</p>
            ) : (
              <div className="space-y-4">
                {payments.filter(p => p.status === 'pending').map(pay => (
                  <div key={pay.id} className="border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{pay.user.name} - {pay.store.name}</p>
                      <p className="text-sm text-gray-500">{pay.user.email}</p>
                      <p className="text-sm">Plan: <strong>{pay.plan.name}</strong> - <strong>S/{pay.amount.toFixed(2)}</strong></p>
                      {pay.notes && <p className="text-xs text-gray-400">{pay.notes}</p>}
                      <p className="text-xs text-gray-400">Registrado: {new Date(pay.createdAt).toLocaleString('es-PE')}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => verifyPayment(pay.id, 'completed', 'Pago verificado por administrador')}
                        disabled={!!actionLoading}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Aprobar
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600"
                        onClick={() => verifyPayment(pay.id, 'failed', 'Pago rechazado por administrador')}
                        disabled={!!actionLoading}>
                        <XCircle className="w-4 h-4 mr-1" /> Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
