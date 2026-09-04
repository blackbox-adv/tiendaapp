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
  image?: string
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
      { name: 'Arroz Extra Superior 5kg', price: 24.9, image: '/sample-products/arroz-5kg.jpg' },
      { name: 'Aceite Vegetal 1L', price: 9.9, image: '/sample-products/aceite-vegetal-1l.jpg' },
      { name: 'Azúcar Rubia 1kg', price: 4.5, image: '/sample-products/azucar-rubia-1kg.jpg' },
      { name: 'Fideos Spaghetti 1kg', price: 5.2, image: '/sample-products/fideos-spaghetti-1kg.jpg' },
      { name: 'Leche Evaporada 400g', price: 3.8, image: '/sample-products/leche-evaporada-400g.jpg' },
      { name: 'Atún en Agua 170g', price: 6.9, image: '/sample-products/atun-en-agua-170g.jpg' },
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
      { name: 'Menú del Día', price: 15.0, image: '/sample-products/menu-del-dia.jpg' },
      { name: 'Pollo a la Brasa Entero', price: 38.0, image: '/sample-products/pollo-a-la-brasa.jpg' },
      { name: '1/4 de Pollo con Papas', price: 14.0, image: '/sample-products/cuarto-pollo-papas.jpg' },
      { name: 'Ceviche Fresco', price: 22.0, image: '/sample-products/ceviche-fresco.jpg' },
      { name: 'Chicha Morada (Jarra)', price: 10.0, image: '/sample-products/chicha-morada-jarra.jpg' },
      { name: 'Refresco Personal', price: 4.0, image: '/sample-products/refresco-personal.jpg' },
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
      { name: 'Pan Francés (Docena)', price: 8.0, image: '/sample-products/pan-frances-docena.jpg' },
      { name: 'Torta de Chocolate (Porción)', price: 6.5, image: '/sample-products/torta-chocolate-porcion.jpg' },
      { name: 'Empanada de Pollo', price: 4.0, image: '/sample-products/empanada-pollo.jpg' },
      { name: 'Bocaditos Surtidos (Kg)', price: 28.0, image: '/sample-products/bocaditos-surtidos-kg.jpg' },
      { name: 'Cheesecake (Porción)', price: 7.5, image: '/sample-products/cheesecake-porcion.jpg' },
      { name: 'Café con Leche', price: 5.0, image: '/sample-products/cafe-con-leche.jpg' },
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
      { name: 'Paracetamol 500mg (Caja)', price: 2.5, image: '/sample-products/paracetamol-500mg.jpg' },
      { name: 'Ibuprofeno 400mg (Caja)', price: 5.9, image: '/sample-products/ibuprofeno-400mg.jpg' },
      { name: 'Vitamina C 1g (Tabletas)', price: 15.0, image: '/sample-products/vitamina-c-1g.jpg' },
      { name: 'Alcohol en Gel 250ml', price: 8.5, image: '/sample-products/alcohol-en-gel-250ml.jpg' },
      { name: 'Pañuelos Descartables x10', price: 10.0, image: '/sample-products/panuelos-descartables.jpg' },
      { name: 'Jarabe para la Tos 120ml', price: 12.9, image: '/sample-products/jarabe-tos-120ml.jpg' },
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
      { name: 'Taladro Percutor 650W', price: 149.0, image: '/sample-products/taladro-percutor-650w.jpg' },
      { name: 'Juego de Destornilladores x12', price: 25.0, image: '/sample-products/destornilladores-x12.jpg' },
      { name: 'Martillo de Uña', price: 18.0, image: '/sample-products/martillo-una.jpg' },
      { name: 'Clavos 2" (Kg)', price: 7.5, image: '/sample-products/clavos-2kg.jpg' },
      { name: 'Látex Blanco 1 Galón', price: 65.0, image: '/sample-products/latex-blanco-galon.jpg' },
      { name: 'Cinta de Medir 5m', price: 12.0, image: '/sample-products/cinta-medir-5m.jpg' },
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
      { name: 'Rosas Rojas x12', price: 45.0, image: '/sample-products/rosas-rojas-x12.jpg' },
      { name: 'Ramo de Girasoles', price: 38.0, image: '/sample-products/ramo-girasoles.jpg' },
      { name: 'Peluche Mediano 40cm', price: 35.0, image: '/sample-products/peluche-mediano-40cm.jpg' },
      { name: 'Caja de Chocolates', price: 29.9, image: '/sample-products/caja-chocolates.jpg' },
      { name: 'Globo con Helio', price: 15.0, image: '/sample-products/globo-helio.jpg' },
      { name: 'Tarjeta con Dedicatoria', price: 5.0, image: '/sample-products/tarjeta-dedicatoria.jpg' },
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
      { name: 'Funda Antigolpes', price: 15.0, image: '/sample-products/funda-antigolpes.jpg' },
      { name: 'Vidrio Templado', price: 10.0, image: '/sample-products/vidrio-templado.jpg' },
      { name: 'Cargador Rápido 20W', price: 35.0, image: '/sample-products/cargador-rapido-20w.jpg' },
      { name: 'Audífonos Bluetooth', price: 45.0, image: '/sample-products/audifonos-bluetooth-wireless.jpg' },
      { name: 'Cable USB-C Reforzado', price: 12.0, image: '/sample-products/cable-usb-c-reforzado.jpg' },
      { name: 'Power Bank 10000mAh', price: 65.0, image: '/sample-products/power-bank-10000.jpg' },
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
      { name: 'Polo Básico Algodón', price: 19.9, image: '/sample-products/polo-basico-algodon.jpg' },
      { name: 'Jean Unisex', price: 59.9, image: '/sample-products/jean-unisex.jpg' },
      { name: 'Casaca de Jean', price: 89.9, image: '/sample-products/casaca-jean.jpg' },
      { name: 'Vestido de Verano', price: 79.9, image: '/sample-products/vestido-verano-rosado.jpg' },
      { name: 'Chompa Tejida', price: 49.9, image: '/sample-products/chompa-tejida.jpg' },
      { name: 'Pijama de Algodón', price: 39.9, image: '/sample-products/pijama-algodon.jpg' },
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
      { name: 'Collar Artesanal', price: 25.0, image: '/sample-products/collar-artesanal.jpg' },
      { name: 'Aretes Plateados', price: 15.0, image: '/sample-products/aretes-plateados.jpg' },
      { name: 'Pulsera Tejida a Mano', price: 10.0, image: '/sample-products/pulsera-tejida-mano.jpg' },
      { name: 'Bolso de Mano', price: 59.9, image: '/sample-products/bolso-mano.jpg' },
      { name: 'Reloj Clásico', price: 79.0, image: '/sample-products/reloj-clasico.jpg' },
      { name: 'Lentes de Sol UV400', price: 29.9, image: '/sample-products/lentes-sol-uv400.jpg' },
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
      { name: 'Parlante Bluetooth Portátil', price: 89.0, image: '/sample-products/parlante-bluetooth-portatil.jpg' },
      { name: 'Audífonos con Micrófono', price: 35.0, image: '/sample-products/audifonos-microfono.jpg' },
      { name: 'Teclado y Mouse Inalámbricos', price: 75.0, image: '/sample-products/teclado-mouse-inalambrico.jpg' },
      { name: 'Lámpara LED 12W', price: 9.9, image: '/sample-products/lampara-led-12w.jpg' },
      { name: 'Extensionista 4 Tomacorrientes', price: 18.0, image: '/sample-products/extensionista-4t.jpg' },
      { name: 'Smartwatch Básico', price: 99.0, image: '/sample-products/smartwatch-basico.jpg' },
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
      { name: 'Juego de Sartenes Antiadherentes', price: 79.9, image: '/sample-products/sartenes-antiadherentes.jpg' },
      { name: 'Set de Vasos x6', price: 24.9, image: '/sample-products/vasos-x6.jpg' },
      { name: 'Cojín Decorativo', price: 19.9, image: '/sample-products/cojin-decorativo.jpg' },
      { name: 'Cortina 2 metros', price: 39.9, image: '/sample-products/cortina-2m.jpg' },
      { name: 'Edredón Matrimonial', price: 129.0, image: '/sample-products/edredon-matrimonial.jpg' },
      { name: 'Toalla de Baño', price: 25.0, image: '/sample-products/toalla-bano.jpg' },
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
      { name: 'Labial Mate Larga Duración', price: 18.0, image: '/sample-products/labial-mate.jpg' },
      { name: 'Base de Maquillaje', price: 35.0, image: '/sample-products/base-maquillaje.jpg' },
      { name: 'Perfume Femenino 100ml', price: 89.9, image: '/sample-products/perfume-femenino-100ml.jpg' },
      { name: 'Crema Hidratante Facial', price: 28.0, image: '/sample-products/crema-hidratante.jpg' },
      { name: 'Set de Brochas x12', price: 32.0, image: '/sample-products/brochas-x12.jpg' },
      { name: 'Esmaltes Pack x2', price: 14.0, image: '/sample-products/esmaltes-pack-x2.jpg' },
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
      { name: 'Balón de Fútbol N°5', price: 59.9, image: '/sample-products/balon-futbol-5.jpg' },
      { name: 'Mancuernas 5kg (Par)', price: 49.9, image: '/sample-products/mancuernas-5kg-par.jpg' },
      { name: 'Guantes de Gimnasio', price: 25.0, image: '/sample-products/guantes-gimnasio.jpg' },
      { name: 'Polo Deportivo Dry Fit', price: 29.9, image: '/sample-products/polo-dry-fit.jpg' },
      { name: 'Zapatillas Running', price: 139.0, image: '/sample-products/zapatillas-running.jpg' },
      { name: 'Botella Deportiva 750ml', price: 15.0, image: '/sample-products/botella-deportiva-750ml.jpg' },
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
      { name: 'Arroz Extra 5kg', price: 24.9, image: '/sample-products/arroz-5kg.jpg' },
      { name: 'Aceite Vegetal 1L', price: 9.9, image: '/sample-products/aceite-vegetal-1l.jpg' },
      { name: 'Quinua Orgánica 1kg', price: 12.0, image: '/sample-products/quinua-organica-1kg.jpg' },
      { name: 'Miel de Abeja 500g', price: 18.0, image: '/sample-products/miel-abeja-500g.jpg' },
      { name: 'Avena en Hojuelas 1kg', price: 7.5, image: '/sample-products/avena-hojuelas-1kg.jpg' },
      { name: 'Café Molido 500g', price: 19.9, image: '/sample-products/cafe-molido-500g.jpg' },
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
      { name: 'Muñeca Fashion', price: 35.0, image: '/sample-products/muneca-fashion.jpg' },
      { name: 'Auto a Control Remoto', price: 59.9, image: '/sample-products/auto-control-remoto.jpg' },
      { name: 'Rompecabezas 500 Piezas', price: 25.0, image: '/sample-products/rompecabezas-500.jpg' },
      { name: 'Set de Bloques 200 pcs', price: 45.0, image: '/sample-products/bloques-200pcs.jpg' },
      { name: 'Peluche Grande 60cm', price: 49.9, image: '/sample-products/peluche-grande-60cm.jpg' },
      { name: 'Juego de Mesa Familiar', price: 29.9, image: '/sample-products/juego-mesa-familiar.jpg' },
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
      { name: 'Producto Destacado', price: 29.9, image: '/sample-products/producto-destacado.jpg' },
      { name: 'Combo Especial', price: 49.9, image: '/sample-products/combo-especial.jpg' },
      { name: 'Pack Familiar', price: 39.9, image: '/sample-products/pack-familiar.jpg' },
      { name: 'Oferta del Día', price: 19.9, image: '/sample-products/oferta-del-dia.jpg' },
      { name: 'Artículo Básico', price: 9.9, image: '/sample-products/articulo-basico.jpg' },
      { name: 'Promo 2x1', price: 24.9, image: '/sample-products/promo-2x1.jpg' },
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
