'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Settings, Save, Info, Send, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function AdminSettings() {
  const { platformSettings, updatePlatformSettings } = useAppStore()

  const [name, setName] = useState(platformSettings.name)
  const [defaultPlanId, setDefaultPlanId] = useState(platformSettings.defaultPlanId)
  const [maintenanceMode, setMaintenanceMode] = useState(platformSettings.maintenanceMode)
  const [registrationsEnabled, setRegistrationsEnabled] = useState(platformSettings.registrationsEnabled)
  const [contactEmail, setContactEmail] = useState(platformSettings.contactEmail)
  const [contactPhone, setContactPhone] = useState(platformSettings.contactPhone)

  const [saving, setSaving] = useState(false)

  const [testEmail, setTestEmail] = useState('kioanthony@gmail.com')
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<
    | { ok: boolean; message?: string; hint?: string; resendError?: { message: string } }
    | null
  >(null)

  // Fetch plans for the dropdown
  const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number }>>([])
  useEffect(() => {
    fetch('/api/plans').then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) setPlans(data)
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          defaultPlanId,
          maintenanceMode: String(maintenanceMode),
          registrationsEnabled: String(registrationsEnabled),
          contactEmail,
          contactPhone,
        }),
      })
      if (res.ok) {
        updatePlatformSettings({ name, defaultPlanId, maintenanceMode, registrationsEnabled, contactEmail, contactPhone })
        toast.success('Configuración guardada', { description: 'Los cambios se aplicaron correctamente.' })
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error('Error al guardar', { description: data.error || 'No se pudo guardar la configuración.' })
      }
    } catch {
      toast.error('Error de conexión', { description: 'No se pudo conectar al servidor.' })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setSendingTest(true)
    setTestResult(null)
    try {
      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ to: testEmail }),
      })
      const data = await res.json().catch(() => null)
      if (!data) {
        setTestResult({ ok: false, hint: 'No se pudo conectar con el servidor.' })
      } else if (data.error) {
        setTestResult({ ok: false, hint: data.error })
      } else {
        setTestResult(data)
      }
    } catch {
      setTestResult({ ok: false, hint: 'No se pudo conectar con el servidor.' })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Ajustes generales de la plataforma</p>
      </div>

      {/* Platform Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre de la plataforma</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kyllari"
            />
          </div>
          <div className="space-y-2">
            <Label>Plan por defecto para nuevos usuarios</Label>
            <select
              value={defaultPlanId}
              onChange={(e) => setDefaultPlanId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {plans.length > 0 ? plans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name} - S/{plan.price.toFixed(2)}/mes</option>
              )) : <option>Cargando planes...</option>}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de contacto</CardTitle>
          <CardDescription>Estos datos se muestran en el footer, página de contacto, términos, privacidad y página 404.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Correo de contacto</Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contacto@kyllari.com"
            />
            <p className="text-xs text-gray-400">Se muestra como email principal en toda la plataforma</p>
          </div>
          <div className="space-y-2">
            <Label>Teléfono / WhatsApp</Label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+51958297236"
            />
            <p className="text-xs text-gray-400">Formato: +51XXXXXXXXX. Se usa para el botón de WhatsApp y teléfono de contacto.</p>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Modo mantenimiento</Label>
              <p className="text-sm text-gray-400">Desactiva temporalmente el acceso a la plataforma</p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Registros habilitados</Label>
              <p className="text-sm text-gray-400">Permitir que nuevos usuarios se registren</p>
            </div>
            <Switch
              checked={registrationsEnabled}
              onCheckedChange={setRegistrationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Correos (Resend)</CardTitle>
          <CardDescription>
            Comprueba que los correos automáticos (bienvenida al registrarse, pago recibido, cambio de clave) se están enviando de verdad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Enviar correo de prueba a</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="tucorreo@gmail.com"
              />
              <Button
                onClick={handleTestEmail}
                disabled={sendingTest || !testEmail}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2 whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                {sendingTest ? 'Enviando...' : 'Probar'}
              </Button>
            </div>
          </div>

          {testResult && (
            <div
              className={`rounded-md border p-3 text-sm ${
                testResult.ok
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              <div className="flex gap-2">
                {testResult.ok ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-medium">
                    {testResult.ok ? 'Correo enviado' : 'El correo NO se pudo enviar'}
                  </p>
                  {testResult.ok && testResult.message && <p>{testResult.message}</p>}
                  {!testResult.ok && testResult.hint && <p>{testResult.hint}</p>}
                  {!testResult.ok && testResult.resendError?.message && (
                    <p className="text-xs opacity-70">Detalle técnico: {testResult.resendError.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Si el envío falla, aquí verás el motivo exacto que devuelve Resend (clave inválida, dominio sin verificar, límite alcanzado, etc.).
          </p>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-violet-100 bg-violet-50/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-violet-700">
              <p className="font-medium">Nota</p>
              <p className="text-violet-600 mt-1">Los cambios se aplican inmediatamente. Asegúrate de revisar bien antes de guardar.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
        <Save className="w-4 h-4" />
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  )
}
