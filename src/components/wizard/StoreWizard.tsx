'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
// Plans and categories are now fetched from the API
import { Zap, Crown, Gift, ArrowLeft, ArrowRight, Check, Store, Palette, LayoutTemplate, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

const iconMap: Record<string, React.ElementType> = { Gift, Zap, Crown }

export function StoreWizard() {
  const { wizardStep, setWizardStep, wizardData, updateWizardData, completeWizard, navigate } = useAppStore()
  const [selectedTemplate, setSelectedTemplate] = useState<'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist'>(wizardData.template)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Fetch plans from API
  const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number; description: string; features: string[]; popular: boolean; maxProducts: number; type: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const plansRes = await fetch('/api/plans')
        if (plansRes.ok) {
          const data = await plansRes.json()
          if (Array.isArray(data)) setPlans(data)
        }
      } catch {
        // Fallback: if API fails, use minimal defaults
      }
    }
    fetchData()
  }, [])

  // Categories are a static list (no API endpoint needed for now)
  const allCategories = categories.length > 0 ? categories : [
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
          updateWizardData({ storeLogo: data.url })
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
  }, [updateWizardData])

  const steps = [
    { num: 1, title: 'Plan', icon: Crown },
    { num: 2, title: 'Tienda', icon: Store },
    { num: 3, title: 'Plantilla', icon: Palette },
  ]

  const handleComplete = () => {
    updateWizardData({ template: selectedTemplate })
    completeWizard()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configura tu tienda</h1>
          <p className="text-gray-500 mt-1">Completa estos 3 pasos para tener tu tienda lista</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center gap-4">
              <button
                onClick={() => wizardStep > step.num && setWizardStep(step.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  wizardStep === step.num
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                    : wizardStep > step.num
                    ? 'bg-violet-100 text-violet-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  wizardStep >= step.num ? 'bg-white/20 text-inherit' : 'bg-gray-200 text-gray-400'
                }`}>
                  {wizardStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${wizardStep > step.num ? 'bg-violet-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={wizardStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Choose Plan */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Elige tu plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.length > 0 ? plans.map((plan) => {
                    const Icon = iconMap[plan.type] || Gift
                    const isSelected = wizardData.planId === plan.id
                    return (
                      <Card
                        key={plan.id}
                        onClick={() => updateWizardData({ planId: plan.id })}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'border-violet-500 ring-2 ring-violet-200 shadow-lg'
                            : plan.popular
                            ? 'border-violet-300 hover:border-violet-400'
                            : 'border-gray-200 hover:border-violet-200'
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                            isSelected ? 'bg-violet-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-violet-600' : 'text-gray-400'}`} />
                          </div>
                          <h3 className="font-bold text-gray-900">{plan.name}</h3>
                          <p className="text-2xl font-extrabold text-violet-600 my-2">
                            {plan.price === 0 ? 'Gratis' : <>S/{plan.price.toFixed(2)}<span className="text-sm text-gray-400 font-normal">/mes</span></>}
                          </p>
                          <ul className="space-y-1.5">
                            {plan.features.slice(0, 4).map((f: string) => (
                              <li key={f} className="text-xs text-gray-500 flex items-start gap-1.5">
                                <Check className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          {isSelected && (
                            <div className="mt-3 text-center text-xs font-semibold text-violet-600 bg-violet-50 py-1.5 rounded-lg">
                              ✓ Seleccionado
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                  : <p className="col-span-3 text-center text-gray-400 py-8">Cargando planes...</p>}
                </div>
              </div>
            )}

            {/* Step 2: Store Info */}
            {wizardStep === 2 && (
              <Card className="border-gray-200">
                <CardContent className="p-6 space-y-5">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label>Logo de la tienda</Label>
                    <div className="flex items-center gap-4">
                      {/* Preview */}
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                        {wizardData.storeLogo && !wizardData.storeLogo.includes('/') ? (
                          <span className="text-3xl">{wizardData.storeLogo}</span>
                        ) : wizardData.storeLogo ? (
                          <img src={wizardData.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      {/* Upload button */}
                      <div>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoUpload} className="hidden" id="wizard-logo-upload" />
                        <label htmlFor="wizard-logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                          {uploadingLogo ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Subir logo</>}
                        </label>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP. Max 5MB. Recomendado: 128 × 128 px (cuadrada)</p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900">Datos de tu tienda</h2>

                  <div className="space-y-2">
                    <Label>Nombre de la tienda</Label>
                    <Input
                      placeholder="Mi Tienda Increíble"
                      value={wizardData.storeName}
                      onChange={(e) => updateWizardData({ storeName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      placeholder="Describe qué vendes y qué hace especial tu tienda..."
                      value={wizardData.storeDescription}
                      onChange={(e) => updateWizardData({ storeDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <select
                        value={wizardData.storeCategory}
                        onChange={(e) => updateWizardData({ storeCategory: e.target.value })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Seleccionar...</option>
                        {allCategories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wizard-whatsapp">Número de WhatsApp</Label>
                      <Input
                        id="wizard-whatsapp"
                        placeholder="+51 912 345 678"
                        type="tel"
                        value={wizardData.storeWhatsapp}
                        onChange={(e) => updateWizardData({ storeWhatsapp: e.target.value })}
                      />
                      <p className="text-xs text-gray-400">Formato: +51 9XX XXX XXX</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color principal</Label>
                    <div className="flex gap-3">
                      {['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateWizardData({ storeColors: { ...wizardData.storeColors, primary: c } })}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                            wizardData.storeColors.primary === c ? 'border-gray-900 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <input
                        type="color"
                        value={wizardData.storeColors.primary}
                        onChange={(e) => updateWizardData({ storeColors: { ...wizardData.storeColors, primary: e.target.value } })}
                        className="w-8 h-8 rounded-full cursor-pointer border-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Template */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Elige tu plantilla</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'moderna' as const, name: 'Moderna', desc: 'Diseño limpio y minimalista', color: '#7C3AED' },
                    { id: 'vibrante' as const, name: 'Vibrante', desc: 'Colores vibrantes y dinámicos', color: '#EC4899' },
                    { id: 'clasica' as const, name: 'Clásica', desc: 'Elegancia atemporal', color: '#D97706' },
                  ].map((tpl) => (
                    <Card
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === tpl.id
                          ? 'border-violet-500 ring-2 ring-violet-200 shadow-lg'
                          : 'border-gray-200 hover:border-violet-200'
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="rounded-lg h-40 mb-3 flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: `linear-gradient(135deg, ${tpl.color}, ${tpl.color}99)` }}
                        >
                          <LayoutTemplate className="w-10 h-10 opacity-50" />
                        </div>
                        <h3 className="font-bold text-gray-900">{tpl.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{tpl.desc}</p>
                        {selectedTemplate === tpl.id && (
                          <div className="mt-3 text-center text-xs font-semibold text-violet-600 bg-violet-50 py-1.5 rounded-lg">
                            ✓ Seleccionada
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => {
              if (wizardStep === 1) {
                navigate({ page: 'landing' })
              } else {
                setWizardStep(wizardStep - 1)
              }
            }}
            className="text-gray-500"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {wizardStep === 1 ? 'Volver' : 'Anterior'}
          </Button>

          {wizardStep < 3 ? (
            <Button
              onClick={() => setWizardStep(wizardStep + 1)}
              disabled={(wizardStep === 1 && !wizardData.planId) || (wizardStep === 2 && !wizardData.storeName.trim())}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Siguiente
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!wizardData.storeName}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Crear mi tienda
              <Zap className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
