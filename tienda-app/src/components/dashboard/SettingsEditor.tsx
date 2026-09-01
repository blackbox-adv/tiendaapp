'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '../DashboardLayout'

export default function SettingsEditor() {
  const { navigate, currentUser, setStore, currentStore } = useStore()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', phone: '', whatsapp: '', email: '', address: '', instagram: '', facebook: '', tiktok: '' })

  useEffect(() => {
    if (currentStore) setForm({ name: (currentStore.name as string) || '', description: (currentStore.description as string) || '', phone: (currentStore.phone as string) || '', whatsapp: (currentStore.whatsapp as string) || '', email: (currentStore.email as string) || '', address: (currentStore.address as string) || '', instagram: (currentStore.instagram as string) || '', facebook: (currentStore.facebook as string) || '', tiktok: (currentStore.tiktok as string) || '' })
  }, [currentStore])

  const handleSave = async () => {
    if (!currentUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, ...form }) })
      const data = await res.json()
      if (data.id) { setStore(data); toast.success('Configuración guardada') }
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  return (
    <DashboardLayout activePage="settings">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de la Tienda</h1>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Información Básica</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nombre de la tienda *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Contacto</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="51999999999" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Dirección</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Redes Sociales</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Instagram</Label><Input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@tu_negocio" /></div>
            <div className="space-y-2"><Label>Facebook</Label><Input value={form.facebook} onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))} /></div>
            <div className="space-y-2"><Label>TikTok</Label><Input value={form.tiktok} onChange={e => setForm(f => ({ ...f, tiktok: e.target.value }))} /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Guardar cambios
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
