'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import {
  LayoutDashboard, Package, Settings, Palette, CreditCard,
  LogOut, ExternalLink, Store, Menu, X, QrCode
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import type { PageRoute } from '@/lib/types'

const navItems: { page: PageRoute['page']; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { page: 'dashboard-products', label: 'Productos', icon: Package },
  { page: 'dashboard-templates', label: 'Plantillas', icon: Palette },
  { page: 'dashboard-qr', label: 'Codigo QR', icon: QrCode },
  { page: 'dashboard-settings', label: 'Configuracion', icon: Settings },
  { page: 'dashboard-plan', label: 'Plan', icon: CreditCard },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { currentUser, currentStore, navigate, logout } = useAppStore()
  const route = useAppStore((s) => s.route)

  if (!currentUser) return null

  // Fetch plan name from API
  const [planName, setPlanName] = useState('')
  useEffect(() => {
    fetch('/api/plans').then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) {
        const plan = data.find((p: { id: string; type: string; name: string }) => p.id === currentUser.planId || p.type === currentUser.planId)
        if (plan) setPlanName(plan.name)
      }
    }).catch(() => setPlanName('Gratis'))
  }, [currentUser.planId])

  const currentPlan = planName ? { name: planName, price: 0, productLimit: -1 } : null

  const handleNav = (page: PageRoute['page']) => {
    navigate({ page } as PageRoute)
    onClose?.()
  }

  const handleLogout = () => {
    logout()
    onClose?.()
    toast.info('Sesión cerrada', { description: 'Has cerrado sesión correctamente.' })
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1b4b] text-white">
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
              onClick={() => handleNav(item.page)}
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
          onClick={handleLogout}
          className="w-full text-violet-300 hover:text-white hover:bg-white/10 justify-start gap-3"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Cerrar sesión</span>
        </Button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { currentUser } = useAppStore()
  const [open, setOpen] = useState(false)

  if (!currentUser) return null

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1e1b4b] px-4 py-3 flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-[#1e1b4b] border-violet-800">
            <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
            <SidebarContent onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white">TiendApp</span>
        </div>
      </div>
    </>
  )
}
