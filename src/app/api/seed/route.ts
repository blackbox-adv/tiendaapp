import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { authenticateRequest, hashPassword } from '@/lib/auth'

// GET /api/seed - ADMIN ONLY - Seeds the database
export async function GET(request: Request) {
  // Protect this endpoint!
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo administradores pueden usar este endpoint' }, { status: 403 })
  }

  try {
    // Delete all data
    await db.subscription.deleteMany()
    await db.storeProduct.deleteMany()
    await db.store.deleteMany()
    await db.user.deleteMany()
    await db.plan.deleteMany()

    // Plans
    const free = await db.plan.create({
      data: {
        type: 'free', name: 'Free', price: 0, maxProducts: 10,
        description: 'Perfecto para comenzar tu tienda online',
        features: JSON.stringify(['1 tienda online', '10 productos máximo', 'Plantilla básica', 'WhatsApp integrado', 'Soporte por email']),
        popular: false,
      },
    })

    const pro = await db.plan.create({
      data: {
        type: 'pro', name: 'Pro', price: 29.99, maxProducts: 50,
        description: 'Para tiendas en crecimiento',
        features: JSON.stringify(['1 tienda online', '50 productos máximo', 'Todas las plantillas', 'WhatsApp integrado', 'Estadísticas avanzadas', 'Soporte prioritario']),
        popular: true,
      },
    })

    const premium = await db.plan.create({
      data: {
        type: 'premium', name: 'Premium', price: 79.99, maxProducts: 9999,
        description: 'La mejor experiencia para tu negocio',
        features: JSON.stringify(['Hasta 3 tiendas online', 'Productos ilimitados', 'Todas las plantillas', 'Dominio personalizado', 'WhatsApp Business API', 'Soporte 24/7', 'Estadísticas avanzadas', 'API access']),
        popular: false,
      },
    })

    // Users - ALL passwords are HASHED
    const admin = await db.user.create({
      data: { email: 'admin@tiendapp.com', password: await hashPassword('admin123'), name: 'Super Admin', role: 'super_admin', phone: '+51999990000' },
    })
    const maria = await db.user.create({
      data: { email: 'tienda@demo.com', password: await hashPassword('demo123'), name: 'María Demo', role: 'store_owner', phone: '+51999990001' },
    })
    const juan = await db.user.create({
      data: { email: 'juan@pizzeria.com', password: await hashPassword('juan123'), name: 'Juan Delgado', role: 'store_owner', phone: '+51999990002' },
    })
    const ana = await db.user.create({
      data: { email: 'ana@boutique.com', password: await hashPassword('ana123'), name: 'Ana Torres', role: 'store_owner', phone: '+51999990003' },
    })
    const carlos = await db.user.create({
      data: { email: 'carlos@tech.com', password: await hashPassword('carlos123'), name: 'Carlos Mendoza', role: 'store_owner', phone: '+51999990004' },
    })

    // Stores
    const storeBakery = await db.store.create({
      data: { ownerId: maria.id, name: 'Dulce María Bakery', slug: 'dulce-maria-bakery', description: 'Los mejores pasteles y panes artesanales de la ciudad.', logo: '', primaryColor: '#e8a0bf', secondaryColor: '#ba6b8f', whatsappNumber: '+51999990001', template: 'moderna', category: 'alimentos' },
    })
    const storePizzeria = await db.store.create({
      data: { ownerId: juan.id, name: 'Pizzería Napoli', slug: 'pizzeria-napoli', description: 'Auténtica pizza italiana con ingredientes importados.', logo: '', primaryColor: '#d32f2f', secondaryColor: '#ff6659', whatsappNumber: '+51999990002', template: 'vibrante', category: 'alimentos' },
    })
    const storeBoutique = await db.store.create({
      data: { ownerId: ana.id, name: 'Boutique Élégance', slug: 'boutique-elegance', description: 'Moda y accesorios de alta calidad para hombres y mujeres.', logo: '', primaryColor: '#1a1a2e', secondaryColor: '#c8a456', whatsappNumber: '+51999990003', template: 'clasica', category: 'moda' },
    })
    const storeTech = await db.store.create({
      data: { ownerId: carlos.id, name: 'TechStore Peru', slug: 'techstore-peru', description: 'Tecnología de última generación al mejor precio.', logo: '', primaryColor: '#0d47a1', secondaryColor: '#42a5f5', whatsappNumber: '+51999990004', template: 'moderna', category: 'tecnologia' },
    })

    // Products - Bakery (5)
    for (const p of [
      { name: 'Tres Leches Clásico', description: 'Suave bizcocho empapado en tres tipos de leche con merengue italiano.', price: 35.0, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', category: 'pasteles' },
      { name: 'Croissant de Mantequilla', description: 'Croissant francés elaborado con mantequilla premium.', price: 12.0, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600', category: 'panes' },
      { name: 'Pan de Masa Madre', description: 'Pan artesanal de masa madre con 48 horas de fermentación natural.', price: 18.0, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', category: 'panes' },
      { name: 'Cheesecake de Frutos Rojos', description: 'Cheesecake cremoso con coulis de frutos rojos y base de galleta.', price: 42.0, imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', category: 'pasteles' },
      { name: 'Galletas de Chocolate Artesanales', description: 'Galletas con chispas de chocolate belga y nueces pecan.', price: 8.0, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600', category: 'galletas' },
    ]) {
      await db.storeProduct.create({ data: { storeId: storeBakery.id, ...p } })
    }

    // Products - Pizza (5)
    for (const p of [
      { name: 'Margherita Clásica', description: 'Salsa de tomate San Marzano, mozzarella de búfala y albahaca fresca.', price: 38.0, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', category: 'clásicas' },
      { name: 'Pepperoni Supreme', description: 'Doble pepperoni, mozzarella fundida y salsa de tomate casera.', price: 42.0, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', category: 'especiales' },
      { name: 'Quattro Formaggi', description: 'Mozzarella, gorgonzola, parmesano y fontina sobre masa artesanal.', price: 45.0, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', category: 'especiales' },
      { name: 'Prosciutto e Rúcula', description: 'Prosciutto di Parma, rúcula fresca, parmesano y aceite de oliva.', price: 48.0, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', category: 'especiales' },
      { name: 'Calzone Italiano', description: 'Masa rellena de mozzarella, jamón, champiñones y salsa de tomate.', price: 40.0, imageUrl: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=600', category: 'especiales' },
    ]) {
      await db.storeProduct.create({ data: { storeId: storePizzeria.id, ...p } })
    }

    // Products - Boutique (4)
    for (const p of [
      { name: 'Blazer Oversize Negro', description: 'Blazer oversize con corte moderno. Perfecto para cualquier ocasión.', price: 180.0, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', category: 'mujer' },
      { name: 'Vestido Midi Floral', description: 'Vestido midi con estampado floral exclusivo, tejido 100% viscosa.', price: 120.0, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', category: 'mujer' },
      { name: 'Pantalón Wide Leg Camel', description: 'Pantalón wide leg en tono camel, corte alto y tela fluida.', price: 95.0, imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', category: 'mujer' },
      { name: 'Bufanda de Seda', description: 'Bufanda de seda pura con estampado geométrico italiano.', price: 65.0, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600', category: 'accesorios' },
    ]) {
      await db.storeProduct.create({ data: { storeId: storeBoutique.id, ...p } })
    }

    // Products - Tech (2)
    for (const p of [
      { name: 'Auriculares Bluetooth Pro', description: 'Cancelación de ruido activa, 30 horas de batería y sonido Hi-Res.', price: 249.0, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', category: 'audio' },
      { name: 'Cargador Inalámbrico Ultra', description: 'Carga rápida 15W, compatible con todos los dispositivos Qi.', price: 45.0, imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600', category: 'accesorios' },
    ]) {
      await db.storeProduct.create({ data: { storeId: storeTech.id, ...p } })
    }

    // Subscriptions
    await db.subscription.create({ data: { userId: maria.id, storeId: storeBakery.id, planId: pro.id, status: 'active', startDate: new Date() } })
    await db.subscription.create({ data: { userId: juan.id, storeId: storePizzeria.id, planId: pro.id, status: 'active', startDate: new Date() } })
    await db.subscription.create({ data: { userId: ana.id, storeId: storeBoutique.id, planId: premium.id, status: 'active', startDate: new Date() } })
    await db.subscription.create({ data: { userId: carlos.id, storeId: storeTech.id, planId: free.id, status: 'active', startDate: new Date() } })

    return NextResponse.json({
      success: true,
      message: 'Base de datos poblada exitosamente (contraseñas hasheadas con bcrypt)',
      counts: {
        plans: await db.plan.count(),
        users: await db.user.count(),
        stores: await db.store.count(),
        products: await db.storeProduct.count(),
        subscriptions: await db.subscription.count(),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error seeding database'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
