'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ModernaTemplate } from '@/components/store-templates/ModernaTemplate'
import { VibranteTemplate } from '@/components/store-templates/VibranteTemplate'
import { ClasicaTemplate } from '@/components/store-templates/ClasicaTemplate'
import { LuxuryTemplate } from '@/components/store-templates/LuxuryTemplate'
import { MinimalistTemplate } from '@/components/store-templates/MinimalistTemplate'
import { BodegaTemplate } from '@/components/store-templates/BodegaTemplate'
import { SaborTemplate } from '@/components/store-templates/SaborTemplate'
import { ModaTemplate } from '@/components/store-templates/ModaTemplate'
import { VitrinaTemplate } from '@/components/store-templates/VitrinaTemplate'
import { NeonTemplate } from '@/components/store-templates/NeonTemplate'
import { BoutiqueTemplate } from '@/components/store-templates/BoutiqueTemplate'
import { EditorialTemplate } from '@/components/store-templates/EditorialTemplate'
import { AtelierTemplate } from '@/components/store-templates/AtelierTemplate'
import { TerracotaTemplate } from '@/components/store-templates/TerracotaTemplate'
import { ProductDetailView } from '@/components/store-templates/ProductDetailView'
import { ArrowLeft, Crown, Sparkles, Gem } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Store, Product } from '@/lib/types'

// ── Demo data matches the template preview images exactly ──

const demoStores: Record<string, Store> = {
  moderna: {
    id: 'demo-moderna',
    name: 'Mi Tienda',
    slug: 'demo-moderna',
    description: 'Moda y estilo para la temporada. Nuevas colecciones cada semana.',
    logo: '⚡',
    categoryId: 'ropa',
    planId: 'free',
    colors: { primary: '#7C3AED', secondary: '#10B981' },
    whatsappNumber: '+51999990003',
    template: 'moderna',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  vibrante: {
    id: 'demo-vibrante',
    name: 'La Tienda',
    slug: 'demo-vibrante',
    description: 'Streetwear y accesorios urbanos. Estilo que se nota.',
    logo: '🔥',
    categoryId: 'ropa',
    planId: 'pro',
    colors: { primary: '#F97316', secondary: '#EC4899' },
    whatsappNumber: '+51999990004',
    template: 'vibrante',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: false,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  clasica: {
    id: 'demo-clasica',
    name: 'Artesanías PE',
    slug: 'demo-clasica',
    description: 'Artesanía peruana directa del artesano a tu hogar. Hecho con amor.',
    logo: '🧶',
    categoryId: 'hogar',
    planId: 'pro',
    colors: { primary: '#92400E', secondary: '#FDE68A' },
    whatsappNumber: '+51999990005',
    template: 'clasica',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  luxury: {
    id: 'demo-luxury',
    name: 'LUXE',
    slug: 'demo-luxury',
    description: 'Colección exclusiva de piezas de lujo. Para quienes buscan lo extraordinario.',
    logo: '💎',
    categoryId: 'accesorios',
    planId: 'premium',
    colors: { primary: '#c8a456', secondary: '#1a1a2e' },
    whatsappNumber: '+51999990001',
    template: 'luxury',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: false,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  minimalist: {
    id: 'demo-minimalist',
    name: 'store.',
    slug: 'demo-minimalist',
    description: 'Esenciales para la vida moderna. Menos es más.',
    logo: '⬜',
    categoryId: 'ropa',
    planId: 'premium',
    colors: { primary: '#1a1a1a', secondary: '#f5f5f5' },
    whatsappNumber: '+51999990002',
    template: 'minimalist',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  bodega: {
    id: 'demo-bodega',
    name: 'Bodega Doña Rosa',
    slug: 'demo-bodega',
    description: 'Tu bodega de barrio ahora online. Pide por WhatsApp y te lo llevamos.',
    logo: '🏪',
    categoryId: 'bodega',
    planId: 'premium',
    colors: { primary: '#DC2626', secondary: '#F59E0B' },
    whatsappNumber: '+51999990006',
    template: 'bodega',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: false,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  sabor: {
    id: 'demo-sabor',
    name: 'Sabor y Más',
    slug: 'demo-sabor',
    description: 'Comida casera y delivery rápido. Pide tu menú del día por WhatsApp.',
    logo: '🍗',
    categoryId: 'restaurante',
    planId: 'premium',
    colors: { primary: '#EA580C', secondary: '#FBBF24' },
    whatsappNumber: '+51999990007',
    template: 'sabor',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: false,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  moda: {
    id: 'demo-moda',
    name: 'Casa Moda',
    slug: 'demo-moda',
    description: 'Piezas seleccionadas para un estilo único. Nueva colección cada semana.',
    logo: '👗',
    categoryId: 'ropa',
    planId: 'premium',
    colors: { primary: '#111827', secondary: '#DB2777' },
    whatsappNumber: '+51999990008',
    template: 'moda',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  vitrina: {
    id: 'demo-vitrina',
    name: 'Atelier Rosa',
    slug: 'demo-vitrina',
    description: 'Piezas seleccionadas con calidez y estilo. Belleza para cada día.',
    logo: '💎',
    categoryId: 'accesorios',
    planId: 'premium',
    colors: { primary: '#96613D', secondary: '#C89B6D' },
    whatsappNumber: '+51999990009',
    template: 'vitrina',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  boutique: {
    id: 'demo-boutique',
    name: 'Casa Alameda',
    slug: 'demo-boutique',
    description: 'Moda femenina con estilo editorial. Nuevas piezas cada semana.',
    logo: '👗',
    categoryId: 'ropa',
    planId: 'premium',
    colors: { primary: '#A9744F', secondary: '#1C1917' },
    whatsappNumber: '+51999990011',
    template: 'boutique',
    bannerUrl: '/demo-assets/boutique-hero.jpg',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  neon: {
    id: 'demo-neon',
    name: 'TecnoNova',
    slug: 'demo-neon',
    description: 'Tecnología de punta con delivery en 24 horas. Garantía incluida.',
    logo: '📱',
    categoryId: 'electronica',
    planId: 'premium',
    colors: { primary: '#06B6D4', secondary: '#8B5CF6' },
    whatsappNumber: '+51999990010',
    template: 'neon',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  editorial: {
    id: 'demo-editorial',
    name: 'NOVA Studio',
    slug: 'demo-editorial',
    description: 'Moda urbana editada como revista: piezas esenciales de temporada.',
    logo: '📰',
    categoryId: 'ropa',
    planId: 'premium',
    colors: { primary: '#C8102E', secondary: '#141414' },
    whatsappNumber: '+51999990012',
    template: 'editorial',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  atelier: {
    id: 'demo-atelier',
    name: 'Atelier Rosé',
    slug: 'demo-atelier',
    description: 'Piezas femeninas seleccionadas a mano para cada ocasión especial.',
    logo: '🤍',
    categoryId: 'ropa',
    planId: 'premium',
    colors: { primary: '#B76E79', secondary: '#40343A' },
    whatsappNumber: '+51999990013',
    template: 'atelier',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
  terracota: {
    id: 'demo-terracota',
    name: 'Tierra & Arte',
    slug: 'demo-terracota',
    description: 'Tejidos y accesorios hechos a mano por artistas peruanos.',
    logo: '🏺',
    categoryId: 'ropa',
    planId: 'premium',
    colors: { primary: '#B4552D', secondary: '#5F6F52' },
    whatsappNumber: '+51999990014',
    template: 'terracota',
    bannerUrl: '',
    userId: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasShipping: true, hasSecurePayment: true, hasReturns: true,
    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',
    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,
    shippingOptions: [
      { label: 'Delivery en la ciudad', price: 10, time: '24 horas' },
      { label: 'Recojo en tienda', price: null, time: 'Cuando quieras' },
    ],
    otherPayments: [],
  },
}

// Product images match the preview generation script (same Unsplash URLs)
const demoProducts: Record<string, Product[]> = {
  moderna: [
    { id: 'dmo1', name: 'Vestido Floral', description: 'Vestido floral con corte A. Perfecto para primavera y verano.', price: 89.0, originalPrice: null, categoryId: 'ropa', imageUrl: '/sample-products/vestido-verano-rosado.jpg', images: ['/sample-products/vestido-verano-rosado.jpg', '/sample-products/vestido-verano-rosado.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-moderna', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dmo2', name: 'Blazer Negro', description: 'Blazer oversize con corte moderno. Tela premium importada.', price: 149.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600', images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop'], color: 'Negro', stock: -1, isActive: true, featured: true, rating: 4.5, storeId: 'demo-moderna', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dmo3', name: 'Top Crochet', description: 'Top de crochet artesanal con acabado delicado.', price: 65.0, originalPrice: null, categoryId: 'ropa', imageUrl: '/sample-products/top-crochet.jpg', images: ['/sample-products/top-crochet.jpg', '/sample-products/top-crochet.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dmo4', name: 'Pantalón Wide', description: 'Pantalón wide leg con tiro alto. Comodidad y estilo.', price: 110.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dmo5', name: 'Polera Oversize', description: 'Polera oversize de algodón premium. Relajada y cómoda.', price: 45.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-04-01T10:00:00.000Z' },
  ],
  vibrante: [
    { id: 'dv1', name: 'Polera Oversize', description: 'Polera oversize de algodón premium. Streetwear urbano.', price: 45.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-vibrante', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dv2', name: 'Gorra Urban', description: 'Gorra deportiva con logo bordado. Estilo urbano.', price: 25.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/gorra-urban-baseball.jpg', images: ['/sample-products/gorra-urban-baseball.jpg', '/sample-products/gorra-urban-baseball.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-vibrante', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dv3', name: 'Zapatillas Pro X', description: 'Zapatillas de alto rendimiento con tecnología de amortiguación.', price: 120.0, originalPrice: null, categoryId: 'ropa', imageUrl: '/sample-products/zapatillas-running.jpg', images: ['/sample-products/zapatillas-running.jpg', '/sample-products/zapatillas-running.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-vibrante', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dv4', name: 'Crossbody Bag', description: 'Bolso crossbody de cuero sintético. Práctico y con estilo.', price: 55.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vibrante', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dv5', name: 'Bufanda Neon', description: 'Bufanda de lana con colores neón vibrantes.', price: 30.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/bufanda-neon.jpg', images: ['/sample-products/bufanda-neon.jpg', '/sample-products/bufanda-neon.jpg'], color: 'Neón', stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vibrante', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dv6', name: 'Lentes Retro', description: 'Lentes de sol estilo retro con protección UV400.', price: 35.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vibrante', createdAt: '2024-04-15T10:00:00.000Z' },
  ],
  clasica: [
    { id: 'dc1', name: 'Cerámica Navideña', description: 'Pieza de cerámica artesanal hecha a mano en Cusco.', price: 35.0, originalPrice: null, categoryId: 'hogar', imageUrl: '/sample-products/ceramica-navidena.jpg', images: ['/sample-products/ceramica-navidena.jpg', '/sample-products/ceramica-navidena.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-clasica', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dc2', name: 'Manta de Alpaca', description: 'Manta de alpaca baby 100% natural. Suavidad peruana.', price: 180.0, originalPrice: null, categoryId: 'hogar', imageUrl: '/sample-products/manta-alpaca.jpg', images: ['/sample-products/manta-alpaca.jpg', '/sample-products/manta-alpaca.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-clasica', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dc3', name: 'Joyería de Plata 925', description: 'Joyería de plata 925 peruana. Diseño artesanal único.', price: 95.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/joyeria-plata-925.jpg', images: ['/sample-products/joyeria-plata-925.jpg', '/sample-products/joyeria-plata-925.jpg'], color: 'Plata', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-clasica', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dc4', name: 'Café Orgánico', description: 'Café orgánico de altura peruano. Tostado artesanal.', price: 28.0, originalPrice: null, categoryId: 'alimentos', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600', images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-clasica', createdAt: '2024-03-15T10:00:00.000Z' },
  ],
  luxury: [
    { id: 'dl1', name: 'Bolso Dorado', description: 'Bolso de cuero con acabado dorado y detalles artesanales.', price: 580.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop'], color: 'Dorado', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-01-15T10:00:00.000Z' },
    { id: 'dl2', name: 'Vestido de Gala', description: 'Vestido de gala con corte elegante y tela premium importada.', price: 890.0, originalPrice: null, categoryId: 'ropa', imageUrl: '/sample-products/vestido-gala.jpg', images: ['/sample-products/vestido-gala.jpg', '/sample-products/vestido-gala.jpg&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dl3', name: 'Anillo Diamond', description: 'Anillo con diamante certificado y montura en oro 18K.', price: 1200.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/anillo-diamond.jpg', images: ['/sample-products/anillo-diamond.jpg', '/sample-products/anillo-diamond.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-03-01T10:00:00.000Z' },
  ],
  minimalist: [
    { id: 'dm1', name: 'White Tee', description: 'Camiseta blanca de algodón orgánico. Corte relajado.', price: 45.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop'], color: 'Blanco', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-minimalist', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dm2', name: 'Slim Jeans', description: 'Jeans slim de denim japonés. Azul clásico.', price: 89.0, originalPrice: null, categoryId: 'ropa', imageUrl: '/sample-products/jean-unisex.jpg', images: ['/sample-products/jean-unisex.jpg', '/sample-products/jean-unisex.jpg'], color: 'Azul', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-minimalist', createdAt: '2024-02-15T10:00:00.000Z' },
    { id: 'dm3', name: 'Trench Coat', description: 'Trench coat beige de algodón premium. Elegancia atemporal.', price: 199.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600', images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop'], color: 'Beige', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-minimalist', createdAt: '2024-03-05T10:00:00.000Z' },
    { id: 'dm4', name: 'Minimal Sneakers', description: 'Zapatillas minimalistas de cuero blanco. Diseño limpio.', price: 120.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=800&fit=crop'], color: 'Blanco', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-minimalist', createdAt: '2024-03-20T10:00:00.000Z' },
    { id: 'dm5', name: 'Eau de Parfum', description: 'Fragancia minimalista con notas de cedro y sándalo.', price: 85.0, originalPrice: null, categoryId: 'otros', imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600', images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-minimalist', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dm6', name: 'Classic Watch', description: 'Reloj de diseño minimalista con correa de cuero.', price: 150.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-04-15T10:00:00.000Z' },
    { id: 'dm7', name: 'Sun Glasses', description: 'Lentes de sol con montura delgada. Estilo atemporal.', price: 65.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-05-01T10:00:00.000Z' },
    { id: 'dm8', name: 'Silver Necklace', description: 'Collar de plata con dije esencial. Sutil y elegante.', price: 75.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop'], color: 'Plata', stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-05-10T10:00:00.000Z' },
  ],
  bodega: [
    { id: 'db1', name: 'Arroz Extra Superior 5kg', description: 'Arroz extra de calidad superior, grano largo.', price: 24.9, originalPrice: 27.9, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-bodega', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'db2', name: 'Aceite Vegetal 1L', description: 'Aceite vegetal puro para cocinar.', price: 9.9, originalPrice: null, categoryId: 'abarrotes', imageUrl: '/sample-products/aceite-vegetal-1l.jpg', images: ['/sample-products/aceite-vegetal-1l.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-bodega', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'db3', name: 'Leche Evaporada 400g', description: 'Leche evaporada entera en lata.', price: 3.8, originalPrice: null, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-bodega', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'db4', name: 'Galletas de Soda', description: 'Paquete de galletas de soda crocantes.', price: 3.5, originalPrice: null, categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600', images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-bodega', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'db5', name: 'Café Molido 500g', description: 'Café molido peruano tostado medio.', price: 19.9, originalPrice: 22.9, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600', images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-bodega', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'db6', name: 'Atún en Agua 170g', description: 'Latas de atún en agua, fuente de proteína.', price: 6.9, originalPrice: null, categoryId: 'abarrotes', imageUrl: '/sample-products/atun-en-agua-170g.jpg', images: ['/sample-products/atun-en-agua-170g.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-bodega', createdAt: '2024-04-15T10:00:00.000Z' },
  ],
  sabor: [
    { id: 'ds1', name: 'Pollo a la Brasa Entero', description: 'Pollo a la brasa jugoso con papas y cremas.', price: 38.0, originalPrice: 42.0, categoryId: 'platos', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600', images: ['https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-sabor', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'ds2', name: 'Menú del Día', description: 'Entrada, fondo, postre y refresco. Cambia a diario.', price: 15.0, originalPrice: null, categoryId: 'menús', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-sabor', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'ds3', name: 'Ceviche Fresco', description: 'Pescado del día marinado en limón con camote y choclo.', price: 22.0, originalPrice: null, categoryId: 'platos', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-sabor', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'ds4', name: 'Lomo Saltado', description: 'Lomo fino salteado con papas fritas y arroz.', price: 28.0, originalPrice: null, categoryId: 'platos', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-sabor', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'ds5', name: 'Chicha Morada (Jarra)', description: 'Bebida artesanal de maíz morado con limón y canela.', price: 10.0, originalPrice: null, categoryId: 'bebidas', imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600', images: ['https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-sabor', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'ds6', name: 'Torta de Chocolate (Porción)', description: 'Torta húmeda de chocolate con cobertura.', price: 6.5, originalPrice: null, categoryId: 'postres', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-sabor', createdAt: '2024-04-15T10:00:00.000Z' },
  ],
  moda: [
    { id: 'dmf1', name: 'Vestido Midi Elegante', description: 'Vestido midi con corte fluido. Tela premium.', price: 119.0, originalPrice: null, categoryId: 'mujer', imageUrl: '/sample-products/vestido-verano-rosado.jpg', images: ['/sample-products/vestido-verano-rosado.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-moda', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dmf2', name: 'Blazer Sastre', description: 'Blazer de corte sastre en tela importada.', price: 149.0, originalPrice: 179.0, categoryId: 'mujer', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600', images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'], color: 'Negro', stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-moda', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dmf3', name: 'Jean Mom Fit', description: 'Jean de talle alto con lavado clásico.', price: 89.9, originalPrice: null, categoryId: 'casual', imageUrl: '/sample-products/jean-unisex.jpg', images: ['/sample-products/jean-unisex.jpg'], color: 'Azul', stock: -1, isActive: true, featured: true, rating: 4.5, storeId: 'demo-moda', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dmf4', name: 'Camisa de Lino', description: 'Camisa de lino fresca para verano.', price: 69.9, originalPrice: null, categoryId: 'hombre', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], color: 'Blanco', stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moda', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dmf5', name: 'Look Editorial Completo', description: 'Conjunto de temporada seleccionado por nuestros estilistas.', price: 199.0, originalPrice: null, categoryId: 'mujer', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-moda', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dmf6', name: 'Bolso Tote Cuero', description: 'Bolso tote de cuero con acabado premium.', price: 99.9, originalPrice: 129.0, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600'], color: 'Caramelo', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-moda', createdAt: '2024-04-15T10:00:00.000Z' },
  ],
  vitrina: [
    { id: 'dvt1', name: 'Perfume Rosa Blanca', description: 'Fragancia floral con notas de peonía y vainilla. 100 ml.', price: 129.0, originalPrice: null, categoryId: 'belleza', imageUrl: '/sample-products/perfume-blanco-frasco.jpg', images: ['/sample-products/perfume-blanco-frasco.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-vitrina', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dvt2', name: 'Joyería de Plata 925', description: 'Set de plata 925 peruana con diseño artesanal.', price: 145.0, originalPrice: 175.0, categoryId: 'accesorios', imageUrl: '/sample-products/joyeria-plata-925.jpg', images: ['/sample-products/joyeria-plata-925.jpg'], color: 'Plata', stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-vitrina', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dvt3', name: 'Aretes Plateados', description: 'Aretes delicados con acabado pulido a mano.', price: 49.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/aretes-plateados.jpg', images: ['/sample-products/aretes-plateados.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-vitrina', createdAt: '2024-02-01T10:00:00.000Z' },
    { id: 'dvt4', name: 'Bolso de Mano', description: 'Bolso estructurado con correa desmontable.', price: 159.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/bolso-mano.jpg', images: ['/sample-products/bolso-mano.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-vitrina', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dvt5', name: 'Ramo de Girasoles', description: 'Frescas de la mañana, envueltas para regalo.', price: 45.0, originalPrice: null, categoryId: 'flores', imageUrl: '/sample-products/ramo-girasoles.jpg', images: ['/sample-products/ramo-girasoles.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-vitrina', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dvt6', name: 'Perfume Femenino Intense', description: 'Notas ámbar y madera para las noches especiales.', price: 149.0, originalPrice: 189.0, categoryId: 'belleza', imageUrl: '/sample-products/perfume-femenino-100ml.jpg', images: ['/sample-products/perfume-femenino-100ml.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vitrina', createdAt: '2024-03-10T10:00:00.000Z' },
    { id: 'dvt7', name: 'Pulsera Tejida a Mano', description: 'Pulsera artesanal con hilos de colores naturales.', price: 25.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/pulsera-tejida-mano.jpg', images: ['/sample-products/pulsera-tejida-mano.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vitrina', createdAt: '2024-04-01T10:00:00.000Z' },
  ],
  neon: [
    { id: 'dnn1', name: 'Audífonos Bluetooth Pro', description: 'Cancelación activa de ruido y 30 horas de batería.', price: 189.0, originalPrice: 229.0, categoryId: 'electronica', imageUrl: '/sample-products/audifonos-bluetooth-wireless.jpg', images: ['/sample-products/audifonos-bluetooth-wireless.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-neon', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dnn2', name: 'Smartwatch Fit 2', description: 'Pulsómetro, GPS y pantalla AMOLED resistente al agua.', price: 159.0, originalPrice: null, categoryId: 'electronica', imageUrl: '/sample-products/smartwatch-basico.jpg', images: ['/sample-products/smartwatch-basico.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 4.5, storeId: 'demo-neon', createdAt: '2024-02-01T10:00:00.000Z' },
    { id: 'dnn3', name: 'Power Bank 10 000 mAh', description: 'Carga rápida de 22.5 W con doble salida USB.', price: 69.0, originalPrice: null, categoryId: 'electronica', imageUrl: '/sample-products/power-bank-10000.jpg', images: ['/sample-products/power-bank-10000.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-neon', createdAt: '2024-02-15T10:00:00.000Z' },
    { id: 'dnn4', name: 'Cargador Rápido 20 W', description: 'Carga completa en menos de 2 horas. Certificado.', price: 35.0, originalPrice: 45.0, categoryId: 'accesorios', imageUrl: '/sample-products/cargador-rapido-20w.jpg', images: ['/sample-products/cargador-rapido-20w.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-neon', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dnn5', name: 'Parlante Bluetooth Portátil', description: 'Sonido 360° con graves profundos. Resistente al agua.', price: 99.0, originalPrice: null, categoryId: 'electronica', imageUrl: '/sample-products/parlante-bluetooth-portatil.jpg', images: ['/sample-products/parlante-bluetooth-portatil.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-neon', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dnn6', name: 'Vidrio Templado 9H', description: 'Protección total para tu pantalla con instalación fácil.', price: 15.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/vidrio-templado.jpg', images: ['/sample-products/vidrio-templado.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-neon', createdAt: '2024-04-01T10:00:00.000Z' },
  ],
  boutique: [
    { id: 'dbq1', name: 'Vestido Gala Noir', description: 'Vestido largo de gala con caída fluida y detalle en la espalda.', price: 189.0, originalPrice: null, categoryId: 'vestidos', imageUrl: '/sample-products/vestido-gala.jpg', images: ['/sample-products/vestido-gala.jpg'], color: 'Negro', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-boutique', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dbq2', name: 'Vestido Verano Blush', description: 'Vestido ligero de verano en tonos rosados. Tela fresca.', price: 99.0, originalPrice: 129.0, categoryId: 'vestidos', imageUrl: '/sample-products/vestido-verano-rosado.jpg', images: ['/sample-products/vestido-verano-rosado.jpg'], color: 'Rosado', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-boutique', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dbq3', name: 'Casaca Denim Oversize', description: 'Casaca de mezclilla corte oversize con lavado clásico.', price: 119.0, originalPrice: 159.0, categoryId: 'casacas', imageUrl: '/sample-products/casaca-jean.jpg', images: ['/sample-products/casaca-jean.jpg'], color: 'Denim', stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-boutique', createdAt: '2024-02-01T10:00:00.000Z' },
    { id: 'dbq4', name: 'Chompa Tejida Premium', description: 'Chompa tejida a máquina con hilo suave de alta calidad.', price: 89.0, originalPrice: null, categoryId: 'casacas', imageUrl: '/sample-products/chompa-tejida.jpg', images: ['/sample-products/chompa-tejida.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-boutique', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dbq5', name: 'Top Crochet Artesanal', description: 'Top de crochet hecho a mano. Pieza única de temporada.', price: 59.0, originalPrice: null, categoryId: 'casual', imageUrl: '/sample-products/top-crochet.jpg', images: ['/sample-products/top-crochet.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-boutique', createdAt: '2024-02-20T10:00:00.000Z' },
    { id: 'dbq6', name: 'Pantalón Wide Leg', description: 'Pantalón wide leg con tiro alto y caída elegante.', price: 79.0, originalPrice: null, categoryId: 'casual', imageUrl: '/sample-products/pantalon-wide-leg.jpg', images: ['/sample-products/pantalon-wide-leg.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-boutique', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dbq7', name: 'Polo Algodón Pima', description: 'Polo básico de algodón Pima peruano. Corte recto.', price: 45.0, originalPrice: 59.0, categoryId: 'casual', imageUrl: '/sample-products/polo-basico-algodon.jpg', images: ['/sample-products/polo-basico-algodon.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-boutique', createdAt: '2024-03-10T10:00:00.000Z' },
    { id: 'dbq8', name: 'Jean Slim Fit', description: 'Jean slim fit de mezclilla elástica cómoda.', price: 95.0, originalPrice: null, categoryId: 'casual', imageUrl: '/sample-products/jean-unisex.jpg', images: ['/sample-products/jean-unisex.jpg'], color: 'Azul', stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-boutique', createdAt: '2024-03-20T10:00:00.000Z' },
    { id: 'dbq9', name: 'Bolso Estructurado', description: 'Bolso de mano estructurado con correa desmontable.', price: 139.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/bolso-mano.jpg', images: ['/sample-products/bolso-mano.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-boutique', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dbq10', name: 'Lentes Sol Classic', description: 'Lentes de sol con protección UV400 y armazón acetato.', price: 65.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/lentes-sol-uv400.jpg', images: ['/sample-products/lentes-sol-uv400.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-boutique', createdAt: '2024-04-10T10:00:00.000Z' },
    { id: 'dbq11', name: 'Sneakers Urbanas', description: 'Zapatillas urbanas ligeras con suela amortiguada.', price: 149.0, originalPrice: 189.0, categoryId: 'calzado', imageUrl: '/sample-products/zapatillas-running.jpg', images: ['/sample-products/zapatillas-running.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-boutique', createdAt: '2024-04-20T10:00:00.000Z' },
    { id: 'dbq12', name: 'Conjunto Lounge', description: 'Conjunto de algodón para estar en casa con estilo.', price: 69.0, originalPrice: null, categoryId: 'casual', imageUrl: '/sample-products/pijama-algodon.jpg', images: ['/sample-products/pijama-algodon.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-boutique', createdAt: '2024-05-01T10:00:00.000Z' },
  ],
  editorial: [
    { id: 'dte1', name: 'Casaca Denim Oversize', description: 'Casaca de mezclilla corte oversize con lavado clásico.', price: 119.0, originalPrice: 159.0, categoryId: 'casacas', imageUrl: '/sample-products/casaca-jean.jpg', images: ['/sample-products/casaca-jean.jpg'], color: 'Denim', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-editorial', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dte2', name: 'Jean Recto Clásico', description: 'Jean recto de mezclilla resistente. Corte atemporal.', price: 95.0, originalPrice: null, categoryId: 'jeans', imageUrl: '/sample-products/jean-unisex.jpg', images: ['/sample-products/jean-unisex.jpg'], color: 'Azul', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-editorial', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dte3', name: 'Polo Algodón Pima', description: 'Polo básico de algodón Pima peruano. Corte recto.', price: 45.0, originalPrice: 59.0, categoryId: 'polos', imageUrl: '/sample-products/polo-basico-algodon.jpg', images: ['/sample-products/polo-basico-algodon.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-editorial', createdAt: '2024-02-01T10:00:00.000Z' },
    { id: 'dte4', name: 'Polo Dry Fit Urban', description: 'Polo técnico dry fit para el día a día.', price: 39.0, originalPrice: null, categoryId: 'polos', imageUrl: '/sample-products/polo-dry-fit.jpg', images: ['/sample-products/polo-dry-fit.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-editorial', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dte5', name: 'Pantalón Wide Leg', description: 'Pantalón wide leg con tiro alto y caída elegante.', price: 79.0, originalPrice: null, categoryId: 'pantalones', imageUrl: '/sample-products/pantalon-wide-leg.jpg', images: ['/sample-products/pantalon-wide-leg.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-editorial', createdAt: '2024-02-20T10:00:00.000Z' },
    { id: 'dte6', name: 'Gorra Urban Baseball', description: 'Gorra de baseball con bordado minimal.', price: 35.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/gorra-urban-baseball.jpg', images: ['/sample-products/gorra-urban-baseball.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-editorial', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dte7', name: 'Lentes Sol Classic', description: 'Lentes de sol con protección UV400 y armazón acetato.', price: 65.0, originalPrice: 85.0, categoryId: 'accesorios', imageUrl: '/sample-products/lentes-sol-uv400.jpg', images: ['/sample-products/lentes-sol-uv400.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-editorial', createdAt: '2024-03-10T10:00:00.000Z' },
    { id: 'dte8', name: 'Bolso Estructurado', description: 'Bolso de mano estructurado con correa desmontable.', price: 139.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/bolso-mano.jpg', images: ['/sample-products/bolso-mano.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-editorial', createdAt: '2024-03-20T10:00:00.000Z' },
    { id: 'dte9', name: 'Sneakers Urbanas', description: 'Zapatillas urbanas ligeras con suela amortiguada.', price: 149.0, originalPrice: 189.0, categoryId: 'calzado', imageUrl: '/sample-products/zapatillas-running.jpg', images: ['/sample-products/zapatillas-running.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-editorial', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dte10', name: 'Bufanda Tejida', description: 'Bufanda tejida suave para la temporada fría.', price: 49.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/bufanda-neon.jpg', images: ['/sample-products/bufanda-neon.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-editorial', createdAt: '2024-04-10T10:00:00.000Z' },
    { id: 'dte11', name: 'Conjunto Lounge', description: 'Conjunto de algodón para estar en casa con estilo.', price: 69.0, originalPrice: null, categoryId: 'casual', imageUrl: '/sample-products/pijama-algodon.jpg', images: ['/sample-products/pijama-algodon.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-editorial', createdAt: '2024-04-20T10:00:00.000Z' },
    { id: 'dte12', name: 'Top Crochet', description: 'Top de crochet artesanal con acabado delicado.', price: 59.0, originalPrice: 75.0, categoryId: 'casual', imageUrl: '/sample-products/top-crochet.jpg', images: ['/sample-products/top-crochet.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-editorial', createdAt: '2024-05-01T10:00:00.000Z' },
  ],
  atelier: [
    { id: 'dat1', name: 'Vestido Gala Noir', description: 'Vestido largo de gala con caída fluida y detalle en la espalda.', price: 189.0, originalPrice: null, categoryId: 'vestidos', imageUrl: '/sample-products/vestido-gala.jpg', images: ['/sample-products/vestido-gala.jpg'], color: 'Negro', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-atelier', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dat2', name: 'Vestido Verano Blush', description: 'Vestido ligero de verano en tonos rosados. Tela fresca.', price: 99.0, originalPrice: 129.0, categoryId: 'vestidos', imageUrl: '/sample-products/vestido-verano-rosado.jpg', images: ['/sample-products/vestido-verano-rosado.jpg'], color: 'Rosado', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-atelier', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dat3', name: 'Top Crochet Artesanal', description: 'Top de crochet hecho a mano. Pieza única de temporada.', price: 59.0, originalPrice: null, categoryId: 'tejidos', imageUrl: '/sample-products/top-crochet.jpg', images: ['/sample-products/top-crochet.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-atelier', createdAt: '2024-02-01T10:00:00.000Z' },
    { id: 'dat4', name: 'Chompa Tejida Premium', description: 'Chompa tejida con hilo suave de alta calidad.', price: 89.0, originalPrice: null, categoryId: 'tejidos', imageUrl: '/sample-products/chompa-tejida.jpg', images: ['/sample-products/chompa-tejida.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-atelier', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dat5', name: 'Pantalón Wide Leg', description: 'Pantalón wide leg con tiro alto y caída elegante.', price: 79.0, originalPrice: null, categoryId: 'casual', imageUrl: '/sample-products/pantalon-wide-leg.jpg', images: ['/sample-products/pantalon-wide-leg.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-atelier', createdAt: '2024-02-20T10:00:00.000Z' },
    { id: 'dat6', name: 'Conjunto Lounge', description: 'Conjunto de algodón suave para descansar con estilo.', price: 69.0, originalPrice: 89.0, categoryId: 'casual', imageUrl: '/sample-products/pijama-algodon.jpg', images: ['/sample-products/pijama-algodon.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-atelier', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dat7', name: 'Joyería Plata 925', description: 'Set de joyería en plata 925 con acabado pulido.', price: 129.0, originalPrice: null, categoryId: 'joyeria', imageUrl: '/sample-products/joyeria-plata-925.jpg', images: ['/sample-products/joyeria-plata-925.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-atelier', createdAt: '2024-03-10T10:00:00.000Z' },
    { id: 'dat8', name: 'Aretes Plateados', description: 'Aretes delicados en plata con brillo sutil.', price: 45.0, originalPrice: null, categoryId: 'joyeria', imageUrl: '/sample-products/aretes-plateados.jpg', images: ['/sample-products/aretes-plateados.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-atelier', createdAt: '2024-03-20T10:00:00.000Z' },
    { id: 'dat9', name: 'Anillo Diamond', description: 'Anillo con piedra central y banda fina.', price: 99.0, originalPrice: 139.0, categoryId: 'joyeria', imageUrl: '/sample-products/anillo-diamond.jpg', images: ['/sample-products/anillo-diamond.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-atelier', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dat10', name: 'Bolso Estructurado', description: 'Bolso de mano estructurado con correa desmontable.', price: 139.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/bolso-mano.jpg', images: ['/sample-products/bolso-mano.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-atelier', createdAt: '2024-04-10T10:00:00.000Z' },
    { id: 'dat11', name: 'Perfume Rosé 100ml', description: 'Eau de parfum floral con notas de rosa y almizcle.', price: 119.0, originalPrice: null, categoryId: 'belleza', imageUrl: '/sample-products/perfume-femenino-100ml.jpg', images: ['/sample-products/perfume-femenino-100ml.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-atelier', createdAt: '2024-04-20T10:00:00.000Z' },
    { id: 'dat12', name: 'Labial Mate', description: 'Labial mate de larga duración, tonos nude.', price: 35.0, originalPrice: 45.0, categoryId: 'belleza', imageUrl: '/sample-products/labial-mate.jpg', images: ['/sample-products/labial-mate.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-atelier', createdAt: '2024-05-01T10:00:00.000Z' },
  ],
  terracota: [
    { id: 'dtt1', name: 'Chompa Tejida Alpaca', description: 'Chompa de alpaca tejida a mano por artistas andinos.', price: 120.0, originalPrice: null, categoryId: 'tejidos', imageUrl: '/sample-products/chompa-tejida.jpg', images: ['/sample-products/chompa-tejida.jpg'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-terracota', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dtt2', name: 'Manta de Alpaca', description: 'Manta de alpaca suave con tejido tradicional.', price: 150.0, originalPrice: 190.0, categoryId: 'tejidos', imageUrl: '/sample-products/manta-alpaca.jpg', images: ['/sample-products/manta-alpaca.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-terracota', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dtt3', name: 'Top Crochet', description: 'Top de crochet hecho a mano en algodón natural.', price: 60.0, originalPrice: null, categoryId: 'tejidos', imageUrl: '/sample-products/top-crochet.jpg', images: ['/sample-products/top-crochet.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-terracota', createdAt: '2024-02-01T10:00:00.000Z' },
    { id: 'dtt4', name: 'Pulsera Tejida a Mano', description: 'Pulsera artesanal tejida en hilos de colores.', price: 25.0, originalPrice: null, categoryId: 'joyeria', imageUrl: '/sample-products/pulsera-tejida-mano.jpg', images: ['/sample-products/pulsera-tejida-mano.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-terracota', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dtt5', name: 'Collar Artesanal', description: 'Collar hecho a mano con piedras y semillas naturales.', price: 55.0, originalPrice: null, categoryId: 'joyeria', imageUrl: '/sample-products/collar-artesanal.jpg', images: ['/sample-products/collar-artesanal.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-terracota', createdAt: '2024-02-20T10:00:00.000Z' },
    { id: 'dtt6', name: 'Aretes Artesanales', description: 'Aretes ligeros con detalles tejidos a mano.', price: 40.0, originalPrice: 55.0, categoryId: 'joyeria', imageUrl: '/sample-products/aretes-plateados.jpg', images: ['/sample-products/aretes-plateados.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-terracota', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dtt7', name: 'Bolso Artesanal', description: 'Bolso de mano con acabados artesanales únicos.', price: 130.0, originalPrice: null, categoryId: 'accesorios', imageUrl: '/sample-products/bolso-mano.jpg', images: ['/sample-products/bolso-mano.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-terracota', createdAt: '2024-03-10T10:00:00.000Z' },
    { id: 'dtt8', name: 'Cerámica Decorativa', description: 'Pieza de cerámica pintada a mano por artistas locales.', price: 45.0, originalPrice: null, categoryId: 'hogar', imageUrl: '/sample-products/ceramica-navidena.jpg', images: ['/sample-products/ceramica-navidena.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-terracota', createdAt: '2024-03-20T10:00:00.000Z' },
    { id: 'dtt9', name: 'Cojín Tejido', description: 'Cojín decorativo tejido con diseños tradicionales.', price: 50.0, originalPrice: 65.0, categoryId: 'hogar', imageUrl: '/sample-products/cojin-decorativo.jpg', images: ['/sample-products/cojin-decorativo.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-terracota', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dtt10', name: 'Cortina Tejida 2m', description: 'Cortina de algodón tejida en telar tradicional.', price: 85.0, originalPrice: null, categoryId: 'hogar', imageUrl: '/sample-products/cortina-2m.jpg', images: ['/sample-products/cortina-2m.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-terracota', createdAt: '2024-04-10T10:00:00.000Z' },
    { id: 'dtt11', name: 'Edredón Matrimonial', description: 'Edredón abrigador con acabado artesanal.', price: 220.0, originalPrice: 280.0, categoryId: 'hogar', imageUrl: '/sample-products/edredon-matrimonial.jpg', images: ['/sample-products/edredon-matrimonial.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-terracota', createdAt: '2024-04-20T10:00:00.000Z' },
    { id: 'dtt12', name: 'Set Plata 925', description: 'Set de joyería en plata 925 elaborado a mano.', price: 140.0, originalPrice: null, categoryId: 'joyeria', imageUrl: '/sample-products/joyeria-plata-925.jpg', images: ['/sample-products/joyeria-plata-925.jpg'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-terracota', createdAt: '2024-05-01T10:00:00.000Z' },
  ],
}

// Map template ID to plan for rendering
const templatePlanId: Record<string, string> = {
  moderna: 'free',
  vibrante: 'pro',
  clasica: 'pro',
  luxury: 'premium',
  minimalist: 'premium',
  bodega: 'premium',
  sabor: 'premium',
  moda: 'premium',
  vitrina: 'premium',
  neon: 'premium',
  boutique: 'premium',
  editorial: 'premium',
  atelier: 'premium',
  terracota: 'premium',
}

// Map template ID to plan label for the banner
function getPlanLabel(template: string): string {
  switch (template) {
    case 'moderna': return 'Plan Gratuito'
    case 'vibrante':
    case 'clasica': return 'Plan Pro'
    case 'luxury':
    case 'minimalist':
    case 'bodega':
    case 'sabor':
    case 'moda':
    case 'vitrina':
    case 'neon':
    case 'boutique':
    case 'editorial':
    case 'atelier':
    case 'terracota': return 'Plan Premium'
    default: return ''
  }
}

export function DemoTemplateClient({ template }: { template: string }) {
  const store = demoStores[template]
  const products = demoProducts[template] || []
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  if (!store) return null

  const planId = templatePlanId[template] || 'free'
  const isPremium = planId === 'premium'
  const isFree = planId === 'free'
  const planLabel = getPlanLabel(template)

  // Populate Zustand store so ProductDetailView can find the data
  const setStoreData = () => {
    useAppStore.setState({
      stores: [store],
      products: products,
      currentStore: store,
    })
  }

  // Initialize Zustand on mount (useEffect instead of render-time mutation)
  useEffect(() => {
    setStoreData()
  }, [])

  // Handle product click from templates
  const handleProductClick = (productId: string) => {
    setStoreData()
    setSelectedProductId(productId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle back from product detail
  const handleBackToStore = () => {
    setSelectedProductId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Banner style based on plan
  const bannerStyle = isPremium
    ? 'bg-gradient-to-r from-[#c8a456] to-[#f0d078] text-[#1a1a2e]'
    : isFree
    ? 'bg-emerald-600 text-white'
    : 'bg-violet-600 text-white'

  const BannerIcon = isPremium ? Crown : isFree ? Gem : Sparkles

  // If a product is selected, show ProductDetailView
  if (selectedProductId) {
    return (
      <div className="relative">
        {/* Demo Banner */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className={`text-center py-2 text-xs font-medium ${bannerStyle}`}>
            <div className="flex items-center justify-center gap-2">
              <BannerIcon className="w-3.5 h-3.5" />
              <span>Vista previa de la plantilla {store.name} — {planLabel}</span>
            </div>
          </div>
        </div>
        {/* Spacer for fixed banner */}
        <div className="h-[40px]" />
        <ProductDetailView slug={store.slug} productId={selectedProductId} onDemoBack={handleBackToStore} />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className={`text-center py-2 text-xs font-medium ${bannerStyle}`}>
          <div className="flex items-center justify-center gap-2">
            <BannerIcon className="w-3.5 h-3.5" />
            <span>Vista previa de la plantilla {store.name} — {planLabel}</span>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <Button
            onClick={() => window.location.href = '/register'}
            size="sm"
            className={`rounded-lg text-xs font-semibold ${isPremium ? 'bg-[#c8a456] hover:bg-[#b8943e] text-white' : isFree ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
          >
            Crear mi tienda
          </Button>
        </div>
      </div>

      {/* Spacer for fixed banner */}
      <div className="h-[76px]" />

      {/* Template — pass correct planId for feature gating */}
      {template === 'luxury' && <LuxuryTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'minimalist' && <MinimalistTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'moderna' && <ModernaTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'vibrante' && <VibranteTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'clasica' && <ClasicaTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'bodega' && <BodegaTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'sabor' && <SaborTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'moda' && <ModaTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'vitrina' && <VitrinaTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'neon' && <NeonTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'boutique' && <BoutiqueTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'editorial' && <EditorialTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'atelier' && <AtelierTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
      {template === 'terracota' && <TerracotaTemplate store={store} products={products} storeSlug={store.slug} planId={planId} onProductClick={handleProductClick} />}
    </div>
  )
}
