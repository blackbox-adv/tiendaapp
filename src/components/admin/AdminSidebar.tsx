'use client'

import { useAppStore } from '@/lib/store'
import { LayoutDashboard, Store, Users, CreditCard, Settings, LogOut, Zap, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { PageRoute } from '@/lib/types'

const navItems: { page: PageRoute['page']; label: string; icon: React.ElementType }[] = [
  { page: 'admin', label: 'Panel', icon: LayoutDashboard },
  { page: 'admin-stores', label: 'Tiendas', icon: Store },
  { page: 'admin-users', label: 'Usuarios', icon: Users },
  { page: 'admin-payments', label: 'Pagos', icon: Banknote },
  { page: 'admin-plans', label: 'Planes', icon: CreditCard },
  { page: 'admin-settings', label: 'Configuración', icon: Settings },
]

export function AdminSidebar() {
  const { navigate, logout } = useAppStore()
  const route = useAppStore((s) => s.route)

  return (
    <aside className="w-64 min-h-screen bg-[#1e1b4b] text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold">TiendApp</span>
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
              onClick={() => navigate({ page: item.page } as PageRoute)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-violet-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

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
    </aside>
  )
}
