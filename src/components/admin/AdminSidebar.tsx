'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { LayoutDashboard, Store, Users, CreditCard, Settings, LogOut, Zap, Banknote, Menu, X, Bell, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { PageRoute } from '@/lib/types'

const navItems: { page: PageRoute['page']; label: string; icon: React.ElementType }[] = [
  { page: 'admin', label: 'Panel', icon: LayoutDashboard },
  { page: 'admin-stores', label: 'Tiendas', icon: Store },
  { page: 'admin-users', label: 'Usuarios', icon: Users },
  { page: 'admin-payments', label: 'Pagos', icon: Banknote },
  { page: 'admin-notifications', label: 'Notificaciones', icon: Bell },
  { page: 'admin-plans', label: 'Planes', icon: CreditCard },
  { page: 'admin-settings', label: 'Configuración', icon: Settings },
]

export function AdminSidebar() {
  const { navigate, logout } = useAppStore()
  const route = useAppStore((s) => s.route)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Badge de pagos pendientes por verificar (encuesta cada 60s, silencioso)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tiendapp_token') : null
        if (!token) return
        const res = await fetch('/api/admin/payments?status=pending&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setPendingCount(Number(data?.total ?? 0))
      } catch {
        /* el badge nunca rompe el sidebar */
      }
    }
    load()
    const t = setInterval(load, 60000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  const handleNav = (page: PageRoute['page']) => {
    navigate({ page } as PageRoute)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold">Kyllari</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">Admin</span>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = route.page === item.page
          return (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-violet-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.page === 'admin-payments' && pendingCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Back to store dashboard */}
      <Separator className="bg-white/10" />
      <div className="px-3 py-3">
        <Link
          href="/dashboard"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-violet-200 hover:text-white hover:bg-white/10 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Volver a mi tienda</span>
        </Link>
      </div>

      {/* Logout */}
      <Separator className="bg-white/10" />
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full text-violet-300 hover:text-white hover:bg-white/10 justify-start gap-3"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Cerrar sesión</span>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1e1b4b] text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#1e1b4b] text-white flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-[#1e1b4b] text-white flex-col flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  )
}
