import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await db.storeImage.deleteMany()
    await db.product.deleteMany()
    await db.store.deleteMany()
    await db.user.deleteMany()

    // Super Admin
    await db.user.create({ data: { email: 'admin@tienda.com', password: 'admin123', name: 'Super Admin', role: 'admin', plan: 'premium' } })

    // Demo store 1: MINIMAL - Ropa
    const u1 = await db.user.create({ data: { email: 'maria@boutique.com', password: '123', name: 'María García', plan: 'free' } })
    const s1 = await db.store.create({ data: { name: 'Boutique María', slug: 'boutique-maria-' + Date.now().toString(36), userId: u1.id, template: 'minimal', category: 'ropa' } })

    const p1 = await db.product.create({ data: { name: 'Vestido Floral Primavera', description: 'Vestido floral perfecto para la primavera.', price: 120, storeId: s1.id, isFeatured: true, order: 0 } })
    await db.storeImage.create({ data: { url: 'https://placehold.co/600x800/e8d5e8/333?text=Vestido+Floral', alt: 'Vestido', productId: p1.id, isPrimary: true } })
    const p2 = await db.product.create({ data: { name: 'Blazer Oversize Negro', description: 'Blazer oversize negro.', price: 180, originalPrice: 220, storeId: s1.id, isFeatured: true, order: 1 } })
    await db.storeImage.create({ data: { url: 'https://placehold.co/600x800/222/fff?text=Blazer', alt: 'Blazer', productId: p2.id, isPrimary: true } })
    const p3 = await db.product.create({ data: { name: 'Pantalón Wide Leg', description: 'Pantalón wide leg de corte alto.', price: 95, storeId: s1.id, order: 2 } })
    await db.storeImage.create({ data: { url: 'https://placehold.co/600x800/f5f0eb/333?text=Pantalon', alt: 'Pantalón', productId: p3.id, isPrimary: true } })
    const p4 = await db.product.create({ data: { name: 'Camiseta Básica Blanca', description: 'Camiseta 100% algodón.', price: 45, storeId: s1.id, order: 3 } })
    await db.storeImage.create({ data: { url: 'https://placehold.co/600x800/fff/333?text=Camiseta', alt: 'Camiseta', productId: p4.id, isPrimary: true } })

    // Demo store 2: SABOR - Restaurante
    const u2 = await db.user.create({ data: { email: 'carlos@restaurante.com', password: '123', name: 'Carlos López', plan: 'pro' } })
    const s2 = await db.store.create({ data: { name: 'Sabor Peruano', slug: 'sabor-peruano-' + Date.now().toString(36), userId: u2.id, template: 'sabor', category: 'restaurante', whatsapp: '51999999991' } })

    const items2 = [
      { name: 'Lomo Saltado', desc: 'Lomo saltado con arroz y papas fritas.', price: 32, featured: true, url: 'https://placehold.co/600x400/ff6b35/fff?text=Lomo+Saltado' },
      { name: 'Ceviche Clásico', desc: 'Ceviche de pescado fresco.', price: 28, featured: true, url: 'https://placehold.co/600x400/f4a261/fff?text=Ceviche' },
      { name: 'Arroz con Pollo', desc: 'Arroz con pollo casero.', price: 22, featured: false, url: 'https://placehold.co/600x400/e9c46a/333?text=Arroz+con+Pollo' },
      { name: 'Pisco Sour', desc: 'Pisco sour tradicional.', price: 18, featured: true, url: 'https://placehold.co/600x400/264653/fff?text=Pisco+Sour' },
      { name: 'Chicha Morada', desc: 'Chicha morada refrescante.', price: 8, featured: false, url: 'https://placehold.co/600x400/780000/fff?text=Chicha+Morada' },
    ]
    for (let i = 0; i < items2.length; i++) {
      const item = items2[i]
      const prod = await db.product.create({ data: { name: item.name, description: item.desc, price: item.price, storeId: s2.id, isFeatured: item.featured, order: i } })
      await db.storeImage.create({ data: { url: item.url, alt: item.name, productId: prod.id, isPrimary: true } })
    }

    // Demo store 3: ELEGANCE - Joyería
    const u3 = await db.user.create({ data: { email: 'ana@joyas.com', password: '123', name: 'Ana Torres', plan: 'premium' } })
    const s3 = await db.store.create({ data: { name: 'Joyas Elegance', slug: 'joyas-elegance-' + Date.now().toString(36), userId: u3.id, template: 'elegance', category: 'joyeria', whatsapp: '51999999992' } })

    const items3 = [
      { name: 'Collar Oro 18K', desc: 'Collar de oro 18 quilates con diseño exclusivo.', price: 2800, featured: true, url: 'https://placehold.co/600x800/0a0a0a/c8a456?text=Collar+Oro' },
      { name: 'Anillo Diamante', desc: 'Anillo con diamante natural certificado.', price: 5500, featured: true, originalPrice: 6200, url: 'https://placehold.co/600x800/1a1a2e/c8a456?text=Anillo' },
      { name: 'Pulsera Plata', desc: 'Pulsera de plata 925 artesanal.', price: 450, featured: false, url: 'https://placehold.co/600x800/222/e8d5a3?text=Pulsera' },
    ]
    for (let i = 0; i < items3.length; i++) {
      const item = items3[i]
      const prod = await db.product.create({ data: { name: item.name, description: item.desc, price: item.price, originalPrice: item.originalPrice || null, storeId: s3.id, isFeatured: item.featured, order: i } })
      await db.storeImage.create({ data: { url: item.url, alt: item.name, productId: prod.id, isPrimary: true } })
    }

    return NextResponse.json({ success: true, message: '3 tiendas demo + admin creados', stores: 3, products: 12, admin: { email: 'admin@tienda.com', password: 'admin123' } })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
