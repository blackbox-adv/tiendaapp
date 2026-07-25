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
      bannerUrl: '/demo/moderna-banner.jpg',
      whatsappNumber: '+51999888777',
      category: 'moda',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-vibrante',
      name: 'Tienda Vibrante',
      description: 'Una tienda llena de color y energía. Ideal para productos artesanales y creativos.',
      template: 'vibrante',
      logo: '/demo/vibrante-logo.png',
      bannerUrl: '/demo/vibrante-banner.jpg',
      whatsappNumber: '+51999888778',
      category: 'artesanias',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-clasica',
      name: 'Tienda Clásica',
      description: 'Un diseño clásico y atemporal. Perfecta para productos gourmet y delicatessen.',
      template: 'clasica',
      logo: '/demo/clasica-logo.png',
      bannerUrl: '/demo/clasica-banner.jpg',
      whatsappNumber: '+51999888779',
      category: 'gourmet',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-luxury',
      name: 'Tienda Luxury',
      description: 'Elegancia y sofisticación en cada detalle. Para marcas premium y exclusivas.',
      template: 'luxury',
      logo: '/demo/luxury-logo.png',
      bannerUrl: '/demo/luxury-banner.jpg',
      whatsappNumber: '+51999888780',
      category: 'premium',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-minimalist',
      name: 'Tienda Minimalista',
      description: 'Menos es más. Un diseño minimalista que destaca tus productos.',
      template: 'minimalist',
      logo: '/demo/minimalist-logo.png',
      bannerUrl: '/demo/minimalist-banner.jpg',
      whatsappNumber: '+51999888781',
      category: 'tech',
      isDemo: true,
      ownerId: 'demo-owner',
    },
  ];

  // Create demo owner user first
  const existingOwner = await db.user.findUnique({ where: { email: 'demo@tiendapp.pe' } });
  let ownerId: string;
  
  if (!existingOwner) {
    const owner = await db.user.create({
      data: {
        name: 'Demo Owner',
        email: 'demo@tiendapp.pe',
        password: '$2a$12$DEMOPASSWORDNOTFORPRODUCTION',
        role: 'store_owner',
        onboardingDone: true,
      },
    });
    ownerId = owner.id;
  } else {
    ownerId = existingOwner.id;
  }

  // Update templates with actual ownerId
  const storeData = templates.map(t => ({ ...t, ownerId }));

  for (const data of storeData) {
    const existing = await db.store.findUnique({ where: { slug: data.slug } });
    if (existing) {
      console.log(`Store ${data.slug} already exists, skipping...`);
      continue;
    }

    const store = await db.store.create({ data });

    // Create categories for each store
    const categories = [
      { name: 'Productos Destacados', icon: 'star', storeId: store.id },
      { name: 'Novedades', icon: 'sparkles', storeId: store.id },
      { name: 'Más Vendidos', icon: 'trending-up', storeId: store.id },
    ];

    for (const cat of categories) {
      await db.category.create({ data: cat });
    }

    // Create products for each store using StoreProduct model
    const products = [
      { name: 'Producto Destacado 1', description: 'Un producto increíble que no puedes dejar pasar.', price: 59.99, imageUrl: '/demo/product-1.jpg', category: 'Productos Destacados', storeId: store.id },
      { name: 'Producto Destacado 2', description: 'Calidad premium a un precio accesible.', price: 89.99, imageUrl: '/demo/product-2.jpg', category: 'Productos Destacados', storeId: store.id },
      { name: 'Producto Nuevo 1', description: 'Lo último en tendencias, recién llegado.', price: 45.00, imageUrl: '/demo/product-3.jpg', category: 'Novedades', storeId: store.id },
      { name: 'Producto Nuevo 2', description: 'Innovación y estilo en un solo producto.', price: 75.00, imageUrl: '/demo/product-4.jpg', category: 'Novedades', storeId: store.id },
      { name: 'Best Seller 1', description: 'El favorito de nuestros clientes.', price: 39.99, imageUrl: '/demo/product-5.jpg', category: 'Más Vendidos', storeId: store.id },
      { name: 'Best Seller 2', description: 'Un clásico que nunca pasa de moda.', price: 64.99, imageUrl: '/demo/product-6.jpg', category: 'Más Vendidos', storeId: store.id },
    ];

    for (const prod of products) {
      await db.storeProduct.create({ data: prod });
    }

    console.log(`Created store: ${store.slug} with categories and products`);
  }

  console.log('Seed completed!');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
