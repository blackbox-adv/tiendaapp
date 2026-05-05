'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Check, X, Clock, AlertCircle, Search, RefreshCw, CreditCard, User, Store, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string | null
  externalRef: string | null
  verifiedAt: string | null
  notes: string | null
  createdAt: string
  user: { id: string; name: string; email: string; role: string } | null
  plan: { id: string; name: string; price: number; type: string } | null
}

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const limit = 10

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(limit))

      const res = await fetch(`/api/admin/payments?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
        setTotal(data.total || 0)
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error', { description: data.error || 'No se pudieron cargar los pagos' })
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
    setActionLoading(paymentId)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paymentId, action }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(action === 'approve' ? 'Pago aprobado' : 'Pago rechazado', {
          description: data.message || 'Acción realizada correctamente',
        })
        fetchPayments()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error', { description: data.error || 'No se pudo procesar la acción' })
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.externalRef?.toLowerCase().includes(q) ||
      p.user?.name.toLowerCase().includes(q) ||
      p.user?.email.toLowerCase().includes(q) ||
      p.plan?.name.toLowerCase().includes(q)
    )
  })

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    failed: 'Fallido',
    rejected: 'Rechazado',
    refunded: 'Reembolsado',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-500 mt-1">Gestiona y verifica los pagos de los usuarios</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email, operación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { value: 'pending', label: 'Pendientes' },
                { value: 'completed', label: 'Completados' },
                { value: 'rejected', label: 'Rechazados' },
                { value: '', label: 'Todos' },
              ].map((f) => (
                <Button
                  key={f.value || 'all'}
                  variant={statusFilter === f.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(f.value)
                    setPage(1)
                  }}
                  className={statusFilter === f.value ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            {/* Refresh */}
            <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No hay pagos para mostrar</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter ? 'Intenta cambiar el filtro de estado' : 'Los pagos aparecerán aquí cuando los usuarios realicen transacciones'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {payment.user?.name || 'Usuario desconocido'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{payment.user?.email}</p>
                    </div>
                  </div>

                  {/* Plan & Amount */}
                  <div className="flex items-center gap-6 lg:gap-8">
                    <div>
                      <p className="text-xs text-gray-500">Plan</p>
                      <p className="text-sm font-semibold text-gray-900">{payment.plan?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Monto</p>
                      <p className="text-lg font-bold text-violet-600">S/{payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Operación</p>
                      <p className="text-sm font-mono text-gray-700">{payment.externalRef || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Método</p>
                      <p className="text-sm text-gray-700 capitalize">{payment.paymentMethod || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="text-xs text-gray-700">
                        {new Date(payment.createdAt).toLocaleDateString('es-PE', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge className={statusColors[payment.status] || 'bg-gray-100 text-gray-700'}>
                      {statusLabels[payment.status] || payment.status}
                    </Badge>

                    {payment.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleAction(payment.id, 'approve')}
                          disabled={actionLoading === payment.id}
                        >
                          <Check className="w-4 h-4" />
                          {actionLoading === payment.id ? '...' : 'Aprobar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(payment.id, 'reject')}
                          disabled={actionLoading === payment.id}
                        >
                          <X className="w-4 h-4" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} de {total} pagos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
