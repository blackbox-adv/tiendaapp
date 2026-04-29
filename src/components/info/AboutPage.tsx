'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Zap, Heart, Users, Target, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AboutPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-violet-700">TiendApp</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Sobre Nosotros</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Nacimos con una misión: democratizar el comercio electrónico en Perú y ayudar a miles de emprendedores a digitalizar sus negocios.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-violet-600" />
              <h2 className="text-xl font-bold text-gray-900">Nuestra Misión</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              En TiendApp creemos que todo emprendedor peruano merece tener su tienda online, sin importar su nivel de conocimientos técnicos. Por eso creamos una plataforma que permite montar una tienda profesional en minutos, sin necesidad de programar ni diseñar. Nuestro objetivo es ser el puente entre los negocios locales y el mundo digital, impulsando el crecimiento económico de miles de familias peruanas.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Nuestros Valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Heart, title: 'Pasión por el emprendimiento', desc: 'Apoyamos a cada emprendedor con dedicación y entusiasmo, porque sabemos que detrás de cada tienda hay un sueño.' },
              { icon: Users, title: 'Comunidad primero', desc: 'Construimos juntos. Cada función de TiendApp nace de escuchar las necesidades reales de nuestros usuarios.' },
              { icon: Globe, title: 'Innovación local', desc: 'Diseñamos soluciones pensadas para el mercado peruano, con integración a métodos de pago y logística local.' },
              { icon: Zap, title: 'Simplicidad', desc: 'La tecnología debe ser simple. Eliminamos la complejidad para que anyone pueda tener su tienda online.' },
            ].map((value, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all">
                <value.icon className="w-8 h-8 text-violet-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: '500+', label: 'Tiendas activas' },
            { value: '10,000+', label: 'Productos publicados' },
            { value: '50,000+', label: 'Pedidos gestionados' },
            { value: '98%', label: 'Clientes satisfechos' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-xl bg-gray-50">
              <div className="text-2xl sm:text-3xl font-bold text-violet-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Listo para unirte?</h2>
          <p className="text-gray-500 mb-6">Empieza hoy gratis y lleva tu negocio al siguiente nivel.</p>
          <Button onClick={() => navigate({ page: 'register' })} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            Crear mi tienda gratis
            <Zap className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
