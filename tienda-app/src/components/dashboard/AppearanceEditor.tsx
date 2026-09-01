'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Store, Palette, MessageCircle } from 'lucide-react'
import DashboardLayout from '../DashboardLayout'

const templates = [
  { id: 'minimal', name: 'Minimal', desc: 'Limpio y elegante', category: 'Ropa & Boutique', gradient: 'from-pink-50 to-white', accent: '#e91e63', free: true },
  { id: 'sabor', name: 'Sabor', desc: 'Cálido y vibrante', category: 'Restaurantes & Comida', gradient: 'from-orange-50 to-amber-50', accent: '#ff6b35', free: true },
  { id: 'elegance', name: 'Elegance', desc: 'Premium y sofisticado', category: 'Lujo & Premium', gradient: 'from-gray-900 to-gray-800', accent: '#c8a456', free: true },
]

export default function AppearanceEditor() {
  const { currentUser, currentStore, setStore } = useStore()
  const [saving, setSaving] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#1a1a2e')
  const [secondaryColor, setSecondaryColor] = useState('#c8a456')

  useEffect(() => {
    if (currentStore) {
      setPrimaryColor((currentStore.primaryColor as string) || '#1a1a2e')
      setSecondaryColor((currentStore.secondaryColor as string) || '#c8a456')
    }
  }, [currentStore])

  const selectTemplate = async (templateId: string) => {
    if (!currentUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, template: templateId }) })
      const data = await res.json()
      if (data.id) setStore(data)
    } catch {}
    setSaving(false)
  }

  const saveColors = async () => {
    if (!currentUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, primaryColor, secondaryColor }) })
      const data = await res.json()
      if (data.id) setStore(data)
    } catch {}
    setSaving(false)
  }

  const currentTemplate = (currentStore?.template as string) || 'minimal'

  return (
    <DashboardLayout activePage="appearance">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Apariencia</h1>

        {/* Template Selector */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Elige una plantilla</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {templates.map(t => (
              <Card key={t.id} className={`border-2 overflow-hidden cursor-pointer transition-all ${currentTemplate === t.id ? 'border-violet-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => selectTemplate(t.id)}>
                <div className={`aspect-[3/2] bg-gradient-to-br ${t.gradient} flex items-center justify-center relative`}>
                  <div className="w-12 h-12 rounded-xl shadow-lg flex items-center justify-center" style={{ backgroundColor: t.accent }}>
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  {currentTemplate === t.id && <div className="absolute top-2 right-2"><Badge className="bg-violet-600 text-white text-[10px]"><Check className="h-3 w-3 mr-0.5" /> Activa</Badge></div>}
                </div>
                <CardContent className="p-3">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Colors */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Colores personalizados</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color principal</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color secundario</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            <Button onClick={saveColors} className="mt-4 bg-violet-600 hover:bg-violet-700 text-white">Guardar colores</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700">{children}</label>
}
