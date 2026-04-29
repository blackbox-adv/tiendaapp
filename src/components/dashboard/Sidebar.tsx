'use client'

import { useAppStore } from '@/lib/store'
import { PLANS } from '@/lib/mock-data'
import {
  LayoutDashboard, Package, Settings, Palette, CreditCard,
  LogOut, ExternalLink, Store, ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { PageRoute } from '@/lib/types'

const navItems: { page: PageRoute['page']; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { page: 'dashboard-products', label: 'Productos', icon: Package },
  { page: 'dashboard-settings', label: 'Configuración', icon: Settings },
  { page: 'dashboard-templates', label: 'Plantillas', icon: Palette },
  { page: 'dashboard-plan', label: 'Plan', icon: CreditCard },
]

export function Sidebar() {
  const { currentUser, currentStore, navigate, logout } = useAppStore()
  const route = useAppStore((s) => s.route)

  if (!currentUser) return null

  const currentPlan = PLANS.find((p) => p.id === currentUser.planId)

  return (
    <aside className="w-64 min-h-screen bg-[#1e1b4b] text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold">TiendApp</span>
      </div>

      <Separator className="bg-white/10" />

      {/* User info */}
      <div className="px-5 py-4">
        <p className="text-sm text-violet-300">Hola,</p>
        <p className="font-semibold text-white">{currentUser.name}</p>
        {currentStore && (
          <p className="text-xs text-violet-400 mt-1">{currentStore.name}</p>
        )}
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

      {/* Store link */}
      {currentStore && (
        <>
          <Separator className="bg-white/10" />
          <div className="px-3 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate({ page: 'store', slug: currentStore.slug })}
              className="w-full text-violet-200 hover:text-white hover:bg-white/10 justify-start gap-3"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Ver mi tienda</span>
            </Button>
          </div>
        </>
      )}

      {/* Plan badge & logout */}
      <Separator className="bg-white/10" />
      <div className="px-5 py-4 space-y-3">
        {currentPlan && (
          <div className="px-3 py-2 rounded-lg bg-white/10">
            <p className="text-xs text-violet-300">Plan actual</p>
            <p className="text-sm font-semibold">{currentPlan.name} - S/{currentPlan.price.toFixed(2)}/mes</p>
          </div>
        )}
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
