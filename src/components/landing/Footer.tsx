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
      <section className="py-16 sm:py-20 bg-terra-ink relative overflow-hidden border-y border-[#BC5A38]/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-[#BC5A38]/20 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Listo para crear tu <span className="accent-serif">tienda online</span>?
            </h2>
            <p className="text-lg text-stone-300 mb-8 max-w-2xl mx-auto">
              Unete a cientos de emprendedores que ya venden con Kyllari. Comienza gratis hoy.
            </p>
            <Button
              size="lg"
              onClick={() => navigate({ page: 'register' })}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-xl"
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
              <div className="w-8 h-8 rounded-lg bg-[#BC5A38] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-stone-900">Kyllari</span>
            </button>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              La plataforma para crear tiendas online de forma rápida y sencilla en toda Latinoamérica.
            </p>
            <div className="flex gap-3">
              {/* Redes que sí usan los emprendedores */}
              <a href={waHref ?? '/contact'} target={waHref ? '_blank' : undefined} rel={waHref ? 'noopener noreferrer' : undefined} aria-label="WhatsApp" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>

            </div>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Producto</h4>
            <ul className="space-y-3">
              <li><button onClick={() => handleNav('#features')} className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Funciones</button></li>
              <li><button onClick={() => handleNav('#pricing')} className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Precios</button></li>
              <li><button onClick={() => handleNav('#templates')} className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Plantillas</button></li>
              <li><button onClick={() => handleNav('#testimonials')} className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Tiendas reales</button></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Sobre nosotros</Link></li>
              <li><Link href="/contact" className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Contacto</Link></li>
              <li><Link href="/terms" className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/privacy" className="text-sm text-stone-500 hover:text-[#BC5A38] transition-colors">Política de privacidad</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-stone-500">
                <Mail className="w-4 h-4 text-[#BC5A38]/70" />
                {contactEmail}
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-500">
                <Phone className="w-4 h-4 text-[#BC5A38]/70" />
                {phoneDisplay}
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-500">
                <MapPin className="w-4 h-4 text-[#BC5A38]/70 mt-0.5" />
                Lima, Perú
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-[#E5DCCB]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-sm text-stone-400">
              © {new Date().getFullYear()} Kyllari. Todos los derechos reservados. Hecho con 🧡 en Perú.
            </p>
            <p className="text-xs text-stone-400">
              Kyllari SAC · RUC 2060XXXXXXX · Av. Javier Prado, Lima, Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
