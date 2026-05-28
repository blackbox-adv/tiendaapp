import { db } from '../src/lib/db';

async function seed() {
  // Create demo stores for each template
  const templates = [
    {
      slug: 'demo-moderna',
      name: 'Tienda Moderna',
      description: 'Una tienda moderna con diseño limpio y elegante. Perfecta para moda y accesorios.',
      template: 'moderna',
      logo: '/demo/moderna-logo.png',
      banner: '/demo/moderna-banner.jpg',
      whatsapp: '+51999888777',
      email: 'moderna@tiendapp.pe',
      address: 'Lima, Perú',
      isDemo: true,
    },
    {
      slug: 'demo-vibrante',
      name: 'Tienda Vibrante',
      description: 'Una tienda llena de color y energía. Ideal para productos artesanales y creativos.',
      template: 'vibrante',
      logo: '/demo/vibrante-logo.png',
      banner: '/demo/vibrante-banner.jpg',
      whatsapp: '+51999888778',
      email: 'vibrante@tiendapp.pe',
      address: 'Cusco, Perú',
      isDemo: true,
    },
    {
      slug: 'demo-clasica',
      name: 'Tienda Clásica',
      description: 'Un diseño clásico y atemporal. Perfecta para productos gourmet y delicatessen.',
      template: 'clasica',
      logo: '/demo/clasica-logo.png',
      banner: '/demo/clasica-banner.jpg',
      whatsapp: '+51999888779',
      email: 'clasica@tiendapp.pe',
      address: 'Arequipa, Perú',
      isDemo: true,
    },
    {
      slug: 'demo-luxury',
      name: 'Tienda Luxury',
      description: 'Elegancia y sofisticación en cada detalle. Para marcas premium y exclusivas.',
      template: 'luxury',
      logo: '/demo/luxury-logo.png',
      banner: '/demo/luxury-banner.jpg',
      whatsapp: '+51999888780',
      email: 'luxury@tiendapp.pe',
      address: 'San Isidro, Lima, Perú',
      isDemo: true,
    },
    {
      slug: 'demo-minimalist',
      name: 'Tienda Minimalista',
      description: 'Menos es más. Un diseño minimalista que destaca tus productos.',
      template: 'minimalist',
      logo: '/demo/minimalist-logo.png',
      banner: '/demo/minimalist-banner.jpg',
      whatsapp: '+51999888781',
      email: 'minimalist@tiendapp.pe',
      address: 'Miraflores, Lima, Perú',
      isDemo: true,
    },
  ];

  for (const storeData of templates) {
    const existing = await db.store.findUnique({ where: { slug: storeData.slug } });
    if (existing) {
      console.log(`Store ${storeData.slug} already exists, skipping...`);
      continue;
    }

    const store = await db.store.create({ data: storeData });

    // Create categories for each store
    const categories = [
      { name: 'Productos Destacados', icon: 'star' },
      { name: 'Novedades', icon: 'sparkles' },
      { name: 'Más Vendidos', icon: 'trending-up' },
    ];

    for (const cat of categories) {
      await db.category.create({
        data: { name: cat.name, icon: cat.icon, storeId: store.id },
      });
    }

    // Create products for each store
    const products = [
      { name: 'Producto Destacado 1', description: 'Un producto increíble que no puedes dejar pasar.', price: 59.99, image: '/demo/product-1.jpg', category: 'Productos Destacados' },
      { name: 'Producto Destacado 2', description: 'Calidad premium a un precio accesible.', price: 89.99, image: '/demo/product-2.jpg', category: 'Productos Destacados' },
      { name: 'Producto Nuevo 1', description: 'Lo último en tendencias, recién llegado.', price: 45.00, image: '/demo/product-3.jpg', category: 'Novedades' },
      { name: 'Producto Nuevo 2', description: 'Innovación y estilo en un solo producto.', price: 75.00, image: '/demo/product-4.jpg', category: 'Novedades' },
      { name: 'Best Seller 1', description: 'El favorito de nuestros clientes.', price: 39.99, image: '/demo/product-5.jpg', category: 'Más Vendidos' },
      { name: 'Best Seller 2', description: 'Un clásico que nunca pasa de moda.', price: 64.99, image: '/demo/product-6.jpg', category: 'Más Vendidos' },
    ];

    for (const prod of products) {
      await db.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          image: prod.image,
          category: prod.category,
          storeId: store.id,
        },
      });
    }

    console.log(`Created store: ${store.slug} with categories and products`);
  }

  console.log('Seed completed!');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
