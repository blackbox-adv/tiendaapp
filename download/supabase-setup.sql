-- ============================================
-- Script SQL para ejecutar en Supabase
-- Ve a Supabase → SQL Editor → Pega esto → Run
-- ============================================

-- Categorías
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "originalPrice" DOUBLE PRECISION,
  "categoryId" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "dimensions" TEXT,
  "material" TEXT,
  "mattressId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Imágenes de productos
CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "productId" TEXT NOT NULL,
  CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Relación cama-colchón
ALTER TABLE "Product" ADD CONSTRAINT "Product_mattressId_fkey" FOREIGN KEY ("mattressId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Usuario admin
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Configuración del sitio
CREATE TABLE IF NOT EXISTS "SiteSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX IF NOT EXISTS "SiteSettings_key_idx" ON "SiteSettings"("key");

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Categorías
INSERT INTO "Category" ("id", "name", "slug", "order") VALUES
('cat-camas-001', 'Camas', 'camas', 1),
('cat-colchones-001', 'Colchones', 'colchones', 2)
ON CONFLICT ("slug") DO NOTHING;

-- Admin
INSERT INTO "AdminUser" ("id", "email", "password", "name") VALUES
('admin-001', 'admin@belen.com', 'admin123', 'Administrador Belén')
ON CONFLICT ("email") DO NOTHING;

-- Configuración del sitio
INSERT INTO "SiteSettings" ("id", "key", "value") VALUES
('set-1', 'whatsapp_number', '51999999999'),
('set-2', 'phone', '+51 (01) 234-5678'),
('set-3', 'email', 'ventas@distribuidorabelen.com'),
('set-4', 'address', 'Av. Principal #123, Lima, Perú'),
('set-5', 'business_hours', 'Lun-Sáb: 9:00 - 19:00'),
('set-6', 'whatsapp_message', 'Hola, estoy interesado/a en {product} de Distribuidora Belén'),
('set-7', 'currency_symbol', 'S/'),
('set-8', 'currency_code', 'PEN'),
('set-9', 'show_whatsapp_float', 'true')
ON CONFLICT ("key") DO NOTHING;

-- Colchones
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "isFeatured", "dimensions", "material") VALUES
('col-001', 'Colchón Apraiso Individual', 'colchon-apraiso-individual', 'Colchón Apraiso Individual con tecnología de resortes ensacados para máximo confort. Ideal para espacios reducidos, ofrece un soporte óptimo para una persona.', 3200, 'cat-colchones-001', false, '90 x 190 cm', 'Resortes ensacados'),
('col-002', 'Colchón Apraiso Matrimonial', 'colchon-apraiso-matrimonial', 'Colchón Apraiso Matrimonial con sistema de resortes bonnell de alta resistencia. Perfecto para parejas que buscan un equilibrio entre firmeza y confort.', 4800, 'cat-colchones-001', false, '135 x 190 cm', 'Resortes bonnell'),
('col-003', 'Colchón Apraiso Queen', 'colchon-apraiso-queen', 'Colchón Apraiso Queen Size con la más avanzada tecnología de resortes ensacados y capa de memory foam. Ofrece un soporte excepcional con sensación de flotación.', 5500, 'cat-colchones-001', true, '150 x 200 cm', 'Resortes ensacados + Memory Foam'),
('col-004', 'Colchón Apraiso King', 'colchon-apraiso-king', 'Colchón Apraiso King Size de lujo con triple capa de confort: memory foam, gel y resortes ensacados. La experiencia de descanso definitiva.', 6800, 'cat-colchones-001', true, '180 x 200 cm', 'Resortes ensacados + Memory Foam + Gel'),
('col-005', 'Colchón Apraiso King Premium', 'colchon-apraiso-king-premium', 'Colchón Apraiso King Premium ortopédico con tecnología de respuesta progresiva. Diseñado con capas de látex natural, memory foam de alta densidad y resortes reforzados.', 8500, 'cat-colchones-001', true, '180 x 200 cm', 'Látex + Memory Foam HD + Resortes reforzados'),
('col-006', 'Colchón Apraiso Queen Soft', 'colchon-apraiso-queen-soft', 'Colchón Apraiso Queen Soft con superficie plush ultra suave y base de resortes ensacados. La combinación perfecta de suavidad y soporte.', 5800, 'cat-colchones-001', false, '150 x 200 cm', 'Superficie plush + Resortes ensacados')
ON CONFLICT ("slug") DO NOTHING;

-- Camas (con relación a colchones)
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "originalPrice", "categoryId", "isFeatured", "dimensions", "material", "mattressId") VALUES
('bed-001', 'Cama Queen Clásica', 'cama-queen-clasica', 'Cama Queen Clásica de Distribuidora Belén fabricada en madera de pino con acabado natural. Diseño atemporal que combina elegancia y funcionalidad.', 8500, 9500, 'cat-camas-001', true, '160 x 210 cm (base)', 'Madera de pino', 'col-003'),
('bed-002', 'Cama King Imperial', 'cama-king-imperial', 'Cama King Imperial de Distribuidora Belén en madera de roble con cabecera tallada artesanalmente. Una pieza central para el dormitorio que transmite prestigio.', 12000, 13500, 'cat-camas-001', true, '200 x 210 cm (base)', 'Madera de roble', 'col-004'),
('bed-003', 'Cama Matrimonial Elegance', 'cama-matrimonial-elegance', 'Cama Matrimonial Elegance de Distribuidora Belén con estructura en MDF de alta densidad y acabado lacado blanco. Diseño limpio y moderno.', 7200, 8000, 'cat-camas-001', false, '145 x 200 cm (base)', 'MDF lacado', 'col-002'),
('bed-004', 'Cama Queen Moderna', 'cama-queen-moderna', 'Cama Queen Moderna de Distribuidora Belén en melamina con acabado gris carbón. Líneas rectas y minimalistas para un look contemporáneo.', 9800, 11000, 'cat-camas-001', false, '160 x 210 cm (base)', 'Melamina', 'col-006'),
('bed-005', 'Cama King Premium', 'cama-king-premium', 'Cama King Premium de Distribuidora Belén en madera sólida con cabecera acolchada en tela premium. El epitome del confort y la distinción.', 14500, 16000, 'cat-camas-001', true, '200 x 210 cm (base)', 'Madera sólida + Tapiz premium', 'col-005'),
('bed-006', 'Cama Individual Comfort', 'cama-individual-comfort', 'Cama Individual Comfort de Distribuidora Belén en madera de pino con diseño compacto y funcional. Perfecta para habitaciones juveniles.', 5500, 6200, 'cat-camas-001', false, '100 x 200 cm (base)', 'Madera de pino', 'col-001'),
('bed-007', 'Cama Queen Roma', 'cama-queen-roma', 'Cama Queen Roma de Distribuidora Belén con espectacular cabecera capitoné. Inspirada en el diseño italiano clásico con un toque contemporáneo.', 10200, 11500, 'cat-camas-001', true, '160 x 210 cm (base)', 'Estructura de madera + Cabecera capitoné', 'col-003'),
('bed-008', 'Cama King Luxe', 'cama-king-luxe', 'Cama King Luxe de Distribuidora Belén, nuestra pieza más exclusiva. Tapizado completo en tela de alta gama con detalles de costura artesanal.', 16000, 18000, 'cat-camas-001', true, '200 x 210 cm (base)', 'Tapizado premium + Estructura reforzada', 'col-005')
ON CONFLICT ("slug") DO NOTHING;

-- Imágenes de colchones
INSERT INTO "ProductImage" ("id", "url", "alt", "order", "isPrimary", "productId") VALUES
('img-col-1', '/uploads/colchon-individual.jpg', 'Colchón Apraiso Individual', 0, true, 'col-001'),
('img-col-2', '/uploads/colchon-matrimonial.jpg', 'Colchón Apraiso Matrimonial', 0, true, 'col-002'),
('img-col-3', '/uploads/colchon-queen.jpg', 'Colchón Apraiso Queen', 0, true, 'col-003'),
('img-col-4', '/uploads/colchon-king.jpg', 'Colchón Apraiso King', 0, true, 'col-004'),
('img-col-5', '/uploads/colchon-king-premium.jpg', 'Colchón Apraiso King Premium', 0, true, 'col-005'),
('img-col-6', '/uploads/colchon-queen-soft.jpg', 'Colchón Apraiso Queen Soft', 0, true, 'col-006');

-- Imágenes de camas
INSERT INTO "ProductImage" ("id", "url", "alt", "order", "isPrimary", "productId") VALUES
('img-bed-1', '/uploads/cama-queen-clasica.jpg', 'Cama Queen Clásica', 0, true, 'bed-001'),
('img-bed-2', '/uploads/cama-king-imperial.jpg', 'Cama King Imperial', 0, true, 'bed-002'),
('img-bed-3', '/uploads/cama-matrimonial-elegance.jpg', 'Cama Matrimonial Elegance', 0, true, 'bed-003'),
('img-bed-4', '/uploads/cama-queen-moderna.jpg', 'Cama Queen Moderna', 0, true, 'bed-004'),
('img-bed-5', '/uploads/cama-king-premium.jpg', 'Cama King Premium', 0, true, 'bed-005'),
('img-bed-6', '/uploads/cama-individual-comfort.jpg', 'Cama Individual Comfort', 0, true, 'bed-006'),
('img-bed-7', '/uploads/cama-queen-roma.jpg', 'Cama Queen Roma', 0, true, 'bed-007'),
('img-bed-8', '/uploads/cama-king-luxe.jpg', 'Cama King Luxe', 0, true, 'bed-008');

-- Habilitar RLS (Row Level Security) pero permitir acceso público a lectura
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;

-- Políticas: permitir leer productos y categorías sin autenticación
CREATE POLICY "Public read categories" ON "Category" FOR SELECT USING (true);
CREATE POLICY "Public read products" ON "Product" FOR SELECT USING (true);
CREATE POLICY "Public read product images" ON "ProductImage" FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON "SiteSettings" FOR SELECT USING (true);

-- Políticas admin: permitir todo con service_role (el backend usa DATABASE_URL directo)
CREATE POLICY "Service role all categories" ON "Category" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role all products" ON "Product" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role all images" ON "ProductImage" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role all settings" ON "SiteSettings" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role all admins" ON "AdminUser" FOR ALL USING (true) WITH CHECK (true);
