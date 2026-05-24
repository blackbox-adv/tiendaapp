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
import { Save, Eye, Store, LayoutTemplate, Upload, X, ImageIcon, Truck, ShieldCheck, RotateCcw, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export function StoreSettings() {
  const { currentStore, products, navigate, updateStoreSettings } = useAppStore()

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
  const [hasShipping, setHasShipping] = useState(currentStore?.hasShipping ?? false)
  const [hasSecurePayment, setHasSecurePayment] = useState(currentStore?.hasSecurePayment ?? false)
  const [hasReturns, setHasReturns] = useState(currentStore?.hasReturns ?? false)
  const [saving, setSaving] = useState(false)

  // Plan info
  const planId = currentStore?.planId || 'free'

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
      formData.append('folder', 'logo')

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
          toast.error('Error al subir', { description: 'No se recibió la URL del logo. Puedes usar un emoji como alternativa.', duration: 6000 })
        }
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error al subir el logo', { description: (data.error || 'No se pudo subir el logo') + '. Puedes usar un emoji como alternativa.', duration: 6000 })
      }
    } catch {
      toast.error('Error de conexión', { description: 'No se pudo subir el logo. Puedes usar un emoji como alternativa.', duration: 6000 })
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
      formData.append('folder', 'banner')

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
          toast.error('Error al subir', { description: 'No se recibió la URL del banner', duration: 6000 })
        }
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error al subir el banner', { description: data.error || 'No se pudo subir el banner', duration: 6000 })
      }
    } catch {
      toast.error('Error de conexión', { description: 'No se pudo subir el banner', duration: 6000 })
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

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Error', { description: 'El nombre de la tienda es obligatorio.' })
      return
    }
    setSaving(true)
    try {
      const result = await updateStoreSettings({
        name,
        description,
        whatsappNumber: whatsapp,
        logo,
        bannerUrl,
        colors: { primary: primaryColor, secondary: currentStore?.colors.secondary || primaryColor },
        template: template as 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist',
        categoryId: category,
        hasShipping,
        hasSecurePayment,
        hasReturns,
        // Preserve popup settings (managed from dedicated Popup page)
        popupEnabled: currentStore?.popupEnabled ?? false,
        popupType: currentStore?.popupType ?? 'product',
        popupProductId: currentStore?.popupProductId ?? null,
        popupCustomImage: currentStore?.popupCustomImage ?? null,
        popupTitle: currentStore?.popupTitle ?? null,
        popupButtonText: currentStore?.popupButtonText ?? 'Ver oferta',
      })
      if (result.success) {
        toast.success('Tienda actualizada', { description: 'Los cambios se guardaron correctamente.' })
      } else {
        toast.error('Error al guardar', { description: result.error || 'No se pudieron guardar los cambios. Intenta de nuevo.' })
      }
    } catch {
      toast.error('Error al guardar', { description: 'Ocurrió un error inesperado. Intenta de nuevo.' })
    } finally {
      setSaving(false)
    }
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
          {/* Logo Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Logo de la tienda</CardTitle>
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs font-semibold px-2.5 py-1">
                  512 × 512 px (cuadrada)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {/* Preview with aspect ratio indicator */}
                <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                  {logo && !logo.startsWith('http') && !logo.startsWith('/') ? (
                    <span className="text-3xl">{logo}</span>
                  ) : logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Store className="w-8 h-8 text-gray-300" />
                      {/* Aspect ratio indicator */}
                      <div className="absolute bottom-0 inset-x-0 bg-gray-900/60 text-[9px] text-white text-center py-0.5 font-medium">
                        1:1
                      </div>
                    </>
                  )}
                  {/* 1:1 ratio corner indicator */}
                  <div className="absolute top-1 right-1">
                    <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-violet-400 rounded-tr-sm" />
                  </div>
                  <div className="absolute bottom-1 left-1">
                    <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-violet-400 rounded-bl-sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoUpload} className="hidden" id="settings-logo-upload" />
                  <label htmlFor="settings-logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    {uploadingLogo ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Subir logo</>}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP. Máximo 5MB.</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-xs font-semibold">
                      📐 512 × 512 px
                    </span>
                    <span className="text-xs text-gray-400">cuadrada (1:1)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banner Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Banner de la tienda</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Imagen de fondo que se muestra en el encabezado de tu tienda</CardDescription>
                </div>
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                  1200 × 400 px (3:1)
                </Badge>
              </div>
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
                <div className="rounded-xl border-2 border-dashed border-gray-200 h-36 flex items-center justify-center bg-gray-50 relative overflow-hidden">
                  {/* Visual ratio guide lines */}
                  <div className="absolute inset-3 border border-violet-200/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-lg font-bold text-gray-300 mt-1">1200 × 400 px</p>
                      <p className="text-xs text-gray-300">panorámica 3:1</p>
                    </div>
                  </div>
                  {/* Aspect ratio indicators */}
                  <div className="absolute top-2 right-2">
                    <div className="px-1.5 py-0.5 rounded bg-violet-100 border border-violet-300">
                      <span className="text-[9px] text-violet-600 font-bold">3:1</span>
                    </div>
                  </div>
                  {/* Wide format guide lines */}
                  <div className="absolute top-1/2 left-4 right-4 h-px bg-violet-200/40" />
                  <div className="absolute left-1/2 top-4 bottom-4 w-px bg-violet-200/40" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerUpload} className="hidden" id="settings-banner-upload" />
                <label htmlFor="settings-banner-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  {uploadingBanner ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Subir banner</>}
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-xs font-semibold">
                    📐 1200 × 400 px
                  </span>
                  <span className="text-xs text-gray-400">panorámica (3:1)</span>
                </div>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Caracteristicas de la tienda</CardTitle>
              <CardDescription className="text-sm text-gray-500">Activa o desactiva las caracteristicas que se mostraran en tus productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Envio disponible</p>
                    <p className="text-xs text-gray-500">Muestra el badge de envio en tus productos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasShipping(!hasShipping)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${hasShipping ? 'bg-violet-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${hasShipping ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pago seguro</p>
                    <p className="text-xs text-gray-500">Muestra el badge de pago seguro en tus productos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasSecurePayment(!hasSecurePayment)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${hasSecurePayment ? 'bg-violet-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${hasSecurePayment ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Devoluciones</p>
                    <p className="text-xs text-gray-500">Muestra el badge de devoluciones en tus productos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasReturns(!hasReturns)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${hasReturns ? 'bg-violet-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${hasReturns ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Promo Popup - Link to dedicated page */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Popup Promocional</h3>
                    <p className="text-sm text-gray-500">Configura tu popup promocional en la pagina dedicada</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate({ page: 'dashboard-popup' })}
                  className="gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  Configurar popup
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
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
                  <div className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl overflow-hidden" style={{ backgroundColor: primaryColor + '15' }}>
                    {logo && !logo.startsWith('http') && !logo.startsWith('/') ? (
                      <span>{logo}</span>
                    ) : logo ? (
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-gray-400" />
                    )}
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
