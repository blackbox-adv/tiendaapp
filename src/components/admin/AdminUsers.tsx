'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Search, Users, Shield, User, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ApiUser {
  id: string; name: string; email: string; role: string; phone: string | null; avatar: string | null
  isActive: boolean; lastLogin: string | null; createdAt: string
  stores: { id: string; name: string; slug: string; isActive: boolean }[]
  subscriptions: { status: string; plan: { id: string; name: string; price: number } }[]
}

export function AdminUsers() {
  const { navigate } = useAppStore()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

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

  async function resetPassword(userId: string, userEmail: string) {
    const newPassword = prompt(`Nueva contraseña para ${userEmail}:`)
    if (!newPassword || newPassword.length < 6) { if (newPassword) alert('Mínimo 6 caracteres') ; return }
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: userId, password: newPassword }),
      })
      if (res.ok) alert('Contraseña actualizada correctamente')
    } catch (err) { console.error(err) }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full" /></div>

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
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => resetPassword(user.id, user.email)}>
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
    </div>
  )
}
