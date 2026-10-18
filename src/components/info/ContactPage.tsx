'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Mail, MapPin, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

// Contacto SIN WhatsApp (decisión del dueño: no hay un número público para la web).
// El formulario envía el mensaje por email vía /api/contact (Resend → correo del
// administrador, con reply_to del visitante para responder en 1 clic).
export function ContactPage() {
  const navigate = useAppStore((s) => s.navigate)
  const contactEmail = useAppStore((s) => s.platformSettings.contactEmail)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Completa todos los campos obligatorios.')
      return
    }

    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'No pudimos enviar tu mensaje.')
      }
      setSent(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setTimeout(() => setSent(false), 10000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `No pudimos enviar tu mensaje. Escríbenos directo a ${contactEmail}.`
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contacto</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información de contacto</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a href={`mailto:${contactEmail}`} className="text-sm text-gray-500 hover:text-violet-600 transition-colors">
                      {contactEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ubicación</p>
                    <p className="text-sm text-gray-500">Lima, Perú</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Horario</p>
                    <p className="text-sm text-gray-500">Lunes a Viernes: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Envianos un mensaje</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Te responderemos al correo que indiques, normalmente en menos de 24 horas.
                </p>
                {sent && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm mb-4">
                    Mensaje enviado. Te responderemos pronto a tu correo.
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre *</Label>
                      <Input placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Asunto *</Label>
                    <Input placeholder="¿En qué podemos ayudarte?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensaje *</Label>
                    <Textarea placeholder="Describe tu consulta..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    {sending ? 'Enviando...' : 'Enviar mensaje'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
