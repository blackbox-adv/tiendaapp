'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Zap, Mail, Lock, ArrowLeft, ArrowRight, Info, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

type Step = 'email' | 'check_email' | 'reset' | 'success'

export function ResetPasswordPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if user arrived with a token from email link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setResetToken(token)
      setStep('reset')
    }
  }, [])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'reset_request' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al enviar el email')
      } else {
        setStep('check_email')
        toast.success('Email enviado', {
          description: 'Revisa tu bandeja de entrada y haz clic en el enlace.',
        })
      }
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!resetToken) {
      setError('No se encontro el token de restablecimiento. Solicita un nuevo enlace.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', token: resetToken, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al restablecer la contraseña')
      } else {
        setStep('success')
        toast.success('Contraseña actualizada', {
          description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
        })
      }
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
    }
    setLoading(false)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'email' && 'Recuperar contraseña'}
            {step === 'check_email' && 'Revisa tu email'}
            {step === 'reset' && 'Nueva contraseña'}
            {step === 'success' && 'Contraseña actualizada'}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === 'email' && 'Ingresa tu email para recibir instrucciones'}
            {step === 'check_email' && `Enviamos un enlace a ${email || 'tu bandeja'}`}
            {step === 'reset' && 'Crea tu nueva contraseña'}
            {step === 'success' && 'Tu contraseña ha sido cambiada exitosamente'}
          </p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardContent className="pt-6">

            {/* ── SUCCESS ── */}
            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">¡Contraseña actualizada!</h2>
                <p className="text-sm text-gray-500">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <Button onClick={() => navigate({ page: 'login' })} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
                  Iniciar sesión
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {/* ── CHECK EMAIL ── */}
            {step === 'check_email' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-violet-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-gray-900">Email enviado</h2>
                  <p className="text-sm text-gray-500">
                    Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
                  </p>
                  <p className="text-xs text-gray-400">
                    El enlace expira en 1 hora. Revisa también tu carpeta de spam.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleRequestReset}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? 'Enviando...' : 'Reenviar email'}
                  </Button>
                  <Button onClick={() => navigate({ page: 'login' })} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Volver al inicio de sesión
                  </Button>
                </div>
              </div>
            )}

            {/* ── EMAIL FORM ── */}
            {step === 'email' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3"
                >
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </Button>
              </form>
            )}

            {/* ── RESET PASSWORD FORM ── */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
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
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3"
                >
                  {loading ? 'Actualizando...' : 'Restablecer contraseña'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  ¿No recibiste el email?{' '}
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setResetToken(null) }}
                    className="text-violet-600 hover:text-violet-700 font-semibold"
                  >
                    Solicitar nuevo enlace
                  </button>
                </p>
              </form>
            )}

            {/* Back link (only on email step) */}
            {step === 'email' && (
              <p className="text-center text-sm text-gray-500 mt-6">
                <button
                  onClick={() => navigate({ page: 'login' })}
                  className="text-violet-600 hover:text-violet-700 font-semibold"
                >
                  Volver al inicio de sesión
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
