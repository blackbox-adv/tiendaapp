'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  // Logo/nombre = volver al inicio SIEMPRE: si estás más abajo de la landing
  // te sube suave; si vienes de otra página, navega y luego sube.
  const handleLogoClick = () => {
    setMobileOpen(false)
    navigate({ page: 'landing' })
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 80)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFFFFF]/90 backdrop-blur-lg shadow-lg border-b border-[#E4E2F2]'
          : 'bg-[#FFFFFF]/70 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-2.5 group" aria-label="Kyllari - volver al inicio">
            {/* Isotipo oficial de la marca (badge violeta luna+bolsa) */}
            <img src="/logo.svg" alt="Logo Kyllari" width={32} height={32} className="w-8 h-8 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xl font-bold font-display text-[#17142E]">Kyllari</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNav('#templates')} className="text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">
              Demos
            </button>
            <button onClick={() => handleNav('#features')} className="text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">
              Funciones
            </button>
            <button onClick={() => handleNav('#comparativa')} className="text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">
              ¿Por qué Kyllari?
            </button>
            <button onClick={() => handleNav('#pricing')} className="text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">
              Precios
            </button>
          </div>

          {/* Auth Buttons (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Button
                onClick={() => navigate(currentUser.role === 'admin' ? { page: 'admin' } : { page: 'dashboard' })}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              >
                Mi Panel
              </Button>
            ) : isSyncing ? (
              // Restaurando sesión — esqueleto neutro para no ofrecer "Crear mi tienda" a quien ya tiene cuenta
              <div className="w-28 h-9 rounded-md bg-[#ECEAFE] animate-pulse" />
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate({ page: 'login' })} className="border-[#E4E2F2] text-[#17142E] hover:bg-white hover:text-[#4F46E5] hover:border-[#4F46E5]/40">
                  Iniciar sesión
                </Button>
                <Button onClick={() => navigate({ page: 'register' })} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold">
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
                className="h-9 px-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold"
              >
                Mi Panel
              </Button>
            )}
            <button className="p-2 -mr-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú">
              {mobileOpen ? <X className="w-6 h-6 text-[#17142E]" /> : <Menu className="w-6 h-6 text-[#17142E]" />}
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
          className="md:hidden bg-[#FFFFFF]/95 backdrop-blur-lg border-t border-[#E4E2F2]"
        >
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => handleNav('#templates')} className="block w-full text-left text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] py-2">
              Demos
            </button>
            <button onClick={() => handleNav('#features')} className="block w-full text-left text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] py-2">
              Funciones
            </button>
            <button onClick={() => handleNav('#comparativa')} className="block w-full text-left text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] py-2">
              ¿Por qué Kyllari?
            </button>
            <button onClick={() => handleNav('#pricing')} className="block w-full text-left text-sm font-medium text-[#5D5A7E] hover:text-[#4F46E5] py-2">
              Precios
            </button>
            <div className="pt-3 border-t border-[#E4E2F2] space-y-2">
              {currentUser ? (
                <Button onClick={() => { navigate(currentUser.role === 'admin' ? { page: 'admin' } : { page: 'dashboard' }); setMobileOpen(false) }} className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                  Mi Panel
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { navigate({ page: 'login' }); setMobileOpen(false) }} className="w-full text-[#4F46E5]">
                    Iniciar sesión
                  </Button>
                  <Button onClick={() => { navigate({ page: 'register' }); setMobileOpen(false) }} className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold">
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
