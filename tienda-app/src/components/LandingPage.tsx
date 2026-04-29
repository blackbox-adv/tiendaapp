'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Store, ShoppingCart, Palette, MessageCircle, Check, ArrowRight, Sparkles, Star, Zap } from 'lucide-react'

const features = [
  { icon: Store, title: 'Fácil de crear', desc: 'Configura tu tienda en minutos sin conocimientos técnicos' },
  { icon: Palette, title: 'Plantillas bonitas', desc: 'Elige entre plantillas profesionales para tu negocio' },
  { icon: MessageCircle, title: 'WhatsApp integrado', desc: 'Tus clientes te contactan directamente por WhatsApp' },
  { icon: ShoppingCart, title: 'Catálogo online', desc: 'Muestra tus productos con precios e imágenes' },
]

const templates = [
  { name: 'Minimal', category: 'Ropa & Boutique', desc: 'Diseño limpio y elegante', gradient: 'from-pink-50 to-white', color: '#e91e63' },
  { name: 'Sabor', category: 'Restaurantes & Comida', desc: 'Colores cálidos y vibrantes', gradient: 'from-orange-50 to-amber-50', color: '#ff6b35' },
  { name: 'Elegance', category: 'Premium & Lujo', desc: 'Oscuro con acentos dorados', gradient: 'from-gray-900 to-gray-800', color: '#c8a456' },
]

const plans = [
  {
    name: 'Gratis', price: 'S/ 0', period: '/mes', color: 'bg-white', borderColor: 'border-gray-200',
    features: ['10 productos', '3 plantillas', 'Catálogo básico', 'Subir imágenes', 'Vista móvil'],
    cta: 'Comenzar gratis', popular: false
  },
  {
    name: 'Pro', price: 'S/ 49', period: '/mes', color: 'bg-gradient-to-br from-violet-600 to-indigo-600', borderColor: 'border-violet-600',
    features: ['100 productos', '6 plantillas', 'Botón WhatsApp', 'Colores personalizados', 'Dominio personalizado', 'Sin marca de agua'],
    cta: 'Comenzar Pro', popular: true
  },
  {
    name: 'Premium', price: 'S/ 99', period: '/mes', color: 'bg-gradient-to-br from-amber-500 to-orange-500', borderColor: 'border-amber-500',
    features: ['Productos ilimitados', 'Todas las plantillas', 'WhatsApp + redes sociales', 'Dominio custom', 'Soporte prioritario', 'SEO avanzado', 'Estadísticas'],
    cta: 'Ir Premium', popular: false
  },
]

export default function LandingPage() {
  const { navigate } = useStore()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate({ page: 'landing' })} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">TiendaApp</span>
          </button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate({ page: 'login' })} className="text-gray-600">Iniciar sesión</Button>
            <Button onClick={() => navigate({ page: 'register' })} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">Crear mi tienda</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-violet-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 bg-violet-100 text-violet-700 hover:bg-violet-100 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Plataforma #1 para crear tiendas online
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Crea tu tienda online<br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">en minutos</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
              Sin código, sin complicaciones. Elige una plantilla, sube tus productos y listo.
              Empieza gratis y crece cuando quieras.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate({ page: 'register' })} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 h-13 text-base rounded-xl shadow-lg shadow-violet-200">
                Crear mi tienda gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate({ page: 'pricing' })} className="text-gray-600">
                Ver planes <Zap className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">Todo lo que necesitas</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Herramientas simples para que tu negocio brille online</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                      <f.icon className="h-6 w-6 text-violet-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">Plantillas profesionales</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Cada plantilla está diseñada para un tipo de negocio. Elige la que mejor se adapte a ti.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                <Card className="border-0 shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer">
                  <div className={`aspect-[4/3] bg-gradient-to-br ${t.gradient} flex items-center justify-center relative`}>
                    <div className="w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: t.color }}>
                      <Store className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="absolute top-4 left-4 bg-white/90 text-gray-700 text-xs">{t.category}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">Precios claros</h2>
          <p className="text-gray-500 text-center mb-12">Empieza gratis. Crece cuando estés listo.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`relative border-2 ${p.borderColor} overflow-hidden ${p.popular ? 'shadow-xl' : 'shadow-sm'}`}>
                  {p.popular && <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-bl-xl"><Star className="h-3 w-3 inline mr-1" />Popular</div>}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl text-gray-900">{p.name}</h3>
                    <div className="mt-4 mb-6">
                      <span className={`text-4xl font-extrabold ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.price}</span>
                      <span className="text-gray-400 text-sm">{p.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className={p.popular ? 'text-white/90' : 'text-gray-600'}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={p.popular ? 'default' : 'outline'}
                      className={`w-full rounded-xl h-11 font-semibold ${p.popular ? 'bg-white text-violet-600 hover:bg-white/90' : ''}`}
                      onClick={() => navigate({ page: 'register' })}
                    >
                      {p.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">TiendaApp</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} TiendaApp. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
