'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { CATEGORIES } from '@/lib/mock-data'
import { Save, Eye, Store, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StoreSettings() {
  const { currentStore, navigate, updateStoreSettings } = useAppStore()

  const [name, setName] = useState(currentStore?.name || '')
  const [description, setDescription] = useState(currentStore?.description || '')
  const [whatsapp, setWhatsapp] = useState(currentStore?.whatsappNumber || '')
  const [primaryColor, setPrimaryColor] = useState(currentStore?.colors.primary || '#7C3AED')
  const [template, setTemplate] = useState<string>(currentStore?.template || 'moderna')
  const [category, setCategory] = useState(currentStore?.categoryId || '')

  if (!currentStore) return null

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Error', { description: 'El nombre de la tienda es obligatorio.' })
      return
    }
    updateStoreSettings({
      name,
      description,
      whatsappNumber: whatsapp,
      colors: { primary: primaryColor, secondary: primaryColor + '80' },
      template: template as 'moderna' | 'vibrante' | 'clasica',
      categoryId: category,
    })
    toast.success('Tienda actualizada', { description: 'Los cambios se guardaron correctamente.' })
  }

  const presetColors = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de la tienda</h1>
        <p className="text-gray-500 mt-1">Personaliza la información y apariencia de tu tienda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la tienda</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Número de WhatsApp</Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+51999888777"
                />
                <p className="text-xs text-gray-400">Este número se mostrará en tu tienda para que los clientes te contacten.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Plantilla</Label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="moderna">Moderna</option>
                    <option value="vibrante">Vibrante</option>
                    <option value="clasica">Clásica</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Colores de la tienda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color principal</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="max-w-[200px]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Colores predefinidos</p>
                <div className="flex gap-2 flex-wrap">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        primaryColor === c ? 'border-gray-900 scale-110 ring-2 ring-offset-2 ring-gray-300' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
            <Button variant="outline" onClick={() => navigate({ page: 'store', slug: currentStore.slug })} className="gap-2">
              <Eye className="w-4 h-4" />
              Ver tienda
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Vista previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-2" style={{ backgroundColor: primaryColor }} />
                <div className="p-4 text-center">
                  <div className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl" style={{ backgroundColor: primaryColor + '15' }}>
                    {currentStore.logo}
                  </div>
                  <h3 className="font-bold text-gray-900">{name || 'Nombre de la tienda'}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description || 'Descripción...'}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: primaryColor }}>
                    <Store className="w-3 h-3" />
                    Mi Tienda
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
