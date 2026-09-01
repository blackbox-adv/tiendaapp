'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { LayoutDashboard, Package, Palette, Settings, CreditCard, Eye, LogOut, Menu, Store } from 'lucide-react'
import { motion } from 'framer-motion'

const menuItems = [
  { id: 'dashboard', label: 'Mi Tienda', icon: LayoutDashboard, page: 'dashboard' as const },
  { id: 'products', label: 'Productos', icon: Package, page: 'dashboard-products' as const },
  { id: 'appearance', label: 'Apariencia', icon: Palette, page: 'dashboard-appearance' as const },
  { id: 'settings', label: 'Configuración', icon: Settings, page: 'dashboard-settings' as const },
  { id: 'plan', label: 'Mi Plan', icon: CreditCard, page: 'dashboard-plan' as const },
]

export default function DashboardLayout({ children, activePage = 'dashboard' }: { children: React.ReactNode; activePage?: string; title?: string }) {
  const { navigate, currentUser, logout } = useStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const plan = currentUser?.plan || 'free'
  const planColors = { free: 'bg-gray-100 text-gray-600', pro: 'bg-violet-100 text-violet-700', premium: 'bg-amber-100 text-amber-700' }
  const storeName = null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)}><Menu className="h-5 w-5" /></Button>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-64 p-0">
                  <div className="p-4 border-b"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center"><Store className="h-4 w-4 text-white" /></div><span className="font-bold">TiendaApp</span></div></div>
                  <nav className="p-3 space-y-1">{menuItems.map(item => (<Button key={item.id} variant={activePage === item.id ? 'secondary' : 'ghost'} className={`w-full justify-start gap-2 ${activePage === item.id ? 'bg-violet-100 text-violet-700' : ''}`} onClick={() => { navigate({ page: item.page }); setSheetOpen(false) }}><item.icon className="h-4 w-4" />{item.label}</Button>))}</nav>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-violet-600" />
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">TiendaApp</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${planColors[plan as keyof typeof planColors]} text-xs`}>{plan.toUpperCase()}</Badge>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1 sticky top-20">
              {menuItems.map(item => (
                <Button key={item.id} variant={activePage === item.id ? 'secondary' : 'ghost'} className={`w-full justify-start gap-2 ${activePage === item.id ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => navigate({ page: item.page })}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Button>
              ))}
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <motion.div key={activePage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
