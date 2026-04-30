'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { PLANS, CATEGORIES } from '@/lib/mock-data'
import {
  Package, Eye, ShoppingBag, TrendingUp, ArrowRight,
  QrCode, Copy, Check, Download, Bell, Star, MessageSquare, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'

// ── Notification Dropdown ──

function NotificationDropdown() {
  const { currentStore, products } = useAppStore()
  const [open, setOpen] = useState(false)

  const storeProducts = products.filter((p) => p.storeId === currentStore?.id && p.isActive)
  const notifications = [
    {
      id: '1',
      title: 'Bienvenido a TiendApp',
      message: 'Tu tienda está lista. Comienza agregando productos.',
      time: 'Ahora',
      read: false,
      icon: '🚀',
    },
    ...(storeProducts.length === 0
      ? [{
          id: '2',
          title: 'Agrega tu primer producto',
          message: 'Una tienda sin productos no recibe clientes. ¡Empieza ya!',
          time: 'Pendiente',
          read: false,
          icon: '📦',
        }]
      : []),
    ...(storeProducts.filter((p) => p.featured).length === 0 && storeProducts.length > 0
      ? [{
          id: '3',
          title: 'Destaca tus mejores productos',
          message: 'Los productos destacados aparecen primero en tu tienda.',
          time: 'Consejo',
          read: false,
          icon: '⭐',
        }]
      : []),
    {
      id: '4',
      title: 'Comparte tu QR code',
      message: 'Imprime el código QR de tu tienda y compártelo con tus clientes.',
      time: 'Tip',
      read: false,
      icon: '📱',
    },
    {
      id: '5',
      title: 'Conecta tu WhatsApp',
      message: 'Asegúrate de tener tu número de WhatsApp actualizado en la configuración.',
      time: 'Importante',
      read: true,
      icon: '💬',
    },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
      >
        <Bell className="w-4 h-4 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">{unreadCount} nuevas</Badge>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-violet-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{notif.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
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

  if (!currentUser || !currentStore) return null

  const storeProducts = products.filter((p) => p.storeId === currentStore.id && p.isActive)
  const currentPlan = PLANS.find((p) => p.id === currentUser.planId)
  const recentProducts = storeProducts.slice(-4)

  const totalRevenue = storeProducts.reduce((sum, p) => sum + p.price, 0)
  const avgPrice = storeProducts.length > 0 ? totalRevenue / storeProducts.length : 0
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
          { label: 'Ingresos totales', value: `S/${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'bg-green-100 text-green-600', sub: `Promedio: S/${avgPrice.toFixed(0)}` },
          { label: 'Plan', value: currentPlan?.name || 'Gratis', icon: Eye, color: 'bg-amber-100 text-amber-600', sub: currentPlan?.productLimit === -1 ? 'Ilimitado' : `${storeProducts.length}/${currentPlan?.productLimit} productos` },
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
                  {currentPlan.productLimit === -1 ? 'Productos ilimitados' : `${storeProducts.length}/${currentPlan.productLimit} productos usados`}
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
