'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Eye, EyeOff, Trash2, Shield } from 'lucide-react'
import DashboardLayout from '../DashboardLayout'

export default function SuperAdmin() {
  const { currentUser } = useStore()
  const [stores, setStores] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_all' }) })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setStores(data); setLoading(false) }).catch(() => setLoading(false))
    // Fallback: fetch all stores
    if (!stores.length) {
      fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'all' }) })
        .catch(() => setLoading(false))
    }
  }, [])

  const filtered = stores.filter((s: any) => s.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout activePage="dashboard">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-violet-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500">Gestiona todas las tiendas de la plataforma</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar tiendas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Tienda</th>
                  <th className="p-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Dueño</th>
                  <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">/{s.slug}</p>
                    </td>
                    <td className="p-3 hidden sm:table-cell text-sm text-gray-600">{s.user?.name || 'N/A'}</td>
                    <td className="p-3"><Badge className="text-xs">{s.plan || 'free'}</Badge></td>
                    <td className="p-3">
                      <Badge className={`text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {s.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
