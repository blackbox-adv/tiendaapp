'use client'

import { useCallback, useEffect, useState } from 'react'
import { Users, Loader2, UserPlus, Trash2, Phone, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { getAuthHeaders } from '@/lib/api'

// ============================================================
// Empleados / vendedoras (dueno, Premium).
// Cada empleado tiene su propio login y su propio WhatsApp: atiende
// los chats de la tienda y sus respuestas llevan su número para que
// el cliente pueda continuar ahí ("derivar" conversaciones).
// ============================================================

interface Member {
  id: string
  name: string
  email: string
  whatsappNumber: string | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

export default function EmployeesPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [max, setMax] = useState(5)
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', whatsapp: '' })
  const [editing, setEditing] = useState<Member | null>(null)
  const [editWhatsapp, setEditWhatsapp] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/store-members', { headers: getAuthHeaders() })
      const data = await res.json().catch(() => ({}))
      if (res.status === 403) {
        setBlocked(data?.error || 'Los empleados estan disponibles en el plan Premium.')
        return
      }
      if (res.ok) {
        const payload = data?.data || data
        setMembers(Array.isArray(payload?.members) ? payload.members : [])
        setMax(payload?.max || 5)
        setBlocked('')
      }
    } catch { /* siguiente intento */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/store-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          whatsappNumber: form.whatsapp,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'No se pudo crear el empleado')
        return
      }
      toast.success('Empleado creado', { description: `${form.name} ya puede iniciar sesión con su email y contraseña.` })
      setCreating(false)
      setForm({ name: '', email: '', password: '', whatsapp: '' })
      await load()
    } catch {
      toast.error('Error de conexión')
    } finally { setSaving(false) }
  }

  const setActive = async (m: Member, active: boolean) => {
    const res = await fetch(`/api/store-members/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ isActive: active }),
    })
    if (res.ok) {
      toast.success(active ? 'Empleado reactivado' : 'Empleado desactivado')
      await load()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'No se pudo actualizar')
    }
  }

  const saveWhatsapp = async () => {
    if (!editing) return
    const res = await fetch(`/api/store-members/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ whatsappNumber: editWhatsapp }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      toast.success('WhatsApp actualizado')
      setEditing(null)
      await load()
    } else {
      toast.error(data?.error || 'No se pudo actualizar')
    }
  }

  const activeCount = members.filter((m) => m.isActive).length
  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    try { return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '—' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" />
            Empleados
            <span className="text-xs bg-violet-100 text-violet-700 font-semibold rounded-full px-2 py-0.5">Premium</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1 max-w-2xl">
            Tu equipo atiende los chats y pedidos de la tienda con su propio login, y cada respuesta lleva su
            WhatsApp para continuar la venta ahí. {activeCount}/{max} activos.
          </p>
        </div>
        {!blocked && (
          <Button onClick={() => setCreating(true)} disabled={activeCount >= max} className="shrink-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar empleado
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : blocked ? (
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-violet-600" />
          </div>
          <p className="font-medium text-stone-800">Función Premium</p>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">{blocked}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-stone-500" />
          </div>
          <p className="font-medium text-stone-800">Aún no tienes empleados</p>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Crea cuentas para tus vendedoras: entran a {typeof window !== 'undefined' ? window.location.origin : ''}/auth/login con su email y verán solo los pedidos y los chats.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${m.isActive ? 'bg-violet-500' : 'bg-stone-300'}`}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-stone-900 flex items-center gap-2">
                  {m.name}
                  {!m.isActive && <span className="text-[10px] bg-stone-100 text-stone-500 rounded-full px-1.5 py-0.5">inactivo</span>}
                </p>
                <p className="text-xs text-stone-500 truncate">{m.email}</p>
              </div>
              <button
                onClick={() => { setEditing(m); setEditWhatsapp(m.whatsappNumber || '') }}
                className="text-xs text-stone-600 hover:text-violet-600 flex items-center gap-1 transition-colors"
                title="Editar WhatsApp del empleado"
              >
                <Phone className="w-3.5 h-3.5" />
                {m.whatsappNumber ? `+${m.whatsappNumber}` : 'Sin WhatsApp'}
              </button>
              <span className="text-[10px] text-stone-400 hidden sm:block">Últ. acceso: {fmtDate(m.lastLogin)}</span>
              {m.isActive ? (
                <Button variant="outline" size="sm" onClick={() => setActive(m, false)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setActive(m, true)}>
                  Reactivar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog crear */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo empleado</DialogTitle>
            <DialogDescription>
              Podrá ver los pedidos y responder los chats de tu tienda. No puede editar productos ni configuraciones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-600">Nombre</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Ana Quispe" maxLength={60} />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600">Email (para iniciar sesión)</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ana@mitienda.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600">Contraseña</label>
              <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600">Su WhatsApp (opcional, para derivar clientes)</label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="51958297236" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setCreating(false)} className="flex-1">Cancelar</Button>
              <Button onClick={create} disabled={saving || !form.name.trim() || !form.email.trim() || form.password.length < 6} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear empleado'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog editar WhatsApp */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>WhatsApp de {editing?.name}</DialogTitle>
            <DialogDescription className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" />
              Cuando {editing?.name} responda un chat, el cliente verá un botón para continuar por este WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} placeholder="51958297236" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancelar</Button>
              <Button onClick={saveWhatsapp} className="flex-1">Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
