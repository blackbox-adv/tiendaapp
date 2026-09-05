'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import {
  LayoutDashboard, Package, Settings, Palette, CreditCard,
  LogOut, ExternalLink, Store, Menu, X, QrCode, Megaphone, FolderOpen, ShoppingCart, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Productos', icon: Package },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/dashboard/categories', label: 'Categorías', icon: FolderOpen },
  { href: '/dashboard/template', label: 'Plantillas', icon: Palette },
  { href: '/dashboard/landing', label: 'Landing IA', icon: Sparkles },
  { href: '/dashboard/plan', label: 'Mi Plan', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { currentUser, currentStore, logout } = useAppStore()
  const pathname = usePathname()

  // Fetch plan name from API
  const [planName, setPlanName] = useState('')
  const [planPrice, setPlanPrice] = useState(0)

  useEffect(() => {
    if (!currentUser) return
    fetch('/api/plans').then(r => r.ok ? r.json() : []).then(data => {
      const plans = Array.isArray(data) ? data : (data.plans || data.data || [])
      if (Array.isArray(plans)) {
        const plan = plans.find((p: { id: string; type: string; name: string; price: number }) => p.id === currentUser.planId || p.type === currentUser.planId)
        if (plan) {
          setPlanName(plan.name)
          setPlanPrice(typeof plan.price === 'number' ? plan.price : parseFloat(String(plan.price)) || 0)
        }
      }
    }).catch(() => setPlanName('Gratis'))
  }, [currentUser?.planId])

  const currentPlan = planName ? { name: planName, price: planPrice } : null

  if (!currentUser) return null

  const handleLogout = () => {
    logout()
    onClose?.()
    toast.info('Sesión cerrada', { description: 'Has cerrado sesión correctamente.' })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
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
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-violet-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Store link */}
      {currentStore && (
        <>
          <Separator className="bg-white/10" />
          <div className="px-3 py-4">
            <Link
              href={`/store/${currentStore.slug}`}
              target="_blank"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-violet-200 hover:text-white hover:bg-white/10 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver mi tienda</span>
            </Link>
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
            <Link
              href="/dashboard/plan"
              className="text-xs text-violet-300 hover:text-white underline underline-offset-2 mt-1 inline-block"
            >
              Mejorar plan
            </Link>
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
