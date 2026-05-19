'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Search, Eye, ToggleLeft, ToggleRight, Store, BarChart3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApiStore {
  id: string; name: string; slug: string; description: string; logo: string
  primaryColor: string; whatsappNumber: string | null; template: string; category: string
  isActive: boolean; visitCount: number; createdAt: string
  owner: { id: string; name: string; email: string }
  _count: { products: number }
  subscriptions: { status: string; plan: { id: string; name: string; price: number } }[]
}

export function AdminStores() {
  const { navigate } = useAppStore()
  const stores = useAppStore((s) => s.stores)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [apiStores, setApiStores] = useState<ApiStore[] | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; productCount: number; ownerName: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadStores() }, [])

  async function loadStores() {
    setLoading(true)
    try {
      const token = localStorage.getItem('tiendapp_token')
      if (!token) { console.warn('[AdminStores] No token found'); setLoading(false); return }
      const res = await fetch('/api/stores', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setApiStores(data)
          console.log('[AdminStores] Loaded', data.length, 'stores from API')
        } else {
          console.warn('[AdminStores] API did not return an array:', typeof data)
        }
      } else {
        const errText = await res.text().catch(() => 'unknown')
        console.error('[AdminStores] API error', res.status, errText)
      }
    } catch (err) { console.error('[AdminStores] Fetch error:', err) }
    finally { setLoading(false) }
  }

  async function toggleStoreActive(storeId: string, currentActive: boolean) {
    setTogglingId(storeId)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: storeId, isActive: !currentActive }),
      })
      if (res.ok) setApiStores(prev => (prev || []).map(s => s.id === storeId ? { ...s, isActive: !currentActive } : s))
    } catch (err) { console.error(err) }
    finally { setTogglingId(null) }
  }

  function openDeleteDialog(storeId: string, storeName: string, productCount: number, ownerName: string) {
    setDeleteTarget({ id: storeId, name: storeName, productCount, ownerName })
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteStore() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch(`/api/stores?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setApiStores(prev => (prev || []).filter(s => s.id !== deleteTarget.id))
        setDeleteDialogOpen(false)
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Error al eliminar la tienda')
      }
    } catch {
      alert('Error de conexion al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  // Use API stores if available (admin fetches all), otherwise fall back to Zustand store
  const displayStores = apiStores && apiStores.length > 0 ? apiStores : (apiStores === null && stores.length > 0
    ? stores.map(s => ({
        id: s.id, name: s.name, slug: s.slug, description: s.description, logo: s.logo,
        primaryColor: s.colors.primary, whatsappNumber: s.whatsappNumber || null, template: s.template,
        category: s.categoryId, isActive: s.isActive, visitCount: 0, createdAt: s.createdAt,
        owner: { id: s.userId, name: '', email: '' },
        _count: { products: 0 },
        subscriptions: [],
      } as ApiStore))
    : []
  )

  const filteredStores = displayStores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase()) ||
    s.owner.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full" /></div>

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tiendas</h1>
        <p className="text-gray-500 mt-1">{displayStores.length} tiendas registradas</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Buscar tiendas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50/50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Tienda</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Propietario</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Productos</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Visitas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
              </tr></thead>
              <tbody>
                {filteredStores.map(store => {
                  const latestSub = store.subscriptions[store.subscriptions.length - 1]
                  const planName = latestSub?.plan?.name || 'Free'
                  const planPrice = latestSub?.plan?.price || 0
                  const subStatus = latestSub?.status || 'N/A'

                  return (
                    <tr key={store.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: store.primaryColor + '20' }}>
                            {store.logo || <Store className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{store.name}</p>
                            <p className="text-xs text-gray-400 truncate">{store.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-gray-600 truncate max-w-[150px]">{store.owner.name}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{planName} - S/{planPrice.toFixed(2)}</Badge>
                        <p className="text-[10px] text-gray-400 mt-0.5">{subStatus}</p>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-gray-600">{store._count.products}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-gray-600">
                          <BarChart3 className="w-3 h-3" /> {store.visitCount}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={store.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                          {store.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => navigate({ page: 'store', slug: store.slug })} className="text-violet-600 hover:bg-violet-50" title="Ver tienda">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleStoreActive(store.id, store.isActive)} disabled={togglingId === store.id}
                            className={store.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'} title={store.isActive ? 'Desactivar' : 'Activar'}>
                            {togglingId === store.id ? <div className="animate-spin w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full" /> : store.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(store.id, store.name, store._count.products, store.owner.name)} className="text-red-500 hover:bg-red-50 hover:text-red-700" title="Eliminar tienda">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredStores.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{apiStores !== null ? 'No se encontraron tiendas' : 'Cargando tiendas...'}</p>
              {apiStores !== null && apiStores.length === 0 && (
                <p className="text-xs mt-1">Si creaste una tienda y no aparece, verifica que tu usuario tenga rol de administrador.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tienda</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>Estas a punto de eliminar permanentemente la tienda <strong>{deleteTarget?.name}</strong> de <strong>{deleteTarget?.ownerName}</strong>.</span>
              {deleteTarget && deleteTarget.productCount > 0 && (
                <span className="block text-red-600 font-medium">Se eliminaran tambien {deleteTarget.productCount} producto(s), suscripciones y pagos asociados.</span>
              )}
              <span className="block">Esta accion no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStore}
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
