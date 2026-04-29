'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Store, Mail, Lock, User, ArrowLeft } from 'lucide-react'

export default function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const { navigate, login } = useStore()
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', name: '', storeName: '', storeCategory: 'general' })

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'ropa', label: 'Ropa & Moda' },
    { value: 'restaurante', label: 'Restaurante & Comida' },
    { value: 'belleza', label: 'Belleza & Salud' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'joyeria', label: 'Joyería & Accesorios' },
    { value: 'hogar', label: 'Hogar & Decoración' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isLogin ? '/api/auth' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      login({ id: data.id, email: data.email, name: data.name, role: data.role, plan: data.plan })
    } catch { setError('Error de conexión') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <button onClick={() => navigate({ page: 'landing' })} className="absolute left-4 top-4 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Store className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">{isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}</CardTitle>
          <CardDescription>{isLogin ? 'Ingresa a tu cuenta' : 'Empieza a crear tu tienda online'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            {!isLogin && (
              <div className="space-y-2">
                <Label>Tu nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="María García" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="pl-10" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="email" placeholder="tu@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="pl-10" required />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>Nombre de tu tienda</Label>
                  <Input placeholder="Mi Tienda Online" value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de negocio</Label>
                  <select value={form.storeCategory} onChange={e => setForm(f => ({ ...f, storeCategory: e.target.value }))} className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm">
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-11 font-semibold rounded-xl" disabled={loading}>
              {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear mi tienda'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError('') }} className="text-violet-600 font-semibold hover:underline">
                {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
