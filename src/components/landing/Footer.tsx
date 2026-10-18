'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Mail, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Footer() {
  const navigate = useAppStore((s) => s.navigate)
  const contactEmail = useAppStore((s) => s.platformSettings.contactEmail)

  const handleNav = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-white">
      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-terra-ink relative overflow-hidden border-y border-[#4F46E5]/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-[#4F46E5]/20 rounded-full blur-3xl" />
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
            <p className="text-lg text-white/75 mb-8 max-w-2xl mx-auto">
              Unete a cientos de emprendedores que ya venden con Kyllari. Comienza gratis hoy.
            </p>
            <Button
              size="lg"
              onClick={() => navigate({ page: 'register' })}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-8 py-6 text-lg rounded-full shadow-xl shadow-[#4F46E5]/30"
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
            <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2.5 mb-4" aria-label="Kyllari - inicio">
              {/* Isotipo oficial de la marca (badge violeta luna+bolsa) */}
              <img src="/logo.svg" alt="Logo Kyllari" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-bold font-display text-[#17142E]">Kyllari</span>
            </button>
            <p className="text-sm text-[#5D5A7E] leading-relaxed mb-4">
              La plataforma peruana para crear tu tienda online o catálogo digital en minutos y vender por WhatsApp.
            </p>
            <div className="flex gap-3">
              {/* Contacto directo por email (sin WhatsApp de soporte: el dueño
                  no tiene un número público para la web — decisión suya) */}
              <a href={`mailto:${contactEmail}`} aria-label="Email" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-[#ECEAFE] flex items-center justify-center text-gray-500 hover:text-[#4F46E5] transition-colors">
                <Mail className="w-4 h-4" />
              </a>

            </div>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-sm font-semibold text-[#17142E] uppercase tracking-wider mb-4">Producto</h4>
            <ul className="space-y-3">
              <li><button onClick={() => handleNav('#features')} className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Funciones</button></li>
              <li><button onClick={() => handleNav('#pricing')} className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Precios</button></li>
              <li><button onClick={() => handleNav('#templates')} className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Plantillas</button></li>
              <li><button onClick={() => handleNav('#testimonials')} className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Tiendas reales</button></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-[#17142E] uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Sobre nosotros</Link></li>
              <li><Link href="/contact" className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Contacto</Link></li>
              <li><Link href="/terms" className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/privacy" className="text-sm text-[#5D5A7E] hover:text-[#4F46E5] transition-colors">Política de privacidad</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-[#17142E] uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[#5D5A7E]">
                <Mail className="w-4 h-4 text-[#4F46E5]/70" />
                {contactEmail}
              </li>
              <li className="flex items-start gap-2 text-sm text-[#5D5A7E]">
                <MapPin className="w-4 h-4 text-[#4F46E5]/70 mt-0.5" />
                Lima, Perú
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-[#E4E2F2]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-sm text-[#8B88AD]">
              © {new Date().getFullYear()} Kyllari. Todos los derechos reservados. Hecho con 🧡 en Perú.
            </p>
            <p className="text-xs text-[#8B88AD]">
              Hermanos Guzso SAC · RUC 20609467381 · Lima, Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
