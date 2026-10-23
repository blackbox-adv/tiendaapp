'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
// Plans and categories are now fetched from the API
import { Zap, Crown, Gift, ArrowLeft, ArrowRight, Check, Store, Palette, LayoutTemplate, Upload, Sparkles, Sun, Minimize2, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const iconMap: Record<string, React.ElementType> = { Gift, Zap, Crown }

type TemplateId = 'moderna' | 'vibrante' | 'clasica' | 'luxury' | 'minimalist' | 'bodega' | 'sabor' | 'moda' | 'vitrina' | 'neon' | 'boutique' | 'editorial' | 'atelier' | 'terracota' | 'dulce' | 'calle' | 'aura' | 'teca' | 'volt' | 'grano' | 'flora' | 'mesa' | 'sushi' | 'cafe' | 'bar' | 'pop' | 'zapas' | 'fuerza'

// Las 28 plantillas de Kyllari (mismas entradas que /dashboard/template).
// requiredPlan: 'free' = las 3 gratis; 'premium' = exclusivas Premium.
const WIZARD_TEMPLATES: { id: TemplateId; name: string; desc: string; gradient: string; requiredPlan: 'free' | 'pro' | 'premium'; planLabel: string }[] = [
  { id: 'moderna', name: 'Moderna', desc: 'Limpia y profesional, para cualquier rubro', gradient: 'from-violet-500 to-purple-700', requiredPlan: 'free', planLabel: '' },
  { id: 'vibrante', name: 'Vibrante', desc: 'Llena de color y energía', gradient: 'from-rose-500 to-orange-500', requiredPlan: 'free', planLabel: '' },
  { id: 'clasica', name: 'Clásica', desc: 'Cálida y confiable, estilo tradicional', gradient: 'from-amber-600 to-amber-900', requiredPlan: 'free', planLabel: '' },
  { id: 'luxury', name: 'Luxury', desc: 'Oscuro con acabados dorados, alta gama', gradient: 'from-zinc-800 to-zinc-950', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'minimalist', name: 'Minimalista', desc: 'Estilo Apple: espacios amplios y precisos', gradient: 'from-stone-400 to-stone-700', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'bodega', name: 'Mercadito', desc: 'Energía de barrio para bodegas y abarrotes', gradient: 'from-red-600 to-amber-500', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'sabor', name: 'Sabores', desc: 'Carta digital para restaurantes y pollerías', gradient: 'from-orange-600 to-yellow-500', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'moda', name: 'Pasarela', desc: 'Editorial de moda para boutiques', gradient: 'from-zinc-900 to-pink-600', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'vitrina', name: 'Vitrina', desc: 'Lookbook para joyería, flores y belleza', gradient: 'from-[#96613D] to-[#C89B6D]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'neon', name: 'Tech', desc: 'Blanca premium para celulares y electrónica', gradient: 'from-blue-500 to-indigo-600', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'boutique', name: 'Boutique', desc: 'Marca de moda: hero editorial y lookbook', gradient: 'from-[#17142E] to-[#7C3AED]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'editorial', name: 'Editorial', desc: 'Catálogo de revista con índice numerado', gradient: 'from-[#1A1A1A] to-[#8B0000]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'atelier', name: 'Atelier', desc: 'Moda femenina delicada, rosa empolvado', gradient: 'from-[#D4A5A5] to-[#8E5A6E]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'terracota', name: 'Terracota', desc: 'Artesanal y cálida, hecho a mano', gradient: 'from-[#B85C38] to-[#E5A47F]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'dulce', name: 'Dulce', desc: 'Pastelerías y postres, lila pastel', gradient: 'from-[#C9A7EB] to-[#9B7EDE]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'calle', name: 'Calle', desc: 'Streetwear urbano, negro y lima ácido', gradient: 'from-[#111111] to-[#A3E635]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'aura', name: 'Aura', desc: 'Joyería fina: champán y oro', gradient: 'from-[#C9B37E] to-[#7A5C2E]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'teca', name: 'Teca', desc: 'Hogar y decoración, verde salvia', gradient: 'from-[#7C9070] to-[#4A5D43]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'volt', name: 'Volt', desc: 'Deporte y fitness, azul marino y naranja', gradient: 'from-[#0E1A38] to-[#FF5A1F]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'grano', name: 'Grano', desc: 'Cafeterías y panadería artesanal', gradient: 'from-[#6F4E37] to-[#C8A165]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'flora', name: 'Flora', desc: 'Florerías y regalos, verde botánico', gradient: 'from-[#4A7C59] to-[#A8C686]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'mesa', name: 'Mesa', desc: 'Restaurantes: menú del día y carta', gradient: 'from-[#8B3A3A] to-[#D9A566]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'sushi', name: 'Nikkei', desc: 'Sushi bars: rojo japonés y barra de rolls', gradient: 'from-[#B3402A] to-[#1A1A1A]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'cafe', name: 'Barista', desc: 'Cafeterías: lattes, frappés y postres', gradient: 'from-[#4B3621] to-[#D2B48C]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'bar', name: 'Barra', desc: 'Bares: happy hour y tragos artesanales', gradient: 'from-[#1A1A2E] to-[#E94560]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'pop', name: 'Pop', desc: 'E-commerce multi-rubro: ofertas y envío rápido', gradient: 'from-[#0E9384] to-[#F59E0B]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'zapas', name: 'Zapas', desc: 'Sneaker culture para zapatillas y streetwear', gradient: 'from-[#121216] to-[#FFD400]', requiredPlan: 'premium', planLabel: 'Premium' },
  { id: 'fuerza', name: 'Fuerza', desc: 'Gym y suplementos con energía pura', gradient: 'from-[#0F1215] to-[#00E5C0]', requiredPlan: 'premium', planLabel: 'Premium' },
]

export function StoreWizard() {
  const { wizardStep, setWizardStep, wizardData, updateWizardData, completeWizard, navigate, currentUser } = useAppStore()
  const userPlanId = (currentUser?.planId as string) || 'free'
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(wizardData.template)
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
          updateWizardData({ storeLogo: data.url })
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
                    <div className="flex items-center justify-between">
                      <Label>Logo de la tienda</Label>
                      <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs font-semibold px-2.5 py-1">
                        512 × 512 px (cuadrada)
                      </Badge>
                    </div>
                    <div className="flex items-start gap-4">
                      {/* Preview with aspect ratio indicator */}
                      <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                        {wizardData.storeLogo && !wizardData.storeLogo.includes('/') ? (
                          <span className="text-3xl">{wizardData.storeLogo}</span>
                        ) : wizardData.storeLogo ? (
                          <img src={wizardData.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Store className="w-8 h-8 text-gray-300" />
                            {/* Aspect ratio indicator */}
                            <div className="absolute bottom-0 inset-x-0 bg-gray-900/60 text-[9px] text-white text-center py-0.5 font-medium">
                              1:1
                            </div>
                          </>
                        )}
                        {/* Corner ratio indicators */}
                        <div className="absolute top-1 right-1">
                          <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-violet-400 rounded-tr-sm" />
                        </div>
                        <div className="absolute bottom-1 left-1">
                          <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-violet-400 rounded-bl-sm" />
                        </div>
                      </div>
                      {/* Upload button */}
                      <div>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoUpload} className="hidden" id="wizard-logo-upload" />
                        <label htmlFor="wizard-logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Elige tu plantilla</h2>
                <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-violet-700">
                  <LayoutTemplate className="w-4 h-4 flex-shrink-0" />
                  <span>Elige cómo se verá tu tienda. <strong>Puedes cambiarla después</strong> desde Configuración en tu panel.</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {WIZARD_TEMPLATES.map((tpl) => {
                    const locked = tpl.requiredPlan !== 'free' && userPlanId !== 'premium' && userPlanId !== tpl.requiredPlan
                    return (
                      <Card
                        key={tpl.id}
                        onClick={() => {
                          if (locked) {
                            toast.error(`${tpl.name} es una plantilla ${tpl.planLabel}`, {
                              description: 'Puedes actualizar tu plan en "Mi Plan" cuando quieras.',
                              action: { label: 'Ver planes', onClick: () => navigate({ page: 'dashboard-plan' }) },
                            })
                            return
                          }
                          setSelectedTemplate(tpl.id)
                        }}
                        className={`cursor-pointer transition-all overflow-hidden ${
                          selectedTemplate === tpl.id
                            ? 'border-violet-500 ring-2 ring-violet-200 shadow-lg'
                            : 'border-gray-200 hover:border-violet-200'
                        }`}
                      >
                        <div className={`relative aspect-[3/4] bg-gradient-to-br ${tpl.gradient}`}>
                          {/* Captura real del diseño (el degradado queda de respaldo si la imagen falla) */}
                          <img
                            src={`/templates/${tpl.id}-preview.webp`}
                            alt={`Vista previa plantilla ${tpl.name}`}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          {locked && (
                            <div className="absolute inset-0 bg-white/45 backdrop-blur-[1.5px] flex flex-col items-center justify-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-900/85 flex items-center justify-center shadow-lg">
                                <Lock className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-[10px] font-bold text-gray-800 bg-white/95 rounded-full px-2.5 py-1 shadow">{tpl.planLabel}</span>
                            </div>
                          )}
                          {/* Ojito: ver la demo completa (todos pueden VER, el candado es para usar) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`/demo/${tpl.id}`, '_blank')
                            }}
                            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
                            title="Ver tienda de ejemplo"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          {selectedTemplate === tpl.id && (
                            <div className="absolute top-2 left-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow">
                              <Check className="w-4 h-4 text-violet-600" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{tpl.name}</h3>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-snug">{tpl.desc}</p>
                          {locked ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600 mt-2">
                              <Lock className="w-3 h-3" /> Plan {tpl.planLabel}
                            </div>
                          ) : selectedTemplate === tpl.id ? (
                            <div className="text-center text-xs font-semibold text-violet-600 bg-violet-50 py-1.5 rounded-lg mt-2">✓ Seleccionada</div>
                          ) : (
                            <div className="text-center text-xs font-medium text-gray-500 bg-gray-50 py-1.5 rounded-lg mt-2">Seleccionar</div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                <p className="text-center text-gray-400 text-xs">Toca el ojito para recorrer la tienda de ejemplo de cualquier diseño.</p>
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
