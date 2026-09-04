'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { Zap, ShoppingBag, Star, Bell, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from './WhatsAppIcon'
import { logAbEvent } from '@/lib/ab-test'

export function Hero() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-purple-900">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-fuchsia-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 sm:pt-32 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* ===== Copy (left) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-amber-300" />
              Para emprendedores de toda Latinoamérica 🌎
            </div>

            {/* Heading — dolor + resultado directo */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.1] mb-6">
              Crea tu catálogo online y{' '}
              <span className="text-emerald-300">recibe pedidos por WhatsApp</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-violet-100/90 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Deja de perder pedidos entre chats y fotos sueltas. Tu tienda con{' '}
              <strong className="text-white">botón de WhatsApp</strong>, los{' '}
              <strong className="text-white">métodos de pago de tu país</strong> y packs con descuento.
              Lista en 5 minutos, sin comisión por venta.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => {
                  logAbEvent('cta_click')
                  navigate({ page: 'register' })
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold px-8 py-6 text-lg rounded-2xl shadow-xl shadow-emerald-900/40 hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                <WhatsAppIcon className="w-5 h-5 mr-2" />
                Crear mi tienda gratis
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  logAbEvent('cta_click')
                  window.location.href = '/demo/bodega'
                }}
                className="w-full sm:w-auto border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-2xl transition-all"
              >
                Ver tienda de ejemplo
              </Button>
            </div>

            {/* Trust microcopy */}
            <p className="text-sm text-violet-200/80 mb-8">
              ✅ Sin tarjeta · ✅ Plan gratis para siempre · ✅ Cancelas cuando quieras
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { icon: Zap, value: '5 min', label: 'En crear tu tienda' },
                { icon: ShoppingBag, value: '0%', label: 'Comisión por venta' },
                { icon: Star, value: 'Gratis', label: 'Para empezar' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.15, ease: 'easeOut' }}
                  className="text-center lg:text-left rounded-2xl bg-white/5 border border-white/10 px-3 py-4"
                >
                  <div className="flex items-center justify-center lg:justify-start mb-1">
                    <stat.icon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-violet-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ===== Phone mockup (right) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full scale-90" />

            {/* Phone frame */}
            <div className="relative w-[270px] sm:w-[300px] rounded-[2.5rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20" />
              {/* Screenshot: tienda bodega demo real */}
              <div className="aspect-[9/16] bg-white overflow-hidden">
                <Image
                  src="/templates/bodega-preview.png"
                  alt="Tienda online de bodega creada con TiendApp con pedidos por WhatsApp"
                  width={300}
                  height={533}
                  priority
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Floating card: pedido WhatsApp */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute -left-2 sm:left-2 top-[18%] bg-white rounded-2xl shadow-2xl p-3 flex items-center gap-2.5 max-w-[210px]"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 leading-tight">¡Nuevo pedido!</p>
                <p className="text-[11px] text-gray-500 leading-tight truncate">"Quiero 2 panetones 🎄"</p>
              </div>
            </motion.div>

            {/* Floating card: pago Yape */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute right-0 sm:right-6 bottom-[22%] bg-white rounded-2xl shadow-2xl p-3 flex items-center gap-2.5 max-w-[200px]"
            >
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">Pago recibido</p>
                <p className="text-[11px] font-semibold text-violet-700 leading-tight">$45.90 vía Yape</p>
              </div>
            </motion.div>

            {/* Floating badge: venta cerrada */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="absolute left-4 bottom-[8%] bg-amber-400 text-amber-950 rounded-full shadow-xl px-4 py-2 flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Tu venta de hoy: $128.50</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust row: funciona con lo que ya usas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-16 lg:mt-20 flex flex-col items-center gap-4"
        >
          <p className="text-sm text-violet-300 uppercase tracking-widest font-medium">
            Funciona con lo que tú y tus clientes ya usan
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['WhatsApp', 'Yape', 'Plin', 'Mercado Pago', 'Efectivo', 'Transferencia'].map((tool) => (
              <span
                key={tool}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-semibold backdrop-blur-sm"
              >
                {tool === 'WhatsApp' && <WhatsAppIcon className="w-4 h-4 inline mr-1.5 -mt-0.5 text-emerald-300" />}
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
