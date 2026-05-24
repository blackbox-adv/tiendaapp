'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Megaphone, Package, ImagePlus, Lock, Sparkles, Gift, Tag,
  Upload, X, ImageIcon, Eye, Save, Percent, Zap, ArrowRight,
  CheckCircle2, Palette, Type, MousePointerClick, RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PopupManager() {
  const { currentStore, products, navigate, updateStoreSettings } = useAppStore()

  // Popup state
  const [popupEnabled, setPopupEnabled] = useState(currentStore?.popupEnabled ?? false)
  const [popupType, setPopupType] = useState<'product' | 'custom'>(currentStore?.popupType ?? 'product')
  const [popupProductId, setPopupProductId] = useState(currentStore?.popupProductId ?? '')
  const [popupCustomImage, setPopupCustomImage] = useState(currentStore?.popupCustomImage ?? '')
  const [uploadingPopupImage, setUploadingPopupImage] = useState(false)
  const [popupTitle, setPopupTitle] = useState(currentStore?.popupTitle ?? '')
  const [popupButtonText, setPopupButtonText] = useState(currentStore?.popupButtonText ?? 'Ver oferta')
  const [saving, setSaving] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Plan info
  const planId = currentStore?.planId || 'free'
  const isProOrAbove = planId !== 'free'
  const isPremium = planId === 'premium'

  // Filter active products
  const storeProducts = products.filter((p) => p.isActive)

  // Get selected product
  const selectedProduct = popupProductId ? storeProducts.find((p) => p.id === popupProductId) : null

  // Calculate discount percentage
  const discountPercent = selectedProduct?.originalPrice && Number(selectedProduct.originalPrice) > Number(selectedProduct.price)
    ? Math.round((1 - Number(selectedProduct.price) / Number(selectedProduct.originalPrice)) * 100)
    : 0

  const primaryColor = currentStore?.colors.primary || '#7C3AED'

  const handlePopupImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato no valido', { description: 'Solo se permiten JPG, PNG y WebP' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', { description: 'La imagen no debe superar los 5MB' })
      return
    }

    setUploadingPopupImage(true)

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
          setPopupCustomImage(data.url)
          toast.success('Imagen subida', { description: 'La imagen promocional se subio correctamente.' })
        } else {
          toast.error('Error al subir', { description: 'No se recibio la URL de la imagen' })
        }
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error al subir la imagen', { description: data.error || 'No se pudo subir la imagen' })
      }
    } catch {
      toast.error('Error de conexion', { description: 'No se pudo subir la imagen' })
    } finally {
      setUploadingPopupImage(false)
    }
  }, [])

  const handleSave = async () => {
    if (!isProOrAbove) {
      toast.error('Plan requerido', { description: 'Necesitas el Plan Pro o Premium para usar el popup promocional.' })
      return
    }

    if (popupEnabled) {
      if (popupType === 'product' && !popupProductId) {
        toast.error('Selecciona un producto', { description: 'Debes seleccionar un producto para el popup.' })
        return
      }
      if (popupType === 'custom' && !popupCustomImage) {
        toast.error('Sube una imagen', { description: 'Debes subir una imagen personalizada para el popup.' })
        return
      }
    }

    setSaving(true)
    try {
      const result = await updateStoreSettings({
        name: currentStore?.name || '',
        description: currentStore?.description || '',
        whatsappNumber: currentStore?.whatsappNumber || '',
        logo: currentStore?.logo || '',
        bannerUrl: currentStore?.bannerUrl || '',
        colors: currentStore?.colors || { primary: '#7C3AED', secondary: '#10B981' },
        template: currentStore?.template || 'moderna',
        categoryId: currentStore?.categoryId || '',
        hasShipping: currentStore?.hasShipping ?? false,
        hasSecurePayment: currentStore?.hasSecurePayment ?? false,
        hasReturns: currentStore?.hasReturns ?? false,
        popupEnabled,
        popupType,
        popupProductId: popupProductId || null,
        popupCustomImage: isPremium ? (popupCustomImage || null) : null,
        popupTitle: popupTitle || null,
        popupButtonText: popupButtonText || 'Ver oferta',
      })
      if (result.success) {
        toast.success('Popup guardado', { description: popupEnabled ? 'Tu popup promocional esta activo y visible en tu tienda.' : 'Popup desactivado correctamente.' })
      } else {
        toast.error('Error al guardar', { description: result.error || 'No se pudieron guardar los cambios.' })
      }
    } catch {
      toast.error('Error al guardar', { description: 'Ocurrio un error inesperado.' })
    } finally {
      setSaving(false)
    }
  }

  if (!currentStore) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Popup Promocional</h2>
        <Card><CardContent className="py-12 text-center"><p className="text-gray-500">No tienes una tienda configurada.</p></CardContent></Card>
      </div>
    )
  }

  // ─── FREE PLAN: Locked state ─────────────────────────────
  if (!isProOrAbove) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-violet-500" />
            Popup Promocional
          </h1>
          <p className="text-gray-500 mt-1">Destaca ofertas y promociones con un popup visual en tu tienda</p>
        </div>

        {/* Locked card */}
        <Card className="overflow-hidden">
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${primaryColor}, #F59E0B, #EC4899, ${primaryColor})` }} />
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-10 h-10 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Disponible en Plan Pro y Premium</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              El popup promocional te permite mostrar ofertas destacadas automaticamente cuando los clientes visitan tu tienda. Aumenta tus ventas con promociones visibles.
            </p>

            {/* Feature preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-8">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 text-left">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-violet-900">Producto destacado</p>
                  <p className="text-xs text-violet-500">Plan Pro</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-left">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <ImagePlus className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Imagen personalizada</p>
                  <p className="text-xs text-amber-500">Plan Premium</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate({ page: 'dashboard-plan' })}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-8 py-3 text-base"
            >
              <Sparkles className="w-5 h-5" />
              Actualizar plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── PAID PLAN: Full popup editor ─────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-violet-500" />
            Popup Promocional
          </h1>
          <p className="text-gray-500 mt-1">Crea un popup atractivo para destacar ofertas en tu tienda</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Vista previa
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Enable/Disable */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Activar popup promocional</h3>
                    <p className="text-sm text-gray-500">
                      {popupEnabled
                        ? 'El popup se mostrara a los visitantes de tu tienda'
                        : 'Activa para mostrar el popup a tus clientes'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPopupEnabled(!popupEnabled)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${popupEnabled ? 'bg-violet-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${popupEnabled ? 'translate-x-7' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {popupEnabled && (
            <>
              {/* Step 2: Choose popup type */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-600">1</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Tipo de popup</CardTitle>
                      <CardDescription>Elige como quieres mostrar tu promocion</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product type */}
                    <button
                      type="button"
                      onClick={() => setPopupType('product')}
                      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center ${
                        popupType === 'product'
                          ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                          : 'border-gray-200 hover:border-violet-200 hover:bg-violet-50/30'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        popupType === 'product' ? 'bg-violet-200' : 'bg-gray-100'
                      }`}>
                        <Package className={`w-7 h-7 ${popupType === 'product' ? 'text-violet-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className={`text-base font-bold ${popupType === 'product' ? 'text-violet-700' : 'text-gray-700'}`}>
                          Producto destacado
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Muestra un producto con precio, descuento y foto
                        </p>
                      </div>
                      <Badge className={`text-xs ${popupType === 'product' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                        Pro y Premium
                      </Badge>
                      {popupType === 'product' && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-violet-600" />
                        </div>
                      )}
                    </button>

                    {/* Custom image type */}
                    <button
                      type="button"
                      onClick={() => isPremium ? setPopupType('custom') : null}
                      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center ${
                        !isPremium
                          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                          : popupType === 'custom'
                          ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                          : 'border-gray-200 hover:border-violet-200 hover:bg-violet-50/30'
                      }`}
                    >
                      {!isPremium && (
                        <div className="absolute top-3 right-3">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        popupType === 'custom' ? 'bg-violet-200' : 'bg-gray-100'
                      }`}>
                        <ImagePlus className={`w-7 h-7 ${popupType === 'custom' ? 'text-violet-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className={`text-base font-bold ${popupType === 'custom' ? 'text-violet-700' : 'text-gray-700'}`}>
                          Imagen personalizada
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Sube tu propia imagen promocional con diseño libre
                        </p>
                      </div>
                      <Badge className={`text-xs ${popupType === 'custom' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                        Solo Premium
                      </Badge>
                      {popupType === 'custom' && isPremium && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-violet-600" />
                        </div>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Configure content */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-600">2</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Contenido del popup</CardTitle>
                      <CardDescription>Configura lo que vera tu cliente</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Product type: Select product */}
                  {popupType === 'product' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4 text-violet-500" />
                        Producto a destacar
                      </Label>
                      {storeProducts.length > 0 ? (
                        <>
                          <select
                            value={popupProductId}
                            onChange={(e) => setPopupProductId(e.target.value)}
                            className="w-full h-11 rounded-xl border border-input bg-background px-4 py-2 text-sm"
                          >
                            <option value="">Seleccionar producto...</option>
                            {storeProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} — S/{p.price.toFixed(2)}{p.originalPrice && Number(p.originalPrice) > p.price ? ` (antes S/${Number(p.originalPrice).toFixed(2)})` : ''}
                              </option>
                            ))}
                          </select>

                          {/* Selected product card */}
                          {selectedProduct && (
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 border border-violet-200">
                              <img
                                src={selectedProduct.imageUrl}
                                alt={selectedProduct.name}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate">{selectedProduct.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-lg font-extrabold" style={{ color: primaryColor }}>
                                    S/{selectedProduct.price.toFixed(2)}
                                  </span>
                                  {selectedProduct.originalPrice && Number(selectedProduct.originalPrice) > selectedProduct.price && (
                                    <>
                                      <span className="text-sm text-gray-400 line-through">
                                        S/{Number(selectedProduct.originalPrice).toFixed(2)}
                                      </span>
                                      <Badge className="bg-red-100 text-red-700 text-xs font-bold">
                                        -{discountPercent}%
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                              <CheckCircle2 className="w-6 h-6 text-violet-600 flex-shrink-0" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center bg-gray-50">
                          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-3">No tienes productos activos</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate({ page: 'dashboard-products' })}
                            className="gap-2"
                          >
                            Agregar producto
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom type: Upload image */}
                  {popupType === 'custom' && isPremium && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <ImagePlus className="w-4 h-4 text-violet-500" />
                        Imagen promocional
                      </Label>
                      {popupCustomImage ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-violet-200 bg-gray-100">
                          <img src={popupCustomImage} alt="Popup promocional" className="w-full h-48 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                          <button
                            type="button"
                            onClick={() => setPopupCustomImage('')}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-green-100 text-green-700 text-xs font-semibold">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Imagen lista
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <label className="block rounded-2xl border-2 border-dashed border-violet-200 hover:border-violet-400 p-8 text-center bg-violet-50/50 cursor-pointer transition-colors">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePopupImageUpload}
                            className="hidden"
                          />
                          <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                            {uploadingPopupImage ? (
                              <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                            ) : (
                              <Upload className="w-7 h-7 text-violet-500" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-violet-700">
                            {uploadingPopupImage ? 'Subiendo imagen...' : 'Haz clic para subir imagen'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP. Maximo 5MB.</p>
                          <div className="flex items-center justify-center gap-2 mt-3">
                            <Badge className="bg-violet-100 text-violet-600 text-xs">
                              600 x 400 px
                            </Badge>
                            <Badge className="bg-violet-100 text-violet-600 text-xs">
                              3:2 horizontal
                            </Badge>
                          </div>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Custom type but not premium */}
                  {popupType === 'custom' && !isPremium && (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50">
                      <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700 mb-1">Imagen personalizada requiere Premium</p>
                      <p className="text-xs text-gray-400 mb-3">Actualiza para subir tus propias imagenes promocionales</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ page: 'dashboard-plan' })}
                        className="gap-2"
                      >
                        <Sparkles className="w-3 h-3" />
                        Actualizar a Premium
                      </Button>
                    </div>
                  )}

                  {/* Popup title */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Type className="w-4 h-4 text-violet-500" />
                      Titulo del popup
                    </Label>
                    <Input
                      value={popupTitle}
                      onChange={(e) => setPopupTitle(e.target.value)}
                      placeholder="Ej: Oferta especial, 2x1 solo este mes, Black Friday..."
                      maxLength={200}
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-gray-400">
                      Si lo dejas vacio, se usara el nombre del producto o un titulo predeterminado.
                    </p>
                  </div>

                  {/* Button text */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-violet-500" />
                      Texto del boton de accion
                    </Label>
                    <Input
                      value={popupButtonText}
                      onChange={(e) => setPopupButtonText(e.target.value)}
                      placeholder="Ver oferta"
                      maxLength={50}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: How it works */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-600">3</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Como funciona</CardTitle>
                      <CardDescription>Tu popup se mostrara automaticamente</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-violet-600">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-900">Cliente visita tu tienda</p>
                        <p className="text-xs text-violet-500">El popup aparece tras 1.5 segundos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-violet-600">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-900">Ve la oferta destacada</p>
                        <p className="text-xs text-violet-500">Con imagen, precio y descuento</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-violet-600">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-900">Hace clic en la oferta</p>
                        <p className="text-xs text-violet-500">Se dirige al producto o promocion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Vista previa en vivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mini popup preview */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-lg">
                  {/* Decorative banner */}
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${primaryColor}, #F59E0B, #EC4899, ${primaryColor})` }} />

                  {/* Gift header */}
                  <div className="py-2 px-3 flex items-center justify-center gap-1.5" style={{ backgroundColor: primaryColor }}>
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span className="text-white text-[10px] font-bold tracking-wide uppercase">Oferta especial</span>
                    <Gift className="w-3 h-3 text-yellow-300" />
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                    {popupType === 'product' && selectedProduct ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : popupType === 'custom' && popupCustomImage ? (
                      <img
                        src={popupCustomImage}
                        alt="Promo"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100">
                        <Tag className="w-10 h-10 text-violet-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Discount badge */}
                    {popupType === 'product' && discountPercent > 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-red-500 text-white text-[10px] font-extrabold flex items-center gap-0.5">
                        <Percent className="w-2.5 h-2.5" />
                        -{discountPercent}%
                      </div>
                    )}

                    {/* Title on image */}
                    {(popupTitle || (popupType === 'product' && selectedProduct)) && (
                      <div className="absolute bottom-2 left-2 right-8">
                        <p className="text-white font-bold text-xs leading-tight truncate drop-shadow-lg">
                          {popupTitle || selectedProduct?.name || ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {/* Title */}
                    {(popupTitle || (popupType === 'product' && selectedProduct)) && (
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        {popupTitle || selectedProduct?.name || 'Tu titulo aqui'}
                      </h4>
                    )}

                    {/* Product subtitle */}
                    {popupType === 'product' && selectedProduct && popupTitle && popupTitle !== selectedProduct.name && (
                      <p className="text-xs text-gray-500 mb-1 truncate">{selectedProduct.name}</p>
                    )}

                    {/* Price */}
                    {popupType === 'product' && selectedProduct && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-extrabold" style={{ color: primaryColor }}>
                          S/{selectedProduct.price.toFixed(2)}
                        </span>
                        {selectedProduct.originalPrice && Number(selectedProduct.originalPrice) > selectedProduct.price && (
                          <span className="text-xs text-gray-400 line-through">
                            S/{Number(selectedProduct.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA button */}
                    <div
                      className="py-2 rounded-lg text-white text-xs font-bold text-center flex items-center justify-center gap-1"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Gift className="w-3 h-3" />
                      {popupButtonText || 'Ver oferta'}
                    </div>

                    {/* Dismiss */}
                    <p className="text-[9px] text-gray-400 text-center mt-1.5">No mostrar de nuevo</p>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${popupEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-500">
                    {popupEnabled ? 'Popup activo' : 'Popup inactivo'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardContent className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => navigate({ page: 'store', slug: currentStore.slug })}
                >
                  <Eye className="w-4 h-4" />
                  Ver mi tienda
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => navigate({ page: 'dashboard-products' })}
                >
                  <Package className="w-4 h-4" />
                  Gestionar productos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    setPopupEnabled(false)
                    setPopupProductId('')
                    setPopupCustomImage('')
                    setPopupTitle('')
                    setPopupButtonText('Ver oferta')
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar popup
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Full-screen preview modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative banner */}
            <div className="relative h-2 overflow-hidden" style={{ background: `linear-gradient(90deg, ${primaryColor}, #F59E0B, #EC4899, ${primaryColor})` }}>
              <div className="absolute inset-0 opacity-50" style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                animation: 'shimmer 2s infinite',
              }} />
            </div>

            {/* Gift header */}
            <div className="relative py-3 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-bold tracking-wide uppercase">Oferta especial</span>
              <Gift className="w-4 h-4 text-yellow-300" />
            </div>

            {/* Image */}
            <div className="relative aspect-[3/2] overflow-hidden">
              {popupType === 'product' && selectedProduct ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f5f5f5" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ccc">Imagen no disponible</text></svg>'
                  }}
                />
              ) : popupType === 'custom' && popupCustomImage ? (
                <img
                  src={popupCustomImage}
                  alt="Promo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f5f5f5" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ccc">Imagen no disponible</text></svg>'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {popupType === 'product' && discountPercent > 0 && (
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1.5 rounded-xl text-white text-sm font-extrabold shadow-lg flex items-center gap-1.5" style={{ backgroundColor: '#EF4444' }}>
                    <Percent className="w-3.5 h-3.5" />
                    -{discountPercent}%
                  </div>
                </div>
              )}

              {popupType === 'product' && selectedProduct && !popupTitle && (
                <div className="absolute bottom-3 left-3 right-12">
                  <h3 className="text-white font-bold text-lg leading-tight truncate drop-shadow-lg">
                    {selectedProduct.name}
                  </h3>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {popupTitle || (popupType === 'product' && selectedProduct ? selectedProduct.name : 'Titulo del popup')}
              </h3>

              {popupType === 'product' && selectedProduct && popupTitle && popupTitle !== selectedProduct.name && (
                <p className="text-sm text-gray-500 mb-2 truncate">{selectedProduct.name}</p>
              )}

              {popupType === 'product' && selectedProduct && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-extrabold" style={{ color: primaryColor }}>
                    S/{selectedProduct.price.toFixed(2)}
                  </span>
                  {selectedProduct.originalPrice && Number(selectedProduct.originalPrice) > selectedProduct.price && (
                    <span className="text-base text-gray-400 line-through">
                      S/{Number(selectedProduct.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              <button
                className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Gift className="w-4 h-4" />
                {popupButtonText || 'Ver oferta'}
              </button>

              <label className="flex items-center gap-2 mt-3 cursor-pointer justify-center">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-gray-300"
                  style={{ accentColor: primaryColor }}
                  readOnly
                />
                <span className="text-xs text-gray-400">No mostrar de nuevo</span>
              </label>
            </div>

            {/* Preview label */}
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-black/50 text-white text-xs backdrop-blur-sm">
                <Eye className="w-3 h-3 mr-1" />
                Vista previa
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
