import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const count = await db.user.count()
    return NextResponse.json({ 
      status: 'ok', 
      tablesExist: true,
      userCount: count,
      message: count > 0 ? 'Base de datos lista con ' + count + ' usuarios' : 'Base vacía - necesita seed'
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg.includes('does not exist') || msg.includes('relation')) {
      return NextResponse.json({ 
        status: 'no_tables', 
        message: 'Las tablas no existen aún.',
        error: msg
      }, { status: 200 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST() {
  try {
    await db.storeImage.deleteMany()
    await db.product.deleteMany()
    await db.store.deleteMany()
    await db.user.deleteMany()

    // Super Admin
    await db.user.create({ data: { email: 'admin@tienda.com', password: 'admin123', name: 'Super Admin', role: 'admin', plan: 'premium' } })

    // Demo 1: Minimal - Ropa (Free)
    const u1 = await db.user.create({ data: { email: 'maria@boutique.com', password: '123456', name: 'María García', plan: 'free' } })
    const s1 = await db.store.create({ data: { name: 'Boutique María', slug: 'boutique-maria', userId: u1.id, template: 'minimal', category: 'ropa' } })
    const items1 = [
      { name: 'Vestido Floral Primavera', desc: 'Vestido floral perfecto para la primavera.', price: 120, url: 'https://placehold.co/600x800/e8d5e8/333?text=Vestido+Floral' },
      { name: 'Blazer Oversize Negro', desc: 'Blazer oversize negro.', price: 180, originalPrice: 220, url: 'https://placehold.co/600x800/222/fff?text=Blazer' },
      { name: 'Pantalón Wide Leg', desc: 'Pantalón wide leg de corte alto.', price: 95, url: 'https://placehold.co/600x800/f5f0eb/333?text=Pantalon' },
      { name: 'Camiseta Básica Blanca', desc: 'Camiseta 100% algodón.', price: 45, url: 'https://placehold.co/600x800/fff/333?text=Camiseta' },
    ]
    for (let i = 0; i < items1.length; i++) {
      const item = items1[i]
      const prod = await db.product.create({ data: { name: item.name, description: item.desc, price: item.price, originalPrice: item.originalPrice || null, storeId: s1.id, isFeatured: i < 2, order: i } })
      await db.storeImage.create({ data: { url: item.url, alt: item.name, productId: prod.id, isPrimary: true } })
    }

    // Demo 2: Sabor - Restaurante (Pro)
    const u2 = await db.user.create({ data: { email: 'carlos@restaurante.com', password: '123456', name: 'Carlos López', plan: 'pro' } })
    const s2 = await db.store.create({ data: { name: 'Sabor Peruano', slug: 'sabor-peruano', userId: u2.id, template: 'sabor', category: 'restaurante', whatsapp: '51999999991' } })
    const items2 = [
      { name: 'Lomo Saltado', desc: 'Lomo saltado con arroz y papas fritas.', price: 32, url: 'https://placehold.co/600x400/ff6b35/fff?text=Lomo+Saltado' },
      { name: 'Ceviche Clásico', desc: 'Ceviche de pescado fresco.', price: 28, url: 'https://placehold.co/600x400/f4a261/fff?text=Ceviche' },
      { name: 'Arroz con Pollo', desc: 'Arroz con pollo casero.', price: 22, url: 'https://placehold.co/600x400/e9c46a/333?text=Arroz+con+Pollo' },
      { name: 'Pisco Sour', desc: 'Pisco sour tradicional.', price: 18, url: 'https://placehold.co/600x400/264653/fff?text=Pisco+Sour' },
      { name: 'Chicha Morada', desc: 'Chicha morada refrescante.', price: 8, url: 'https://placehold.co/600x400/780000/fff?text=Chicha+Morada' },
    ]
    for (let i = 0; i < items2.length; i++) {
      const item = items2[i]
      const prod = await db.product.create({ data: { name: item.name, description: item.desc, price: item.price, storeId: s2.id, isFeatured: i < 2, order: i } })
      await db.storeImage.create({ data: { url: item.url, alt: item.name, productId: prod.id, isPrimary: true } })
    }

    // Demo 3: Elegance - Joyería (Premium)
    const u3 = await db.user.create({ data: { email: 'ana@joyas.com', password: '123456', name: 'Ana Torres', plan: 'premium' } })
    const s3 = await db.store.create({ data: { name: 'Joyas Elegance', slug: 'joyas-elegance', userId: u3.id, template: 'elegance', category: 'joyeria', whatsapp: '51999999992' } })
    const items3 = [
      { name: 'Collar Oro 18K', desc: 'Collar de oro 18 quilates con diseño exclusivo.', price: 2800, url: 'https://placehold.co/600x800/0a0a0a/c8a456?text=Collar+Oro' },
      { name: 'Anillo Diamante', desc: 'Anillo con diamante natural certificado.', price: 5500, originalPrice: 6200, url: 'https://placehold.co/600x800/1a1a2e/c8a456?text=Anillo' },
      { name: 'Pulsera Plata', desc: 'Pulsera de plata 925 artesanal.', price: 450, url: 'https://placehold.co/600x800/222/e8d5a3?text=Pulsera' },
    ]
    for (let i = 0; i < items3.length; i++) {
      const item = items3[i]
      const prod = await db.product.create({ data: { name: item.name, description: item.desc, price: item.price, originalPrice: item.originalPrice || null, storeId: s3.id, isFeatured: i < 2, order: i } })
      await db.storeImage.create({ data: { url: item.url, alt: item.name, productId: prod.id, isPrimary: true } })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos creada con éxito', 
      users: 4,
      stores: 3, 
      products: 12,
      admin: { email: 'admin@tienda.com', password: 'admin123' },
      demoUsers: [
        { email: 'maria@boutique.com', password: '123456', plan: 'free' },
        { email: 'carlos@restaurante.com', password: '123456', plan: 'pro' },
        { email: 'ana@joyas.com', password: '123456', plan: 'premium' },
      ]
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json({ error: 'Error al crear datos', details: msg }, { status: 500 })
  }
}
