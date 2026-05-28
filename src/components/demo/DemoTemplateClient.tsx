'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowLeft,
  ChevronRight,
  Store,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface StoreData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  template: string;
  logo: string | null;
  banner: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isDemo: boolean;
  products: Product[];
  categories: Category[];
}

interface DemoTemplateClientProps {
  slug: string;
}

const templateStyles: Record<string, {
  primary: string;
  gradient: string;
  cardBg: string;
  textAccent: string;
  badge: string;
  heroOverlay: string;
}> = {
  moderna: {
    primary: 'bg-violet-600',
    gradient: 'from-violet-600 to-purple-800',
    cardBg: 'bg-white',
    textAccent: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    heroOverlay: 'from-violet-900/80',
  },
  vibrante: {
    primary: 'bg-rose-500',
    gradient: 'from-rose-500 to-orange-500',
    cardBg: 'bg-white',
    textAccent: 'text-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    heroOverlay: 'from-rose-900/80',
  },
  clasica: {
    primary: 'bg-amber-700',
    gradient: 'from-amber-700 to-amber-900',
    cardBg: 'bg-amber-50/50',
    textAccent: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    heroOverlay: 'from-amber-950/80',
  },
  luxury: {
    primary: 'bg-zinc-900',
    gradient: 'from-zinc-900 to-zinc-800',
    cardBg: 'bg-zinc-50',
    textAccent: 'text-zinc-800',
    badge: 'bg-zinc-200 text-zinc-800',
    heroOverlay: 'from-zinc-950/80',
  },
  minimalist: {
    primary: 'bg-stone-600',
    gradient: 'from-stone-500 to-stone-700',
    cardBg: 'bg-white',
    textAccent: 'text-stone-600',
    badge: 'bg-stone-100 text-stone-700',
    heroOverlay: 'from-stone-900/70',
  },
};

const placeholderImages = [
  'https://placehold.co/400x400/f3e8ff/7c3aed?text=Producto+1',
  'https://placehold.co/400x400/ffe4e6/e11d48?text=Producto+2',
  'https://placehold.co/400x400/ecfdf5/059669?text=Producto+3',
  'https://placehold.co/400x400/fff7ed/ea580c?text=Producto+4',
  'https://placehold.co/400x400/e0f2fe/0284c7?text=Producto+5',
  'https://placehold.co/400x400/fef3c7/d97706?text=Producto+6',
];

export default function DemoTemplateClient({ slug }: DemoTemplateClientProps) {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStore() {
      try {
        setLoading(true);
        const res = await fetch(`/api/stores/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Tienda no encontrada');
          } else {
            setError('Error al cargar la tienda');
          }
          return;
        }
        const data = await res.json();
        setStore(data);
      } catch {
        setError('Error de conexión al cargar la tienda');
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
          <p className="text-gray-500 text-sm">Cargando tienda demo...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Store className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            {error || 'Tienda no encontrada'}
          </h2>
          <p className="text-gray-500 text-sm">
            La tienda que buscas no existe o ha sido eliminada.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const style = templateStyles[store.template] || templateStyles.moderna;
  const filteredProducts = activeCategory
    ? store.products.filter((p) => p.category === activeCategory)
    : store.products;

  const bannerGradient = `bg-gradient-to-br ${style.gradient}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-amber-500 text-amber-950 text-center py-1.5 px-4 text-xs font-medium">
        🎉 Estás viendo una tienda de demostración —{' '}
        <Link href="/" className="underline font-semibold">
          Crea tu propia tienda gratis
        </Link>
      </div>

      {/* Hero / Store Header */}
      <div className={`relative ${bannerGradient} text-white`}>
        <div className="absolute inset-0 bg-gradient-to-t ${style.heroOverlay} to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <Link
            href="/#plantillas"
            className="inline-flex items-center text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a plantillas
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">{store.name}</h1>
              <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-0">
                Plantilla: {store.template.charAt(0).toUpperCase() + store.template.slice(1)}
              </Badge>
            </div>
          </div>
          {store.description && (
            <p className="text-white/80 text-lg max-w-2xl">{store.description}</p>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            className={`shrink-0 ${activeCategory === null ? style.primary : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            Todos
          </Button>
          {store.categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.name ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 ${activeCategory === cat.name ? style.primary : ''}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              className={`group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 ${style.cardBg}`}
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img
                  src={placeholderImages[index % placeholderImages.length]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.category && (
                  <Badge className={`absolute top-2 left-2 text-[10px] ${style.badge}`}>
                    {product.category}
                  </Badge>
                )}
              </div>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-gray-800 line-clamp-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className={`font-bold text-lg ${style.textAccent}`}>
                    S/ {product.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    className={`${style.primary} text-white h-8 w-8 p-0 rounded-full`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">No hay productos en esta categoría</p>
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Información de la tienda</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <p className="font-medium text-sm">{store.whatsapp}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
              )}
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-sm">{store.phone}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
              )}
              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-sm">{store.email}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
              )}
              {store.address && (
                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium text-sm">{store.address}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Banner */}
      <div className={`${bannerGradient} text-white py-12`}>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">¿Te gusta esta plantilla?</h3>
          <p className="text-white/80 mb-6">
            Crea tu tienda online con esta plantilla en minutos
          </p>
          <Link href="/">
            <Button size="lg" className="bg-white text-violet-700 hover:bg-gray-100 font-semibold">
              <Star className="w-5 h-5 mr-2" />
              Comenzar gratis
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm">
            © 2026 TiendApp. Todos los derechos reservados. Hecho con ❤️ en Perú.
          </p>
        </div>
      </footer>
    </div>
  );
}
