'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
// CATEGORIES is used for chart labels - defined inline below
const CATEGORIES = [
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
import {
  Package, Eye, ShoppingBag, TrendingUp, ArrowRight,
  QrCode, Copy, Check, Download, Bell, Star, MessageSquare, BarChart3, CheckCheck, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'

// ── Notification Dropdown (Real API-backed) ──

interface ApiNotification {
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
}

function NotificationDropdown() {
  const { currentStore, products, navigate } = useAppStore()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const storeProducts = products.filter((p) => p.storeId === currentStore?.id && p.isActive)

  // Fetch notifications from API
  const fetchNotifications = async () => {
    const token = localStorage.getItem('tiendapp_token')
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          setNotifications(data.data.notifications || [])
          setUnreadCount(data.data.unreadCount || 0)
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mark one as read
  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('tiendapp_token')
    if (!token) return
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Silently fail
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem('tiendapp_token')
    if (!token) return
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('Notificaciones leidas')
    } catch {
      // Silently fail
    }
  }

  // Delete notification
  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem('tiendapp_token')
    if (!token) return
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast.success('Notificacion eliminada')
    } catch {
      // Silently fail
    }
  }

  // Smart tips based on store state
  const tips: ApiNotification[] = []
  if (storeProducts.length === 0) {
    tips.push({
      id: 'tip-no-products', title: 'Agrega tu primer producto', message: 'Una tienda sin productos no recibe clientes. ¡Empieza ya!',
      type: 'info', icon: '📦', link: 'dashboard-products', userId: null, read: true, createdAt: new Date().toISOString(), senderId: null,
    })
  }

  // Type color map
  const typeColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
    promo: 'bg-violet-100 text-violet-600',
    system: 'bg-gray-100 text-gray-600',
  }

  // Icon fallback
  const typeIcons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    promo: '🎁',
    system: '🔧',
  }

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
  }

  // Handle click on notification
  const handleNotifClick = (notif: ApiNotification) => {
    if (!notif.read) markAsRead(notif.id)
    if (notif.link) {
      setOpen(false)
      // Navigate if it's a dashboard route
      const page = notif.link as any
      navigate({ page })
    }
  }

  const allNotifications = [...notifications, ...tips]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
      >
        <Bell className="w-4 h-4 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{unreadCount} nuevas</Badge>
                )}
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-violet-600 hover:text-violet-800 font-medium flex items-center gap-0.5"
                    title="Marcar todas como leidas"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Leer todo
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center">
                  <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">Cargando...</p>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay notificaciones</p>
                  <p className="text-xs text-gray-400">Las notificaciones de la plataforma aparecen aqui</p>
                </div>
              ) : (
                allNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      !notif.read ? 'bg-violet-50/50 cursor-pointer' : notif.link ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {notif.icon !== 'bell' ? notif.icon : (typeIcons[notif.type] || '🔔')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-violet-500" />
                            )}
                            {notif.id !== 'tip-no-products' && (
                              <button
                                onClick={(e) => deleteNotification(notif.id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-gray-400">{formatTime(notif.createdAt)}</p>
                          {notif.type && notif.type !== 'info' && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${typeColors[notif.type] || typeColors.info}`}>
                              {notif.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── QR Code Card (inline) ──

function QRCodeCard() {
  const { currentStore } = useAppStore()
  const [copied, setCopied] = useState(false)

  if (!currentStore) return null

  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/store/${currentStore.slug}`
    : `https://tiendapp.pe/store/${currentStore.slug}`

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storeUrl)}&bgcolor=ffffff&color=${currentStore.colors.primary.replace('#', '')}`

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    toast.success('Enlace copiado', { description: 'Pégalo en WhatsApp, Instagram o donde quieras.' })
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `qr-${currentStore.slug}.png`
    link.click()
    toast.success('QR descargado', { description: 'Imprime el código y compártelo con tus clientes.' })
  }

  return (
    <Card className="border-dashed border-2 border-violet-200 bg-gradient-to-br from-violet-50/80 to-white">
      <CardContent className="p-5">
        <div className="flex items-start gap-5">
          {/* QR Image */}
          <div className="flex-shrink-0 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <img
              src={qrUrl}
              alt={`QR de ${currentStore.name}`}
              className="w-28 h-28"
            />
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4 text-violet-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Tu Código QR</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Comparte este código QR con tus clientes. Al escanearlo, irán directo a tu tienda online.
            </p>
            <p className="text-[11px] text-gray-400 truncate mb-3">{storeUrl}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyLink} className="text-xs h-8 gap-1.5">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </Button>
              <Button size="sm" variant="outline" onClick={downloadQR} className="text-xs h-8 gap-1.5">
                <Download className="w-3 h-3" />
                Descargar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Analytics Charts ──

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6']

function AnalyticsCharts({ storeProducts }: { storeProducts: Array<{ categoryId: string; price: number; featured: boolean; rating: number }> }) {
  // Category distribution data
  const categoryMap = new Map<string, number>()
  storeProducts.forEach((p) => {
    const cat = CATEGORIES.find((c) => c.id === p.categoryId)
    const name = cat?.name || 'Sin categoría'
    categoryMap.set(name, (categoryMap.get(name) || 0) + 1)
  })
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

  // Price range data
  const priceRanges = [
    { name: '0-50', min: 0, max: 50 },
    { name: '50-100', min: 50, max: 100 },
    { name: '100-200', min: 100, max: 200 },
    { name: '200-500', min: 200, max: 500 },
    { name: '500+', min: 500, max: Infinity },
  ]
  const priceData = priceRanges.map((range) => ({
    name: `S/${range.name}`,
    productos: storeProducts.filter((p) => p.price >= range.min && p.price < range.max).length,
  }))

  // Featured vs regular
  const featuredData = [
    { name: 'Destacados', value: storeProducts.filter((p) => p.featured).length },
    { name: 'Regulares', value: storeProducts.filter((p) => !p.featured).length },
  ]

  // Rating distribution
  const ratingData = [1, 2, 3, 4, 5].map((r) => ({
    name: `${r} estrella${r > 1 ? 's' : ''}`,
    productos: storeProducts.filter((p) => p.rating === r).length,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Category Distribution - Pie */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-violet-500" />
              Productos por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range - Bar */}
      {priceData.some((d) => d.productos > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Rango de precios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={priceData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  formatter={(value: number) => [`${value} productos`, 'Cantidad']}
                />
                <Bar dataKey="productos" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Featured vs Regular - Area */}
      {storeProducts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Destacados vs Regulares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={featuredData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#F59E0B" />
                    <Cell fill="#D1D5DB" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs text-gray-600">Destacados</span>
                  <span className="text-sm font-bold text-gray-900">{featuredData[0].value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span className="text-xs text-gray-600">Regulares</span>
                  <span className="text-sm font-bold text-gray-900">{featuredData[1].value}</span>
                </div>
                {featuredData[0].value === 0 && storeProducts.length > 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">Destaca productos para vender más</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Distribution - Bar */}
      {ratingData.some((d) => d.productos > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              Distribución de valoraciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={ratingData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  formatter={(value: number) => [`${value} productos`, 'Cantidad']}
                />
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="productos" stroke="#10B981" fill="url(#colorRating)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Main Dashboard Overview ──

export function DashboardOverview() {
  const { currentUser, currentStore, products, navigate } = useAppStore()

  if (!currentUser || !currentStore) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-dashed border-2 border-violet-200 p-5">
          <div className="flex items-start gap-5">
            <Skeleton className="w-28 h-28 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const storeProducts = products.filter((p) => p.storeId === currentStore.id && p.isActive)
  const recentProducts = storeProducts.slice(-4)

  // Fetch plan info from API
  const [apiPlans, setApiPlans] = useState<Array<{ id: string; name: string; price: number; maxProducts: number; type: string }>>([])
  useEffect(() => {
    fetch('/api/plans').then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) setApiPlans(data)
    }).catch(() => {})
  }, [])
  const currentPlan = apiPlans.find(p => p.id === currentUser.planId || p.type === currentUser.planId) || null

  const inventoryValue = storeProducts.reduce((sum, p) => sum + p.price, 0)
  const avgPrice = storeProducts.length > 0 ? inventoryValue / storeProducts.length : 0
  const featuredCount = storeProducts.filter((p) => p.featured).length

  const visitDisplay = (currentStore as unknown as Record<string, unknown>)?.visitCount
    ? String((currentStore as unknown as Record<string, unknown>).visitCount)
    : String(storeProducts.length)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome + Notifications */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Aquí tienes un resumen de tu tienda {currentStore.name}</p>
        </div>
        <NotificationDropdown />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Productos', value: storeProducts.length, icon: Package, color: 'bg-violet-100 text-violet-600', sub: `${featuredCount} destacados` },
          { label: 'Valor del inventario', value: `S/${inventoryValue.toFixed(0)}`, icon: TrendingUp, color: 'bg-green-100 text-green-600', sub: `${storeProducts.length} productos` },
          { label: 'Plan', value: currentPlan?.name || 'Gratis', icon: Eye, color: 'bg-amber-100 text-amber-600', sub: currentPlan?.maxProducts === -1 ? 'Ilimitado' : `${storeProducts.length}/${currentPlan?.maxProducts || '?'} productos` },
          { label: 'Visitas', value: visitDisplay, icon: BarChart3, color: 'bg-blue-100 text-blue-600', sub: 'Este mes' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code */}
      <QRCodeCard />

      {/* Analytics Charts */}
      {storeProducts.length > 0 && <AnalyticsCharts storeProducts={storeProducts} />}

      {/* Current Plan */}
      {currentPlan && (
        <Card className="border-violet-100 bg-violet-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600 font-medium">Plan actual</p>
                <p className="text-xl font-bold text-gray-900">{currentPlan.name} - S/{currentPlan.price.toFixed(2)}/mes</p>
                <p className="text-sm text-gray-500 mt-1">
                  {currentPlan.maxProducts >= 100 ? `${currentPlan.maxProducts} productos` : `${storeProducts.length}/${currentPlan.maxProducts} productos usados`}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ page: 'dashboard-plan' })}
                className="border-violet-200 text-violet-600 hover:bg-violet-100"
              >
                Cambiar plan
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Products */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Productos recientes</h2>
            <Button variant="ghost" onClick={() => navigate({ page: 'dashboard-products' })} className="text-violet-600 text-sm">
              Ver todos <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          {recentProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aún no tienes productos</p>
              <Button
                onClick={() => navigate({ page: 'dashboard-product-form' })}
                className="mt-3 bg-violet-600 hover:bg-violet-700 text-white"
              >
                Agregar producto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProducts.map((product) => {
                const category = CATEGORIES.find((c) => c.id === product.categoryId)
                return (
                  <div key={product.id} className="group rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 bg-gray-100 relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      {product.featured && (
                        <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] border-0">
                          ⭐ Destacado
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-violet-600">S/{product.price.toFixed(2)}</span>
                        {category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {category.name}
                          </span>
                        )}
                      </div>
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
