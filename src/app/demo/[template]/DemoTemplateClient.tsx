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
}

// Product images match the preview generation script (same Unsplash URLs)
const demoProducts: Record<string, Product[]> = {
  moderna: [
    { id: 'dmo1', name: 'Vestido Floral', description: 'Vestido floral con corte A. Perfecto para primavera y verano.', price: 89.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600', images: ['https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600', 'https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-moderna', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dmo2', name: 'Blazer Negro', description: 'Blazer oversize con corte moderno. Tela premium importada.', price: 149.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600', images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop'], color: 'Negro', stock: -1, isActive: true, featured: true, rating: 4.5, storeId: 'demo-moderna', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dmo3', name: 'Top Crochet', description: 'Top de crochet artesanal con acabado delicado.', price: 65.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f2d4cb5?w=600', images: ['https://images.unsplash.com/photo-1564257631407-4deb1f2d4cb5?w=600', 'https://images.unsplash.com/photo-1564257631407-4deb1f2d4cb5?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dmo4', name: 'Pantalón Wide', description: 'Pantalón wide leg con tiro alto. Comodidad y estilo.', price: 110.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dmo5', name: 'Polera Oversize', description: 'Polera oversize de algodón premium. Relajada y cómoda.', price: 45.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moderna', createdAt: '2024-04-01T10:00:00.000Z' },
  ],
  vibrante: [
    { id: 'dv1', name: 'Polera Oversize', description: 'Polera oversize de algodón premium. Streetwear urbano.', price: 45.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-vibrante', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dv2', name: 'Gorra Urban', description: 'Gorra deportiva con logo bordado. Estilo urbano.', price: 25.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600', images: ['https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600', 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-vibrante', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dv3', name: 'Zapatillas Pro X', description: 'Zapatillas de alto rendimiento con tecnología de amortiguación.', price: 120.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec67c5064?w=600', images: ['https://images.unsplash.com/photo-1542291026-7eec67c5064?w=600', 'https://images.unsplash.com/photo-1542291026-7eec67c5064?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-vibrante', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dv4', name: 'Crossbody Bag', description: 'Bolso crossbody de cuero sintético. Práctico y con estilo.', price: 55.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vibrante', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dv5', name: 'Bufanda Neon', description: 'Bufanda de lana con colores neón vibrantes.', price: 30.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1601924990987-69426850e596?w=600', images: ['https://images.unsplash.com/photo-1601924990987-69426850e596?w=600', 'https://images.unsplash.com/photo-1601924990987-69426850e596?w=600&h=800&fit=crop'], color: 'Neón', stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vibrante', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dv6', name: 'Lentes Retro', description: 'Lentes de sol estilo retro con protección UV400.', price: 35.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-vibrante', createdAt: '2024-04-15T10:00:00.000Z' },
  ],
  clasica: [
    { id: 'dc1', name: 'Cerámica Navideña', description: 'Pieza de cerámica artesanal hecha a mano en Cusco.', price: 35.0, originalPrice: null, categoryId: 'hogar', imageUrl: 'https://images.unsplash.com/photo-1565193565936-417e2ad4c47c?w=600', images: ['https://images.unsplash.com/photo-1565193565936-417e2ad4c47c?w=600', 'https://images.unsplash.com/photo-1565193565936-417e2ad4c47c?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-clasica', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dc2', name: 'Manta de Alpaca', description: 'Manta de alpaca baby 100% natural. Suavidad peruana.', price: 180.0, originalPrice: null, categoryId: 'hogar', imageUrl: 'https://images.unsplash.com/photo-1608234807905-44660237da2c?w=600', images: ['https://images.unsplash.com/photo-1608234807905-44660237da2c?w=600', 'https://images.unsplash.com/photo-1608234807905-44660237da2c?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-clasica', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dc3', name: 'Joyería de Plata 925', description: 'Joyería de plata 925 peruana. Diseño artesanal único.', price: 95.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0c569706f?w=600', images: ['https://images.unsplash.com/photo-1515562141589-67f0c569706f?w=600', 'https://images.unsplash.com/photo-1515562141589-67f0c569706f?w=600&h=800&fit=crop'], color: 'Plata', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-clasica', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dc4', name: 'Café Orgánico', description: 'Café orgánico de altura peruano. Tostado artesanal.', price: 28.0, originalPrice: null, categoryId: 'alimentos', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600', images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-clasica', createdAt: '2024-03-15T10:00:00.000Z' },
  ],
  luxury: [
    { id: 'dl1', name: 'Bolso Dorado', description: 'Bolso de cuero con acabado dorado y detalles artesanales.', price: 580.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop'], color: 'Dorado', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-01-15T10:00:00.000Z' },
    { id: 'dl2', name: 'Vestido de Gala', description: 'Vestido de gala con corte elegante y tela premium importada.', price: 890.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600', images: ['https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600', 'https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dl3', name: 'Anillo Diamond', description: 'Anillo con diamante certificado y montura en oro 18K.', price: 1200.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b35570?w=600', images: ['https://images.unsplash.com/photo-1605100804763-247f67b35570?w=600', 'https://images.unsplash.com/photo-1605100804763-247f67b35570?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-luxury', createdAt: '2024-03-01T10:00:00.000Z' },
  ],
  minimalist: [
    { id: 'dm1', name: 'White Tee', description: 'Camiseta blanca de algodón orgánico. Corte relajado.', price: 45.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop'], color: 'Blanco', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-minimalist', createdAt: '2024-01-20T10:00:00.000Z' },
    { id: 'dm2', name: 'Slim Jeans', description: 'Jeans slim de denim japonés. Azul clásico.', price: 89.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3824274d?w=600', images: ['https://images.unsplash.com/photo-1542272604-787c3824274d?w=600', 'https://images.unsplash.com/photo-1542272604-787c3824274d?w=600&h=800&fit=crop'], color: 'Azul', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-minimalist', createdAt: '2024-02-15T10:00:00.000Z' },
    { id: 'dm3', name: 'Trench Coat', description: 'Trench coat beige de algodón premium. Elegancia atemporal.', price: 199.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600', images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop'], color: 'Beige', stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-minimalist', createdAt: '2024-03-05T10:00:00.000Z' },
    { id: 'dm4', name: 'Minimal Sneakers', description: 'Zapatillas minimalistas de cuero blanco. Diseño limpio.', price: 120.0, originalPrice: null, categoryId: 'ropa', imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=800&fit=crop'], color: 'Blanco', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-minimalist', createdAt: '2024-03-20T10:00:00.000Z' },
    { id: 'dm5', name: 'Eau de Parfum', description: 'Fragancia minimalista con notas de cedro y sándalo.', price: 85.0, originalPrice: null, categoryId: 'otros', imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600', images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-minimalist', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dm6', name: 'Classic Watch', description: 'Reloj de diseño minimalista con correa de cuero.', price: 150.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-04-15T10:00:00.000Z' },
    { id: 'dm7', name: 'Sun Glasses', description: 'Lentes de sol con montura delgada. Estilo atemporal.', price: 65.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-05-01T10:00:00.000Z' },
    { id: 'dm8', name: 'Silver Necklace', description: 'Collar de plata con dije esencial. Sutil y elegante.', price: 75.0, originalPrice: null, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop'], color: 'Plata', stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-minimalist', createdAt: '2024-05-10T10:00:00.000Z' },
  ],
  bodega: [
    { id: 'db1', name: 'Arroz Extra Superior 5kg', description: 'Arroz extra de calidad superior, grano largo.', price: 24.9, originalPrice: 27.9, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-bodega', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'db2', name: 'Aceite Vegetal 1L', description: 'Aceite vegetal puro para cocinar.', price: 9.9, originalPrice: null, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600', images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-bodega', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'db3', name: 'Leche Evaporada 400g', description: 'Leche evaporada entera en lata.', price: 3.8, originalPrice: null, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-bodega', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'db4', name: 'Galletas de Soda', description: 'Paquete de galletas de soda crocantes.', price: 3.5, originalPrice: null, categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600', images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-bodega', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'db5', name: 'Café Molido 500g', description: 'Café molido peruano tostado medio.', price: 19.9, originalPrice: 22.9, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600', images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-bodega', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'db6', name: 'Atún en Agua 170g', description: 'Latas de atún en agua, fuente de proteína.', price: 6.9, originalPrice: null, categoryId: 'abarrotes', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600', images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-bodega', createdAt: '2024-04-15T10:00:00.000Z' },
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
    { id: 'dmf1', name: 'Vestido Midi Elegante', description: 'Vestido midi con corte fluido. Tela premium.', price: 119.0, originalPrice: null, categoryId: 'mujer', imageUrl: 'https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600', images: ['https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=600'], color: null, stock: -1, isActive: true, featured: true, rating: 5, storeId: 'demo-moda', createdAt: '2024-01-10T10:00:00.000Z' },
    { id: 'dmf2', name: 'Blazer Sastre', description: 'Blazer de corte sastre en tela importada.', price: 149.0, originalPrice: 179.0, categoryId: 'mujer', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600', images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'], color: 'Negro', stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-moda', createdAt: '2024-02-10T10:00:00.000Z' },
    { id: 'dmf3', name: 'Jean Mom Fit', description: 'Jean de talle alto con lavado clásico.', price: 89.9, originalPrice: null, categoryId: 'casual', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3824274d?w=600', images: ['https://images.unsplash.com/photo-1542272604-787c3824274d?w=600'], color: 'Azul', stock: -1, isActive: true, featured: true, rating: 4.5, storeId: 'demo-moda', createdAt: '2024-03-01T10:00:00.000Z' },
    { id: 'dmf4', name: 'Camisa de Lino', description: 'Camisa de lino fresca para verano.', price: 69.9, originalPrice: null, categoryId: 'hombre', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], color: 'Blanco', stock: -1, isActive: true, featured: false, rating: 4, storeId: 'demo-moda', createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'dmf5', name: 'Look Editorial Completo', description: 'Conjunto de temporada seleccionado por nuestros estilistas.', price: 199.0, originalPrice: null, categoryId: 'mujer', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'], color: null, stock: -1, isActive: true, featured: false, rating: 5, storeId: 'demo-moda', createdAt: '2024-04-01T10:00:00.000Z' },
    { id: 'dmf6', name: 'Bolso Tote Cuero', description: 'Bolso tote de cuero con acabado premium.', price: 99.9, originalPrice: 129.0, categoryId: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600'], color: 'Caramelo', stock: -1, isActive: true, featured: false, rating: 4.5, storeId: 'demo-moda', createdAt: '2024-04-15T10:00:00.000Z' },
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
    case 'moda': return 'Plan Premium'
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
    </div>
  )
}
