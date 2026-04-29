'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Settings, Save, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { PLANS } from '@/lib/mock-data'

export function AdminSettings() {
  const { platformSettings, updatePlatformSettings } = useAppStore()

  const [name, setName] = useState(platformSettings.name)
  const [defaultPlanId, setDefaultPlanId] = useState(platformSettings.defaultPlanId)
  const [maintenanceMode, setMaintenanceMode] = useState(platformSettings.maintenanceMode)
  const [registrationsEnabled, setRegistrationsEnabled] = useState(platformSettings.registrationsEnabled)

  const handleSave = () => {
    updatePlatformSettings({
      name,
      defaultPlanId,
      maintenanceMode,
      registrationsEnabled,
    })
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
              placeholder="TiendApp"
            />
          </div>
          <div className="space-y-2">
            <Label>Plan por defecto para nuevos usuarios</Label>
            <select
              value={defaultPlanId}
              onChange={(e) => setDefaultPlanId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name} - S/{plan.price.toFixed(2)}/mes</option>
              ))}
            </select>
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
      <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
        <Save className="w-4 h-4" />
        Guardar cambios
      </Button>
    </div>
  )
}
