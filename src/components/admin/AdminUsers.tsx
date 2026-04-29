'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Search, Users, Shield, User, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react'
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
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<{ id: string; email: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setUsers(await res.json())
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

  async function confirmResetPassword() {
    if (!resetTarget) return
    if (newPassword.length < 6) {
      setPasswordError('Minimo 6 caracteres')
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'super_admin' ? 'bg-amber-100' : 'bg-violet-100'}`}>
                      {user.role === 'super_admin' ? <Shield className="w-5 h-5 text-amber-600" /> : <User className="w-5 h-5 text-violet-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleUserActive(user.id, user.isActive)} disabled={togglingId === user.id}
                    className={user.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}>
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Suscripción</span>
                    <span className="text-xs font-medium">{planName} ({subStatus})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Tienda</span>
                    <span className="text-xs text-gray-700">{userStore ? userStore.name : 'Sin tienda'}</span>
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
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => openResetDialog(user.id, user.email)}>
                    <KeyRound className="w-3 h-3 mr-1" /> Reset password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {filteredUsers.length === 0 && (
        <Card><CardContent className="py-12 text-center text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No se encontraron usuarios</p></CardContent></Card>
      )}

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
                    placeholder="Minimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmResetPassword() }}
                  />
                  {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancelar</Button>
                <Button onClick={confirmResetPassword} disabled={!newPassword || newPassword.length < 6}>Guardar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
