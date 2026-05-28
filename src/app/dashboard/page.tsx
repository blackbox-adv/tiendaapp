'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Package,
  FolderOpen,
  Palette,
  ExternalLink,
  Plus,
  RefreshCw,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface StoreData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  template: string;
  logo: string | null;
  _count?: {
    products: number;
    categories: number;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: string;
  onboardingDone: boolean;
  stores: { store: StoreData }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        setError('Error al cargar los datos');
        return;
      }
      const data = await res.json();
      setUserData(data);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={fetchUserData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  const store = userData?.stores?.[0]?.store as StoreData | undefined;

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
          <Store className="w-8 h-8 text-violet-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido a TiendApp!</h2>
        <p className="text-gray-500 max-w-md">
          Aún no tienes una tienda. Crea tu primera tienda online en minutos.
        </p>
        <Link href="/onboarding">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Crear mi tienda
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de control</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenido, {session?.user?.name || 'Usuario'}
        </p>
      </div>

      {/* Store Info Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <Store className="w-7 h-7 text-violet-600" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">{store.name}</h2>
                <p className="text-gray-500 text-sm">
                  Plantilla: <span className="capitalize">{store.template}</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  tienda.blackboxperu.com/store/{store.slug}
                </p>
              </div>
            </div>
            <Link href={`/store/${store.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver tienda
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{store._count?.products ?? 0}</p>
                <p className="text-gray-500 text-xs">Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{store._count?.categories ?? 0}</p>
                <p className="text-gray-500 text-xs">Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/products/new">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Agregar producto</p>
                  <p className="text-gray-400 text-xs">Añade un nuevo producto</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/template">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Cambiar plantilla</p>
                  <p className="text-gray-400 text-xs">Personaliza el diseño</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href={`/store/${store.slug}`} target="_blank">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Ver mi tienda</p>
                  <p className="text-gray-400 text-xs">Vista pública</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
