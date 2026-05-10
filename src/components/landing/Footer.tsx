'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Zap, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Footer() {
  const navigate = useAppStore((s) => s.navigate)
  const contactEmail = useAppStore((s) => s.platformSettings.contactEmail)
  const contactPhone = useAppStore((s) => s.platformSettings.contactPhone)

  // Format phone for display: +51 999 888 777
  const phoneDisplay = contactPhone.startsWith('+51') && contactPhone.length >= 12
    ? `${contactPhone.slice(0, 3)} ${contactPhone.slice(3, 6)} ${contactPhone.slice(6, 9)} ${contactPhone.slice(9)}`
    : contactPhone

  const handleNav = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-white">
      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Listo para crear tu tienda online?
            </h2>
            <p className="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
              Unete a cientos de emprendedores que ya venden con TiendApp. Comienza gratis hoy.
            </p>
            <Button
              size="lg"
              onClick={() => navigate({ page: 'register' })}
              className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-8 py-6 text-lg rounded-xl shadow-xl"
            >
              Comenzar gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-violet-700">TiendApp</span>
            </button>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              La plataforma líder en Perú para crear tiendas online de forma rápida y sencilla.
            </p>
            <div className="flex gap-3">
              {/* TODO: Replace with actual social media URLs when available */}
              <a href="https://twitter.com/tiendapp" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-violet-100 flex items-center justify-center text-gray-400 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.944 13.944 0 011.671 3.149a4.916 4.916 0 001.523 6.574 4.897 4.897 0 01-2.229-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.224.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"/></svg>
              </a>
              <a href="https://instagram.com/tiendapp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-violet-100 flex items-center justify-center text-gray-400 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://facebook.com/tiendapp" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-violet-100 flex items-center justify-center text-gray-400 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
              </a>
            </div>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Producto</h4>
            <ul className="space-y-3">
              <li><button onClick={() => handleNav('#features')} className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Funciones</button></li>
              <li><button onClick={() => handleNav('#pricing')} className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Precios</button></li>
              <li><button onClick={() => handleNav('#templates')} className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Plantillas</button></li>
              <li><button onClick={() => handleNav('#testimonials')} className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Testimonios</button></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Sobre nosotros</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Contacto</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Política de privacidad</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-violet-400" />
                {contactEmail}
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="w-4 h-4 text-violet-400" />
                {phoneDisplay}
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-violet-400 mt-0.5" />
                Lima, Perú
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} TiendApp. Todos los derechos reservados. Hecho con 💜 en Perú.
          </p>
        </div>
      </div>
    </footer>
  )
}
