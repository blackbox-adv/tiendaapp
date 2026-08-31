'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Zap, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supportWhatsappUrl } from '@/lib/support'

export function Footer() {
  const navigate = useAppStore((s) => s.navigate)
  const waHref = supportWhatsappUrl()
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
              {/* Redes que sí usan los emprendedores peruanos */}
              <a href={waHref ?? '/contact'} target={waHref ? '_blank' : undefined} rel={waHref ? 'noopener noreferrer' : undefined} aria-label="WhatsApp" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://instagram.com/tiendapp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-violet-100 flex items-center justify-center text-gray-500 hover:text-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://facebook.com/tiendapp" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-violet-100 flex items-center justify-center text-gray-500 hover:text-violet-600 transition-colors">
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
              <li><button onClick={() => handleNav('#testimonials')} className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Tiendas reales</button></li>
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
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} TiendApp. Todos los derechos reservados. Hecho con 💜 en Perú.
            </p>
            <p className="text-xs text-gray-400">
              TiendApp SAC · RUC 2060XXXXXXX · Av. Javier Prado, Lima, Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
