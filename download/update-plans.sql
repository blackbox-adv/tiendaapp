-- ================================================
-- TiendApp: Actualizar límites de planes
-- Free: 5 productos (era 10)
-- Pro: 20 productos (era 50), precio S/29.90
-- Premium: 100 productos (era 9999), precio S/59.90
-- ================================================

-- Plan Free
UPDATE "Plan"
SET
  "maxProducts" = 5,
  "price" = 0.00,
  "description" = 'Perfecto para comenzar tu tienda online',
  "features" = '["1 tienda online","5 productos maximo","Plantilla basica","WhatsApp integrado","Soporte por email"]'::jsonb
WHERE "type" = 'free';

-- Plan Pro
UPDATE "Plan"
SET
  "maxProducts" = 20,
  "price" = 29.90,
  "description" = 'Para tiendas en crecimiento',
  "features" = '["1 tienda online","20 productos maximo","Buscador de productos","Todas las plantillas","WhatsApp integrado","Estadisticas avanzadas","Soporte prioritario"]'::jsonb
WHERE "type" = 'pro';

-- Plan Premium
UPDATE "Plan"
SET
  "maxProducts" = 100,
  "price" = 59.90,
  "description" = 'La mejor experiencia para tu negocio',
  "features" = '["Hasta 3 tiendas online","100 productos maximo","Buscador y filtros avanzados","Todas las plantillas","Dominio personalizado","WhatsApp Business API","Soporte 24/7","Estadisticas avanzadas","API access"]'::jsonb
WHERE "type" = 'premium';
