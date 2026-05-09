'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Zap, Mail, Lock, User, ArrowRight, Info, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export function RegisterPage() {
  const register = useAppStore((s) => s.register)
  const navigate = useAppStore((s) => s.navigate)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordStrength = () => {
    if (password.length < 8) return { label: 'Débil', color: 'text-red-500', width: 'w-1/3' }
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    const variety = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length
    if (variety >= 2) return { label: 'Fuerte', color: 'text-green-500', width: 'w-full' }
    return { label: 'Media', color: 'text-amber-500', width: 'w-2/3' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    const success = await register(name, email, password)
    setLoading(false)

    if (success) {
      toast.success('Cuenta creada', { description: 'Bienvenido a TiendApp. Configura tu tienda.' })
    } else {
      setError('Este email ya está registrado.')
      toast.error('Error al registrarse', { description: 'Este email ya está registrado.' })
    }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate({ page: 'landing' })} className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-violet-700">TiendApp</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
          <p className="text-gray-500 mt-1">Empieza a vender online en minutos</p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {password && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${strength.width} transition-all duration-300 ${
                        strength.label === 'Débil' ? 'bg-red-500' : strength.label === 'Media' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                    </div>
                    <p className={`text-xs ${strength.color}`}>Fortaleza: {strength.label}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {confirmPassword && confirmPassword === password && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Las contraseñas coinciden
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3"
              >
                {loading ? 'Creando cuenta...' : (
                  <>
                    Crear cuenta gratis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Al registrarte aceptas los{' '}
                <button type="button" onClick={() => navigate({ page: 'terms' })} className="text-violet-600 hover:underline">Términos de Servicio</button>
                {' '}y{' '}
                <button type="button" onClick={() => navigate({ page: 'privacy' })} className="text-violet-600 hover:underline">Política de Privacidad</button>.
              </p>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => navigate({ page: 'login' })}
                className="text-violet-600 hover:text-violet-700 font-semibold"
              >
                Inicia sesión
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
