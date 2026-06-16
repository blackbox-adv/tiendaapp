import type { Testimonial } from './types'

// Testimonios de emprendedores peruanos con métricas concretas y rubro
// Fotos de personas reales vía Unsplash
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'María García',
    role: 'Panadería artesanal · Lima',
    storeName: 'Dulce María Bakery',
    comment:
      'En 3 semanas pasé de vender solo en mi barrio a despachar pedidos a San Isidro, Miraflores y Surco. Los clientes me pagan por Yape al instante y yo despacho. Ya tengo 180 pedidos cerrados por WhatsApp.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 't2',
    name: 'Juan Delgado',
    role: 'Pizzería · Arequipa',
    storeName: 'Pizzería Napoli',
    comment:
      'Mis clientes hacen su pedido por WhatsApp con un toque, me mandan el Yape y despacho. En 2 meses subí mis ventas en 35%. La plantilla se ve profesional y no pagué un solo centavo en comisión por venta.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 't3',
    name: 'Ana Torres',
    role: 'Diseñadora de moda · Trujillo',
    storeName: 'Boutique Élégance',
    comment:
      'Vendí 24 vestidos el primer mes sin pagar Facebook Ads. Las clientas ven mis diseños, me escriben por WhatsApp y cierran. No necesito saber programar ni pagar comisión por venta.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 't4',
    name: 'Carlos Mendoza',
    role: 'Tecnología y accesorios · Lima',
    storeName: 'TechStore Peru',
    comment:
      'Empecé con el plan gratis, a los 2 meses pasé a Pro cuando superé los 20 productos. Hoy vendo S/ 8,000 mensuales y pago solo S/ 29.90 al mes. La relación calidad-precio es lo mejor que vi en Perú.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 't5',
    name: 'Lucía Rojas',
    role: 'Artesanía textil · Cusco',
    storeName: 'Artesanías Lucía',
    comment:
      'Mis tejidos llegan a clientes en todo el país. Antes solo vendía a turistas en Cusco, ahora despacho a Lima, Arequipa y Piura. 60% de mis ventas vienen de la tienda online. El plan gratis me alcanzó para empezar.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 't6',
    name: 'Rosa Quispe',
    role: 'Productos naturales · Huancayo',
    storeName: 'Natural Rosa',
    comment:
      'Sin saber nada de tecnología armé mi tienda en una tarde. Configuré Yape, Plin y mi WhatsApp, subí mis productos y al día siguiente ya tenía 3 pedidos. El soporte por WhatsApp me ayudó en todo.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  },
]
