'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Search, Users, Shield, User, ToggleLeft, ToggleRight, KeyRound, Trash2, Pencil, Crown, Zap, Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface ApiUser {
  id: string; name: string; email: string; role: string; phone: string | null; avatar: string | null
  isActive: boolean; lastLogin: string | null; createdAt: string
  stores: { id: string; name: string; slug: string; isActive: boolean }[]
  subscriptions: { status: string; plan: { id: string; name: string; price: number } }[]
}

function UserCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-8 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

export function AdminUsers() {
  const { navigate } = useAppStore()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; email: string; storeCount: number } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Reset password dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<{ id: string; email: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  // Edit user dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ApiUser | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Change plan dialog
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [planTarget, setPlanTarget] = useState<ApiUser | null>(null)
  const [availablePlans, setAvailablePlans] = useState<{ id: string; type: string; name: string; price: number; maxProducts: number }[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [planSaving, setPlanSaving] = useState(false)
  const [planError, setPlanError] = useState('')
  const [planSuccess, setPlanSuccess] = useState(false)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || data)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function toggleUserActive(userId: string, currentActive: boolean) {
    setTogglingId(userId)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: userId, isActive: !currentActive }),
      })
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentActive } : u))
    } catch (err) { console.error(err) }
    finally { setTogglingId(null) }
  }

  function openResetDialog(userId: string, userEmail: string) {
    setResetTarget({ id: userId, email: userEmail })
    setNewPassword('')
    setPasswordError('')
    setResetSuccess(false)
    setResetDialogOpen(true)
  }

  function openEditDialog(user: ApiUser) {
    setEditTarget(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditPhone(user.phone || '')
    setEditError('')
    setEditDialogOpen(true)
  }

  async function confirmEditUser() {
    if (!editTarget) return
    if (!editName.trim() || editName.trim().length < 2) {
      setEditError('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (!editEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      setEditError('Ingresa un email valido')
      return
    }
    setEditSaving(true)
    setEditError('')
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: editTarget.id,
          name: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          phone: editPhone.trim() || '',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const updatedUser = data.data || data
        setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, name: editName.trim(), email: editEmail.trim().toLowerCase(), phone: editPhone.trim() || null } : u))
        setEditDialogOpen(false)
      } else {
        const data = await res.json().catch(() => ({}))
        setEditError(data.error || 'Error al actualizar el usuario')
      }
    } catch {
      setEditError('Error de conexion')
    } finally {
      setEditSaving(false)
    }
  }

  function openDeleteDialog(userId: string, userName: string, userEmail: string, storeCount: number) {
    setDeleteTarget({ id: userId, name: userName, email: userEmail, storeCount })
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch(`/api/users?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
        setDeleteDialogOpen(false)
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Error al eliminar el usuario')
      }
    } catch {
      alert('Error de conexion al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  function openPlanDialog(user: ApiUser) {
    setPlanTarget(user)
    setSelectedPlanId('')
    setPlanError('')
    setPlanSuccess(false)
    setPlanDialogOpen(true)
    // Fetch plans
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        const plans = Array.isArray(data) ? data : (data.data || [])
        setAvailablePlans(plans)
        // Auto-select current plan
        const latestSub = user.subscriptions[user.subscriptions.length - 1]
        if (latestSub?.plan?.id) {
          setSelectedPlanId(latestSub.plan.id)
        } else {
          const freePlan = plans.find((p: { type: string }) => p.type === 'free')
          if (freePlan) setSelectedPlanId(freePlan.id)
        }
      })
      .catch(() => setPlanError('Error al cargar planes'))
  }

  async function confirmChangePlan() {
    if (!planTarget || !selectedPlanId) return
    const userStore = planTarget.stores[0]
    if (!userStore) {
      setPlanError('Este usuario no tiene tienda. Crea una tienda primero.')
      return
    }
    setPlanSaving(true)
    setPlanError('')
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: planTarget.id,
          storeId: userStore.id,
          planId: selectedPlanId,
          status: 'active',
        }),
      })
      if (res.ok) {
        setPlanSuccess(true)
        // Update local user data
        const selectedPlan = availablePlans.find(p => p.id === selectedPlanId)
        setUsers(prev => prev.map(u => {
          if (u.id === planTarget.id) {
            const newSub = { status: 'active', plan: { id: selectedPlanId, name: selectedPlan?.name || '', price: selectedPlan?.price || 0 } }
            return { ...u, subscriptions: [...u.subscriptions.filter(s => s.status !== 'active'), newSub] }
          }
          return u
        }))
        setTimeout(() => setPlanDialogOpen(false), 1500)
      } else {
        const data = await res.json().catch(() => ({}))
        setPlanError(data.error || 'Error al cambiar el plan')
      }
    } catch {
      setPlanError('Error de conexión')
    } finally {
      setPlanSaving(false)
    }
  }

  async function confirmResetPassword() {
    if (!resetTarget) return
    if (newPassword.length < 8) {
      setPasswordError('Minimo 8 caracteres')
      return
    }
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: resetTarget.id, password: newPassword }),
      })
      if (res.ok) {
        setResetSuccess(true)
        setTimeout(() => setResetDialogOpen(false), 1500)
      } else {
        setPasswordError('Error al actualizar la contraseña')
      }
    } catch (err) {
      console.error(err)
      setPasswordError('Error de conexion')
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 max-w-md w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <UserCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 mt-1">{users.length} usuarios registrados</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Buscar usuarios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          const latestSub = user.subscriptions[user.subscriptions.length - 1]
          const planName = latestSub?.plan?.name || 'Free'
          const subStatus = latestSub?.status || 'N/A'
          const userStore = user.stores[0]

          return (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${user.role === 'super_admin' ? 'bg-amber-100' : 'bg-violet-100'}`}>
                      {user.role === 'super_admin' ? <Shield className="w-5 h-5 text-amber-600" /> : <User className="w-5 h-5 text-violet-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleUserActive(user.id, user.isActive)} disabled={togglingId === user.id}
                    className={`flex-shrink-0 ${user.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {togglingId === user.id ? <div className="animate-spin w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full" /> : user.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Rol</span>
                    <Badge className={user.role === 'super_admin' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}>
                      {user.role === 'super_admin' ? 'Administrador' : 'Propietario'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500 flex-shrink-0">Suscripción</span>
                    <span className="text-xs font-medium truncate">{planName} ({subStatus})</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500 flex-shrink-0">Tienda</span>
                    <span className="text-xs text-gray-700 truncate">{userStore ? userStore.name : 'Sin tienda'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Último login</span>
                    <span className="text-xs text-gray-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-PE') : 'Nunca'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Estado</span>
                    <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => openEditDialog(user)}>
                    <Pencil className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => openPlanDialog(user)}>
                    <Crown className="w-3 h-3 mr-1" /> Plan
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => openResetDialog(user.id, user.email)}>
                    <KeyRound className="w-3 h-3 mr-1" /> Clave
                  </Button>
                  {user.role !== 'super_admin' && (
                    <Button variant="outline" size="sm" className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => openDeleteDialog(user.id, user.name, user.email, user.stores.length)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {filteredUsers.length === 0 && (
        <Card><CardContent className="py-12 text-center text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No se encontraron usuarios</p></CardContent></Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos de <span className="font-semibold text-gray-900">{editTarget?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                placeholder="Nombre completo"
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setEditError('') }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={editEmail}
                onChange={(e) => { setEditEmail(e.target.value); setEditError('') }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                placeholder="+51 999 888 777"
                value={editPhone}
                onChange={(e) => { setEditPhone(e.target.value); setEditError('') }}
              />
            </div>
            {editError && <p className="text-xs text-red-500">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editSaving}>Cancelar</Button>
            <Button onClick={confirmEditUser} disabled={editSaving || !editName.trim() || !editEmail.trim()}>
              {editSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Nueva contraseña para <span className="font-semibold text-gray-900">{resetTarget?.email}</span>
            </DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm font-medium text-green-700">Contraseña actualizada correctamente</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nueva contraseña</label>
                  <Input
                    type="password"
                    placeholder="Minimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmResetPassword() }}
                  />
                  {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancelar</Button>
                <Button onClick={confirmResetPassword} disabled={!newPassword || newPassword.length < 8}>Guardar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar plan de suscripción</DialogTitle>
            <DialogDescription>
              Cambiar el plan de <span className="font-semibold text-gray-900">{planTarget?.name}</span>
              {planTarget?.stores[0] ? (
                <span> para la tienda <span className="font-semibold text-gray-900">{planTarget.stores[0].name}</span></span>
              ) : (
                <span className="text-red-500 block mt-1">Este usuario no tiene tienda.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          {planSuccess ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm font-medium text-green-700">Plan actualizado correctamente</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 py-2">
                {availablePlans.length === 0 && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                  </div>
                )}
                {availablePlans.map(plan => {
                  const planIconMap: Record<string, React.ElementType> = { free: Gift, pro: Zap, premium: Crown }
                  const Icon = planIconMap[plan.type] || Gift
                  const isSelected = selectedPlanId === plan.id
                  const isCurrentPlan = planTarget?.subscriptions[planTarget.subscriptions.length - 1]?.plan?.id === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        plan.type === 'premium' ? 'bg-amber-100' : plan.type === 'pro' ? 'bg-violet-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          plan.type === 'premium' ? 'text-amber-600' : plan.type === 'pro' ? 'text-violet-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{plan.name}</span>
                          {isCurrentPlan && (
                            <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">Actual</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          S/{plan.price.toFixed(2)}/mes · {plan.maxProducts >= 100 ? '∞' : plan.maxProducts} productos
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>
                  )
                })}
              </div>
              {planError && <p className="text-xs text-red-500">{planError}</p>}
            </>
          )}
          {!planSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanDialogOpen(false)} disabled={planSaving}>Cancelar</Button>
              <Button
                onClick={confirmChangePlan}
                disabled={planSaving || !selectedPlanId || !planTarget?.stores[0]}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {planSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Cambiando...</>
                ) : 'Cambiar plan'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>Estas a punto de eliminar permanentemente la cuenta de <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}).</span>
              {deleteTarget && deleteTarget.storeCount > 0 && (
                <span className="block text-red-600 font-medium">Se eliminara tambien su tienda y {deleteTarget.storeCount} tienda(s) con todos sus productos, suscripciones y pagos asociados.</span>
              )}
              <span className="block">Esta accion no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Eliminando...' : 'Eliminar permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
