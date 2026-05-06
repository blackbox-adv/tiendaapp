'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
const CATEGORIES = [
  { id: 'ropa', name: 'Ropa' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'electronica', name: 'Electronica' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'belleza', name: 'Belleza' },
  { id: 'deportes', name: 'Deportes' },
  { id: 'alimentos', name: 'Alimentos' },
  { id: 'juguetes', name: 'Juguetes' },
  { id: 'otros', name: 'Otros' },
]
import { Save, Eye, Store, LayoutTemplate, Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StoreSettings() {
  const { currentStore, navigate, updateStoreSettings } = useAppStore()

  const [name, setName] = useState(currentStore?.name || '')
  const [description, setDescription] = useState(currentStore?.description || '')
  const [whatsapp, setWhatsapp] = useState(currentStore?.whatsappNumber || '')
  const [primaryColor, setPrimaryColor] = useState(currentStore?.colors.primary || '#7C3AED')
  const [template, setTemplate] = useState<string>(currentStore?.template || 'moderna')
  const [category, setCategory] = useState(currentStore?.categoryId || '')
  const [logo, setLogo] = useState(currentStore?.logo || '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [bannerUrl, setBannerUrl] = useState(currentStore?.bannerUrl || '')
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato no válido', { description: 'Solo se permiten JPG, PNG, WebP y GIF' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', { description: 'El logo no debe superar los 5MB' })
      return
    }

    setUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          setLogo(data.url)
        } else {
          toast.error('Error al subir', { description: 'No se recibió la URL del logo' })
        }
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error al subir', { description: data.error || 'Error al subir el logo' })
      }
    } catch {
      toast.error('Error de conexión', { description: 'No se pudo subir el logo' })
    } finally {
      setUploadingLogo(false)
    }
  }, [])

  const handleBannerUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato no válido', { description: 'Solo se permiten JPG, PNG y WebP para el banner' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', { description: 'El banner no debe superar los 5MB' })
      return
    }

    setUploadingBanner(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          setBannerUrl(data.url)
        } else {
          toast.error('Error al subir', { description: 'No se recibió la URL del banner' })
        }
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error al subir', { description: data.error || 'Error al subir el banner' })
      }
    } catch {
      toast.error('Error de conexión', { description: 'No se pudo subir el banner' })
    } finally {
      setUploadingBanner(false)
    }
  }, [])

  if (!currentStore) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-10 max-w-[200px] rounded-md" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-100 p-6 sticky top-8">
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="rounded-xl border h-48" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Error', { description: 'El nombre de la tienda es obligatorio.' })
      return
    }
    updateStoreSettings({
      name,
      description,
      whatsappNumber: whatsapp,
      logo,
      bannerUrl,
      colors: { primary: primaryColor, secondary: primaryColor + '80' },
      template: template as 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist',
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
              <CardTitle className="text-lg">Logo de la tienda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                  {logo && !logo.startsWith('http') && !logo.startsWith('/') ? (
                    <span className="text-3xl">{logo}</span>
                  ) : logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoUpload} className="hidden" id="settings-logo-upload" />
                  <label htmlFor="settings-logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    {uploadingLogo ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Subir logo</>}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP. Max 5MB. Recomendado: 128 × 128 px (cuadrada)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Banner de la tienda</CardTitle>
              <CardDescription className="text-sm text-gray-500">Imagen de fondo que se muestra en el encabezado de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bannerUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-36 bg-gray-100">
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBannerUrl('')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 h-36 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-400 mt-1">Sin banner</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerUpload} className="hidden" id="settings-banner-upload" />
                <label htmlFor="settings-banner-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  {uploadingBanner ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Subir banner</>}
                </label>
                <p className="text-xs text-gray-400">JPG, PNG, WebP. Max 5MB. <span className="text-violet-500 font-medium">Recomendado: 1200 × 400 px</span></p>
              </div>
            </CardContent>
          </Card>

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
                <Label htmlFor="store-whatsapp">Número de WhatsApp</Label>
                <Input
                  id="store-whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+51 912 345 678"
                  type="tel"
                />
                <p className="text-xs text-gray-400">Formato: +51 9XX XXX XXX — Se mostrará en tu tienda para que los clientes te contacten.</p>
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
                    <option value="luxury">Luxury (Premium)</option>
                    <option value="minimalist">Minimalist (Premium)</option>
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
