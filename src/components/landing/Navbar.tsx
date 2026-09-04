'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Zap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from './WhatsAppIcon'

export function Navbar() {
  const navigate = useAppStore((s) => s.navigate)
  const currentUser = useAppStore((s) => s.currentUser)
  const isSyncing = useAppStore((s) => s.isSyncing)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNav = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F7F2EA]/90 backdrop-blur-lg shadow-lg border-b border-[#E5DCCB]'
          : 'bg-[#F7F2EA]/70 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#BC5A38] flex items-center justify-center group-hover:bg-[#A84C2D] transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-stone-900">TiendApp</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNav('#templates')} className="text-sm font-medium text-stone-600 hover:text-[#BC5A38] transition-colors">
              Demos
            </button>
            <button onClick={() => handleNav('#features')} className="text-sm font-medium text-stone-600 hover:text-[#BC5A38] transition-colors">
              Funciones
            </button>
            <button onClick={() => handleNav('#comparativa')} className="text-sm font-medium text-stone-600 hover:text-[#BC5A38] transition-colors">
              ¿Por qué TiendApp?
            </button>
            <button onClick={() => handleNav('#pricing')} className="text-sm font-medium text-stone-600 hover:text-[#BC5A38] transition-colors">
              Precios
            </button>
          </div>

          {/* Auth Buttons (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Button
                onClick={() => navigate(currentUser.role === 'admin' ? { page: 'admin' } : { page: 'dashboard' })}
                className="bg-stone-900 hover:bg-[#BC5A38] text-white"
              >
                Mi Panel
              </Button>
            ) : isSyncing ? (
              // Restaurando sesión — esqueleto neutro para no ofrecer "Crear mi tienda" a quien ya tiene cuenta
              <div className="w-28 h-9 rounded-md bg-stone-200/80 animate-pulse" />
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate({ page: 'login' })} className="border-stone-300 text-stone-700 hover:bg-white hover:text-[#BC5A38] hover:border-[#BC5A38]/40">
                  Iniciar sesión
                </Button>
                <Button onClick={() => navigate({ page: 'register' })} className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold">
                  <WhatsAppIcon className="w-4 h-4 mr-1.5" />
                  Crear mi tienda
                </Button>
              </>
            )}
          </div>

          {/* Mobile: "Mi Panel" siempre a la vista (1 tap al dashboard, sin abrir menú) */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser && (
              <Button
                size="sm"
                onClick={() => navigate(currentUser.role === 'admin' ? { page: 'admin' } : { page: 'dashboard' })}
                className="h-9 px-3.5 bg-stone-900 hover:bg-[#BC5A38] text-white text-sm font-semibold"
              >
                Mi Panel
              </Button>
            )}
            <button className="p-2 -mr-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú">
              {mobileOpen ? <X className="w-6 h-6 text-stone-700" /> : <Menu className="w-6 h-6 text-stone-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[#F7F2EA]/95 backdrop-blur-lg border-t border-[#E5DCCB]"
        >
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => handleNav('#templates')} className="block w-full text-left text-sm font-medium text-stone-600 hover:text-[#BC5A38] py-2">
              Demos
            </button>
            <button onClick={() => handleNav('#features')} className="block w-full text-left text-sm font-medium text-stone-600 hover:text-[#BC5A38] py-2">
              Funciones
            </button>
            <button onClick={() => handleNav('#comparativa')} className="block w-full text-left text-sm font-medium text-stone-600 hover:text-[#BC5A38] py-2">
              ¿Por qué TiendApp?
            </button>
            <button onClick={() => handleNav('#pricing')} className="block w-full text-left text-sm font-medium text-stone-600 hover:text-[#BC5A38] py-2">
              Precios
            </button>
            <div className="pt-3 border-t border-[#E5DCCB] space-y-2">
              {currentUser ? (
                <Button onClick={() => { navigate(currentUser.role === 'admin' ? { page: 'admin' } : { page: 'dashboard' }); setMobileOpen(false) }} className="w-full bg-stone-900 hover:bg-[#BC5A38] text-white">
                  Mi Panel
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { navigate({ page: 'login' }); setMobileOpen(false) }} className="w-full text-[#BC5A38]">
                    Iniciar sesión
                  </Button>
                  <Button onClick={() => { navigate({ page: 'register' }); setMobileOpen(false) }} className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold">
                    <WhatsAppIcon className="w-4 h-4 mr-1.5" />
                    Crear mi tienda
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
