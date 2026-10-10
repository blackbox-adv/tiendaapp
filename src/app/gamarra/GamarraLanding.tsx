'use client'

// Landing Gamarra — nicho de comercio popular (polos, casacas, jeans).
// Estilo editorial terracota idéntico a la portada (bg-terra-cream,
// font-display, accent-serif). Navegación con <a> normales a rutas
// Next.js (/auth/*) para no depender del router SPA de la portada.

import { motion } from 'framer-motion'
import {
  Shirt, MessageCircle, QrCode, Camera, Wallet, Clock, MapPin, Zap, Check,
} from 'lucide-react'

interface FaqItem { q: string; a: string }

const steps = [
  {
    icon: Shirt,
    title: 'Crea tu catálogo en 5 minutos',
    text: 'Un asistente simple te guía: nombre de tu negocio, fotos de tus polos o casacas, precios y tallas. Sin programar nada.',
  },
  {
    icon: QrCode,
    title: 'Compártelo con tu enlace o QR',
    text: 'Pega tu enlace en tu estado de WhatsApp, en la bio de Instagram o imprime tu QR para el puesto. Un solo enlace para todo tu stock.',
  },
  {
    icon: MessageCircle,
    title: 'Recibe los pedidos por WhatsApp',
    text: 'Tu cliente toca el producto que le gustó y te escribe directo con el pedido listo. Tú cierras la venta como siempre.',
  },
]

const benefits = [
  {
    icon: Camera,
    title: 'Fotos con cara de professional',
    text: 'El quita-fondos con IA deja tus fotos de producto limpias, sin fondo desordenado, aunque las hayas tomado con el celular.',
  },
  {
    icon: Clock,
    title: 'Vendes 24/7 sin estar pendiente',
    text: 'El puesto cierra, tu catálogo no. Tus clientes ven precios y tallas a cualquier hora, incluso feriados y domingos.',
  },
  {
    icon: MapPin,
    title: 'Clientes de todo Lima y del Perú',
    text: 'Ya no dependes solo de quien pasa por tu galería. Comparte tu enlace en grupos y redes: te compran desde cualquier distrito.',
  },
  {
    icon: Wallet,
    title: 'Cobras como siempre',
    text: 'Yape, Plin, efectivo al recibir o transferencia: tu catálogo muestra tus métodos de pago y tu política de entrega.',
  },
]

export function GamarraLanding({ faq }: { faq: FaqItem[] }) {
  return (
    <div className="min-h-screen bg-terra-cream text-stone-900">
      {/* ===== Header minimal ===== */}
      <header className="sticky top-0 z-40 bg-terra-cream/90 backdrop-blur border-b border-[#BC5A38]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-display font-black text-xl tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-terra text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
            Kyllari
          </a>
          <nav className="flex items-center gap-3">
            <a href="/auth/login" className="text-sm font-semibold text-stone-700 hover:text-terra transition-colors px-3 py-2">
              Iniciar sesión
            </a>
            <a
              href="/auth/register"
              className="text-sm font-bold bg-stone-900 hover:bg-terra text-white px-5 py-2.5 rounded-full transition-colors"
            >
              Crear catálogo gratis
            </a>
          </nav>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute top-16 -left-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-[#EAD9C9]" />
        <div className="absolute bottom-10 -right-24 w-[28rem] h-[28rem] rounded-full filter blur-3xl opacity-40 bg-[#F0DED2]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 lg:pt-24 lg:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#BC5A38]/25 text-stone-800 text-sm font-medium mb-6">
              <MapPin className="w-4 h-4 text-terra" />
              Especial para comerciantes de Gamarra y emprendedores
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.08] mb-6 tracking-tight max-w-4xl mx-auto">
              Vende en Gamarra con tu propio catálogo online y{' '}
              <span className="accent-serif">recibe los pedidos por WhatsApp</span>
            </h1>

            <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Polos, casacas, jeans, gorras o accesorios: muestra todo tu stock con{' '}
              <strong className="text-stone-900">fotos, precios y tallas</strong> en un solo enlace.
              Tus clientes eligen y te escriben directo por WhatsApp. Tú cobras con{' '}
              <strong className="text-stone-900">Yape, Plin o efectivo</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <a
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold px-8 py-5 text-lg rounded-full shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Crear mi catálogo gratis
              </a>
              <a
                href="/demo/bodega"
                className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-stone-900 bg-transparent text-stone-900 hover:bg-stone-900 hover:text-white font-semibold px-8 py-5 text-lg rounded-full transition-all"
              >
                Ver tienda de ejemplo
              </a>
            </div>

            <p className="text-sm text-stone-500">
              ✅ Sin tarjeta · ✅ Plan gratis para siempre · ✅ Sin comisión por venta
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section className="py-16 lg:py-20 bg-terra-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-3 tracking-tight">
            Así de simple funciona
          </h2>
          <p className="text-stone-600 text-center mb-12 max-w-xl mx-auto">
            Tres pasos entre tu puesto de Gamarra y tus primeras ventas online.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-white rounded-2xl p-7 border border-[#BC5A38]/10 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-11 h-11 rounded-xl bg-terra text-white flex items-center justify-center shrink-0">
                    <s.icon className="w-5 h-5" />
                  </span>
                  <span className="font-display font-black text-3xl text-[#BC5A38]/25">0{i + 1}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Beneficios ===== */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-3 tracking-tight">
            Hecho para el comercio popular
          </h2>
          <p className="text-stone-600 text-center mb-12 max-w-xl mx-auto">
            Lo que un negocio de Gamarra necesita para vender online, nada que sobre.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 bg-white/70 rounded-2xl p-6 border border-[#BC5A38]/10"
              >
                <span className="w-11 h-11 rounded-xl bg-terra-soft text-terra flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold mb-1.5">{b.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{b.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ¿Por qué un catálogo? ===== */}
      <section className="py-16 lg:py-20 bg-terra-ink text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-12 tracking-tight">
            ¿Ya vendes bien en Gamarra? <span className="italic text-[#E8A187]">Vende el doble</span>
          </h2>
          <div className="space-y-6">
            {[
              'Tu catálogo responde por ti: precio, tallas y fotos sin repetir lo mismo 50 veces al día en el chat.',
              'Quien no llegó hoy a tu galería, igual ve tu stock: te compra desde San Juan de Lurigancho o desde otra ciudad.',
              'WhatsApp sigue siendo el canal donde cierras: solo que ahora llega el pedido con el producto exacto, no un "hola, qué tienes".',
            ].map((t) => (
              <div key={t} className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-[#BC5A38] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </span>
                <p className="text-lg text-stone-200 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-10 tracking-tight">
            Preguntas de comerciantes como tú
          </h2>
          <div className="space-y-4">
            {faq.map((f) => (
              <details key={f.q} className="group bg-white rounded-2xl border border-[#BC5A38]/10 p-6 open:shadow-md transition-shadow">
                <summary className="font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-terra text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-stone-600 text-sm leading-relaxed mt-4">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="py-16 lg:py-20 bg-terra-deep">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-4 tracking-tight">
            Tu puesto de Gamarra también puede estar online hoy
          </h2>
          <p className="text-stone-600 mb-8">
            Crea tu catálogo gratis ahora y comparte tu enlace en tu próximo estado de WhatsApp.
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold px-10 py-5 text-lg rounded-full shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Crear mi catálogo gratis
          </a>
        </div>
      </section>

      {/* ===== Footer minimal ===== */}
      <footer className="py-10 border-t border-[#BC5A38]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} Kyllari · Crea tu tienda online en minutos</p>
          <nav className="flex items-center gap-5">
            <a href="/about" className="hover:text-terra transition-colors">Nosotros</a>
            <a href="/contact" className="hover:text-terra transition-colors">Contacto</a>
            <a href="/terms" className="hover:text-terra transition-colors">Términos</a>
            <a href="/privacy" className="hover:text-terra transition-colors">Privacidad</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
