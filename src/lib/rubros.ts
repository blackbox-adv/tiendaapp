// ============================================================
// RUBROS DE TIENDA — presets por giro de negocio (Perú).
// Cada rubro define: colores de marca, descripción sugerida
// y productos de ejemplo para que la tienda nunca se vea vacía.
// Usado por el wizard de onboarding y por el banner de la
// dashboard cuando la tienda no tiene productos.
// ============================================================

export interface RubroProduct {
  name: string
  price: number
}

export interface RubroPreset {
  id: string
  name: string
  emoji: string
  primary: string
  secondary: string
  description: string
  products: RubroProduct[]
}

export const RUBROS: RubroPreset[] = [
  {
    id: 'bodega',
    name: 'Bodega / Abarrotes',
    emoji: '🏪',
    primary: '#DC2626',
    secondary: '#F59E0B',
    description: 'Tu bodega de barrio ahora online. Pide por WhatsApp y te lo llevamos.',
    products: [
      { name: 'Arroz Extra Superior 5kg', price: 24.9 },
      { name: 'Aceite Vegetal 1L', price: 9.9 },
      { name: 'Azúcar Rubia 1kg', price: 4.5 },
      { name: 'Fideos Spaghetti 1kg', price: 5.2 },
      { name: 'Leche Evaporada 400g', price: 3.8 },
      { name: 'Atún en Agua 170g', price: 6.9 },
    ],
  },
  {
    id: 'restaurante',
    name: 'Restaurante / Menú',
    emoji: '🍗',
    primary: '#EA580C',
    secondary: '#FBBF24',
    description: 'Pide tu comida favorita por WhatsApp. Delivery rápido y rico.',
    products: [
      { name: 'Menú del Día', price: 15.0 },
      { name: 'Pollo a la Brasa Entero', price: 38.0 },
      { name: '1/4 de Pollo con Papas', price: 14.0 },
      { name: 'Ceviche Fresco', price: 22.0 },
      { name: 'Chicha Morada (Jarra)', price: 10.0 },
      { name: 'Refresco Personal', price: 4.0 },
    ],
  },
  {
    id: 'panaderia',
    name: 'Panadería / Pastelería',
    emoji: '🥖',
    primary: '#B45309',
    secondary: '#FCD34D',
    description: 'Pan y dulces recién horneados todos los días. Encarga el tuyo.',
    products: [
      { name: 'Pan Francés (Docena)', price: 8.0 },
      { name: 'Torta de Chocolate (Porción)', price: 6.5 },
      { name: 'Empanada de Pollo', price: 4.0 },
      { name: 'Bocaditos Surtidos (Kg)', price: 28.0 },
      { name: 'Cheesecake (Porción)', price: 7.5 },
      { name: 'Café con Leche', price: 5.0 },
    ],
  },
  {
    id: 'farmacia',
    name: 'Farmacia / Botica',
    emoji: '💊',
    primary: '#059669',
    secondary: '#6EE7B7',
    description: 'Tus medicamentos y productos de salud a un mensaje de distancia.',
    products: [
      { name: 'Paracetamol 500mg (Caja)', price: 2.5 },
      { name: 'Ibuprofeno 400mg (Caja)', price: 5.9 },
      { name: 'Vitamina C 1g (Tabletas)', price: 15.0 },
      { name: 'Alcohol en Gel 250ml', price: 8.5 },
      { name: 'Pañuelos Descartables x10', price: 10.0 },
      { name: 'Jarabe para la Tos 120ml', price: 12.9 },
    ],
  },
  {
    id: 'ferreteria',
    name: 'Ferretería',
    emoji: '🔧',
    primary: '#9A3412',
    secondary: '#FBBF24',
    description: 'Herramientas y materiales para tu obra o casa. ¡Cotiza por WhatsApp!',
    products: [
      { name: 'Taladro Percutor 650W', price: 149.0 },
      { name: 'Juego de Destornilladores x12', price: 25.0 },
      { name: 'Martillo de Uña', price: 18.0 },
      { name: 'Clavos 2" (Kg)', price: 7.5 },
      { name: 'Látex Blanco 1 Galón', price: 65.0 },
      { name: 'Cinta de Medir 5m', price: 12.0 },
    ],
  },
  {
    id: 'flores',
    name: 'Flores y Regalos',
    emoji: '🌹',
    primary: '#E11D48',
    secondary: '#FDA4AF',
    description: 'Detalles que enamoran: flores, peluches y regalos para cada ocasión.',
    products: [
      { name: 'Rosas Rojas x12', price: 45.0 },
      { name: 'Ramo de Girasoles', price: 38.0 },
      { name: 'Peluche Mediano 40cm', price: 35.0 },
      { name: 'Caja de Chocolates', price: 29.9 },
      { name: 'Globo con Helio', price: 15.0 },
      { name: 'Tarjeta con Dedicatoria', price: 5.0 },
    ],
  },
  {
    id: 'celulares',
    name: 'Celulares y Tech',
    emoji: '📱',
    primary: '#2563EB',
    secondary: '#93C5FD',
    description: 'Accesorios y repuestos para tu celular. Calidad garantizada.',
    products: [
      { name: 'Funda Antigolpes', price: 15.0 },
      { name: 'Vidrio Templado', price: 10.0 },
      { name: 'Cargador Rápido 20W', price: 35.0 },
      { name: 'Audífonos Bluetooth', price: 45.0 },
      { name: 'Cable USB-C Reforzado', price: 12.0 },
      { name: 'Power Bank 10000mAh', price: 65.0 },
    ],
  },
  {
    id: 'ropa',
    name: 'Ropa / Boutique',
    emoji: '👕',
    primary: '#DB2777',
    secondary: '#F9A8D4',
    description: 'Ropa de moda para toda la familia. Pregunta tallas por WhatsApp.',
    products: [
      { name: 'Polo Básico Algodón', price: 19.9 },
      { name: 'Jean Unisex', price: 59.9 },
      { name: 'Casaca de Jean', price: 89.9 },
      { name: 'Vestido de Verano', price: 79.9 },
      { name: 'Chompa Tejida', price: 49.9 },
      { name: 'Pijama de Algodón', price: 39.9 },
    ],
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    emoji: '💎',
    primary: '#A21CAF',
    secondary: '#E879F9',
    description: 'Accesorios únicos para tu estilo diario.',
    products: [
      { name: 'Collar Artesanal', price: 25.0 },
      { name: 'Aretes Plateados', price: 15.0 },
      { name: 'Pulsera Tejida a Mano', price: 10.0 },
      { name: 'Bolso de Mano', price: 59.9 },
      { name: 'Reloj Clásico', price: 79.0 },
      { name: 'Lentes de Sol UV400', price: 29.9 },
    ],
  },
  {
    id: 'electronica',
    name: 'Electrónica',
    emoji: '🎧',
    primary: '#4F46E5',
    secondary: '#818CF8',
    description: 'Tecnología al mejor precio, con garantía y soporte.',
    products: [
      { name: 'Parlante Bluetooth Portátil', price: 89.0 },
      { name: 'Audífonos con Micrófono', price: 35.0 },
      { name: 'Teclado y Mouse Inalámbricos', price: 75.0 },
      { name: 'Lámpara LED 12W', price: 9.9 },
      { name: 'Extensionista 4 Tomacorrientes', price: 18.0 },
      { name: 'Smartwatch Básico', price: 99.0 },
    ],
  },
  {
    id: 'hogar',
    name: 'Hogar y Cocina',
    emoji: '🏠',
    primary: '#0D9488',
    secondary: '#5EEAD4',
    description: 'Todo para tu casa: cocina, decoración y comodidad.',
    products: [
      { name: 'Juego de Sartenes Antiadherentes', price: 79.9 },
      { name: 'Set de Vasos x6', price: 24.9 },
      { name: 'Cojín Decorativo', price: 19.9 },
      { name: 'Cortina 2 metros', price: 39.9 },
      { name: 'Edredón Matrimonial', price: 129.0 },
      { name: 'Toalla de Baño', price: 25.0 },
    ],
  },
  {
    id: 'belleza',
    name: 'Belleza y Cuidado',
    emoji: '💄',
    primary: '#F43F5E',
    secondary: '#FDA4AF',
    description: 'Productos de belleza originales y al mejor precio.',
    products: [
      { name: 'Labial Mate Larga Duración', price: 18.0 },
      { name: 'Base de Maquillaje', price: 35.0 },
      { name: 'Perfume Femenino 100ml', price: 89.9 },
      { name: 'Crema Hidratante Facial', price: 28.0 },
      { name: 'Set de Brochas x12', price: 32.0 },
      { name: 'Esmaltes Pack x2', price: 14.0 },
    ],
  },
  {
    id: 'deportes',
    name: 'Deportes',
    emoji: '⚽',
    primary: '#16A34A',
    secondary: '#86EFAC',
    description: 'Equípate para tu deporte favorito.',
    products: [
      { name: 'Balón de Fútbol N°5', price: 59.9 },
      { name: 'Mancuernas 5kg (Par)', price: 49.9 },
      { name: 'Guantes de Gimnasio', price: 25.0 },
      { name: 'Polo Deportivo Dry Fit', price: 29.9 },
      { name: 'Zapatillas Running', price: 139.0 },
      { name: 'Botella Deportiva 750ml', price: 15.0 },
    ],
  },
  {
    id: 'alimentos',
    name: 'Alimentos',
    emoji: '🛒',
    primary: '#CA8A04',
    secondary: '#FDE047',
    description: 'Productos frescos y de calidad para tu familia.',
    products: [
      { name: 'Arroz Extra 5kg', price: 24.9 },
      { name: 'Aceite Vegetal 1L', price: 9.9 },
      { name: 'Quinua Orgánica 1kg', price: 12.0 },
      { name: 'Miel de Abeja 500g', price: 18.0 },
      { name: 'Avena en Hojuelas 1kg', price: 7.5 },
      { name: 'Café Molido 500g', price: 19.9 },
    ],
  },
  {
    id: 'juguetes',
    name: 'Juguetes y Niños',
    emoji: '🧸',
    primary: '#7C3AED',
    secondary: '#C4B5FD',
    description: 'La mejor variedad de juguetes para los peques del hogar.',
    products: [
      { name: 'Muñeca Fashion', price: 35.0 },
      { name: 'Auto a Control Remoto', price: 59.9 },
      { name: 'Rompecabezas 500 Piezas', price: 25.0 },
      { name: 'Set de Bloques 200 pcs', price: 45.0 },
      { name: 'Peluche Grande 60cm', price: 49.9 },
      { name: 'Juego de Mesa Familiar', price: 29.9 },
    ],
  },
  {
    id: 'otros',
    name: 'Otros / General',
    emoji: '🛍️',
    primary: '#7C3AED',
    secondary: '#A78BFA',
    description: 'Tu tienda online, abierta 24/7. Pide por WhatsApp.',
    products: [
      { name: 'Producto Destacado', price: 29.9 },
      { name: 'Combo Especial', price: 49.9 },
      { name: 'Pack Familiar', price: 39.9 },
      { name: 'Oferta del Día', price: 19.9 },
      { name: 'Artículo Básico', price: 9.9 },
      { name: 'Promo 2x1', price: 24.9 },
    ],
  },
]

const RUBRO_BY_ID: Record<string, RubroPreset> = Object.fromEntries(
  RUBROS.map((r) => [r.id, r])
)

// Categorías legacy del wizard anterior → rubro equivalente
const LEGACY_MAP: Record<string, string> = {
  general: 'otros',
  alimentos: 'alimentos',
}

export function getRubro(categoryId?: string | null): RubroPreset {
  const direct = categoryId ? RUBRO_BY_ID[categoryId] : undefined
  if (direct) return direct
  const legacy = categoryId ? LEGACY_MAP[categoryId] : undefined
  if (legacy) return RUBRO_BY_ID[legacy]
  return RUBRO_BY_ID.otros
}
