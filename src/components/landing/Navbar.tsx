'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Zap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const navigate = useAppStore((s) => s.navigate)
  const currentUser = useAppStore((s) => s.currentUser)
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
          ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-violet-100'
          : 'bg-white/70 backdrop-blur-md border-b border-white/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-700 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-violet-700">TiendApp</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNav('#features')} className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors">
              Funciones
            </button>
            <button onClick={() => handleNav('#pricing')} className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors">
              Precios
            </button>
            <button onClick={() => handleNav('#templates')} className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors">
              Plantillas
            </button>
            <button onClick={() => handleNav('#testimonials')} className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors">
              Testimonios
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Button
                onClick={() => navigate(currentUser.role === 'admin' ? { page: 'admin' } : { page: 'dashboard' })}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Mi Panel
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate({ page: 'login' })} className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800">
                  Iniciar sesión
                </Button>
                <Button onClick={() => navigate({ page: 'register' })} className="bg-violet-600 hover:bg-violet-700 text-white">
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-lg border-t border-violet-100"
        >
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => handleNav('#features')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-violet-600 py-2">
              Funciones
            </button>
            <button onClick={() => handleNav('#pricing')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-violet-600 py-2">
              Precios
            </button>
            <button onClick={() => handleNav('#templates')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-violet-600 py-2">
              Plantillas
            </button>
            <button onClick={() => handleNav('#testimonials')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-violet-600 py-2">
              Testimonios
            </button>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {currentUser ? (
                <Button onClick={() => { navigate(currentUser.role === 'admin' ? { page: 'admin' } : { page: 'dashboard' }); setMobileOpen(false) }} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                  Mi Panel
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { navigate({ page: 'login' }); setMobileOpen(false) }} className="w-full text-violet-600">
                    Iniciar sesión
                  </Button>
                  <Button onClick={() => { navigate({ page: 'register' }); setMobileOpen(false) }} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                    Registrarse
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
