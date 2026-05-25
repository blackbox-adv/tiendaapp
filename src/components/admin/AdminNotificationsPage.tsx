'use client'

import { useState, useEffect } from 'react'
import {
  Bell, Send, Users, User, Megaphone, Trash2, Eye,
  CheckCheck, Plus, X, Info, AlertTriangle, Gift, Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AdminNotification {
  id: string
  title: string
  message: string
  type: string
  icon: string
  link: string | null
  userId: string | null
  read: boolean
  createdAt: string
  senderId: string | null
  sender?: { id: string; name: string; email: string } | null
}

interface Stats {
  total: number
  broadcast: number
  unread: number
}

interface UserOption {
  id: string
  name: string
  email: string
}

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, broadcast: 0, unread: 0 })
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [icon, setIcon] = useState('🔔')
  const [link, setLink] = useState('')
  const [targetMode, setTargetMode] = useState<'all' | 'user'>('all')
  const [targetUserId, setTargetUserId] = useState('')

  const fetchNotifications = async () => {
    const token = localStorage.getItem('tiendapp_token')
    if (!token) return
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          setNotifications(data.data.notifications || [])
          setStats(data.data.stats || { total: 0, broadcast: 0, unread: 0 })
        }
      }
    } catch {
      toast.error('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const token = localStorage.getItem('tiendapp_token')
    if (!token) return
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.data?.users) {
          setUsers(data.data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          })))
        }
      }
    } catch {
      // Silently fail
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUsers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Campos requeridos', { description: 'El titulo y mensaje son obligatorios.' })
      return
    }

    if (targetMode === 'user' && !targetUserId) {
      toast.error('Selecciona un usuario', { description: 'Debes seleccionar un usuario especifico.' })
      return
    }

    setSending(true)
    const token = localStorage.getItem('tiendapp_token')
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type,
          icon,
          link: link || null,
          sendToAll: targetMode === 'all',
          userId: targetMode === 'user' ? targetUserId : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Notificacion enviada', {
          description: targetMode === 'all'
            ? 'Enviada a todos los usuarios'
            : `Enviada a ${users.find((u) => u.id === targetUserId)?.name || 'usuario'}`,
        })
        // Reset form
        setTitle('')
        setMessage('')
        setType('info')
        setIcon('🔔')
        setLink('')
        setTargetMode('all')
        setTargetUserId('')
        setShowForm(false)
        // Refresh list
        fetchNotifications()
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast.error('Error al enviar', { description: errorData.error || 'No se pudo enviar la notificacion' })
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('tiendapp_token')
    if (!token) return
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success('Notificacion eliminada')
        fetchNotifications()
      }
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    info: { label: 'Informacion', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info },
    success: { label: 'Exito', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCheck },
    warning: { label: 'Alerta', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
    promo: { label: 'Promocion', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: Gift },
    system: { label: 'Sistema', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Settings },
  }

  const iconOptions = ['🔔', '📢', '🎉', '🎁', '⚠️', '✅', '💡', '🚀', '📦', '💬', '⭐', '🔥']

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-violet-500" />
            Notificaciones
          </h1>
          <p className="text-gray-500 mt-1">Envia notificaciones y noticias a los usuarios de la plataforma</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nueva notificacion'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.broadcast}</p>
                <p className="text-xs text-gray-500">Broadcast (todos)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                <p className="text-xs text-gray-500">No leidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create notification form */}
      {showForm && (
        <Card className="border-violet-200 bg-violet-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-violet-600" />
              Enviar notificacion
            </CardTitle>
            <CardDescription>Crea y envia notificaciones a los usuarios de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Target mode */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Enviar a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetMode('all')}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    targetMode === 'all'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-violet-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${targetMode === 'all' ? 'bg-violet-100' : 'bg-gray-100'}`}>
                    <Users className={`w-5 h-5 ${targetMode === 'all' ? 'text-violet-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${targetMode === 'all' ? 'text-violet-700' : 'text-gray-600'}`}>Todos los usuarios</p>
                    <p className="text-xs text-gray-400">Broadcast masivo</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('user')}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    targetMode === 'user'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-violet-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${targetMode === 'user' ? 'bg-violet-100' : 'bg-gray-100'}`}>
                    <User className={`w-5 h-5 ${targetMode === 'user' ? 'text-violet-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${targetMode === 'user' ? 'text-violet-700' : 'text-gray-600'}`}>Usuario especifico</p>
                    <p className="text-xs text-gray-400">Notificacion directa</p>
                  </div>
                </button>
              </div>
            </div>

            {/* User selection */}
            {targetMode === 'user' && (
              <div className="space-y-2">
                <Label>Seleccionar usuario</Label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Type & Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de notificacion</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setType(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        type === key ? cfg.color : 'border-gray-200 text-gray-500 bg-white'
                      }`}
                    >
                      <cfg.icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icono</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                        icon === emoji ? 'border-violet-500 bg-violet-50 scale-110' : 'border-gray-200 hover:border-violet-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Titulo</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Nueva funcion disponible, Mantenimiento programado..."
                maxLength={200}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Mensaje</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe el contenido de la notificacion..."
                rows={3}
                maxLength={1000}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-400">{message.length}/1000 caracteres</p>
            </div>

            {/* Link (optional) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Enlace (opcional)</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ej: dashboard-products, dashboard-plan (ruta interna)"
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-gray-400">Ruta de navegacion interna. Al hacer clic en la notificacion, el usuario ira a esta pagina.</p>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-violet-200 bg-white p-4 max-w-xs">
              <p className="text-xs text-gray-400 mb-2 font-medium">Vista previa</p>
              <div className="flex gap-3">
                <span className="text-lg">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title || 'Titulo de la notificacion'}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message || 'Mensaje de la notificacion...'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${typeConfig[type]?.color || typeConfig.info.color}`}>
                      {typeConfig[type]?.label || 'Info'}
                    </span>
                    <span className="text-[10px] text-gray-400">Ahora</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Send button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Enviando...' : targetMode === 'all' ? 'Enviar a todos' : 'Enviar a usuario'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de notificaciones</CardTitle>
          <CardDescription>Todas las notificaciones enviadas desde la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hay notificaciones enviadas</p>
              <p className="text-sm text-gray-400">Crea tu primera notificacion con el boton de arriba</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const cfg = typeConfig[notif.type] || typeConfig.info
                return (
                  <div
                    key={notif.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {notif.icon !== 'bell' ? notif.icon : '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3 inline mr-0.5" />
                          {cfg.label}
                        </span>
                        {notif.userId ? (
                          <Badge className="bg-blue-50 text-blue-600 text-[10px]">
                            <User className="w-3 h-3 mr-0.5" />
                            Usuario especifico
                          </Badge>
                        ) : (
                          <Badge className="bg-violet-50 text-violet-600 text-[10px]">
                            <Users className="w-3 h-3 mr-0.5" />
                            Todos los usuarios
                          </Badge>
                        )}
                        {notif.read ? (
                          <Badge className="bg-gray-50 text-gray-400 text-[10px]">Leida</Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-600 text-[10px]">Sin leer</Badge>
                        )}
                        {notif.link && (
                          <Badge className="bg-green-50 text-green-600 text-[10px]">
                            Link: {notif.link}
                          </Badge>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      {notif.sender && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Enviada por: {notif.sender.name}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
