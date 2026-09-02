'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { downloadExport, PlanRequiredError } from '@/lib/export-client';
import { createDemoProducts } from '@/lib/demo-products';
import { getRubro } from '@/lib/rubros';
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
  Eye,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface StoreData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  template: string;
  logo: string | null;
  category?: string;
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
  const { currentUser } = useAppStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [analytics, setAnalytics] = useState<{
    products: { total: number; active: number; outOfStock: number };
    orders: { total: number; totalRevenue: number; byStatus: Record<string, number> };
    visits: { total: number };
  } | null>(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('tiendapp_token');
      const res = await fetch('/api/user', {
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
      });
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

  const handleExportSales = async () => {
    const storeData = (userData?.stores?.[0]?.store ?? userData?.stores?.[0]) as StoreData | undefined;
    if (!storeData?.id) return;
    setExporting(true);
    try {
      await downloadExport('sales', storeData.id);
      toast.success('Reporte descargado', { description: 'Incluye resumen, ventas por día y productos más vendidos.' });
    } catch (err) {
      if (err instanceof PlanRequiredError) {
        toast.error('Función Pro', {
          description: err.message,
          duration: 8000,
          action: {
            label: 'Ver planes',
            onClick: () => {
              window.location.href = '/dashboard/plan';
            },
          },
        });
      } else {
        toast.error(err instanceof Error ? err.message : 'Error al descargar el reporte');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleLoadDemoProducts = async () => {
    const storeData = (userData?.stores?.[0]?.store ?? userData?.stores?.[0]) as (StoreData & { category?: string }) | undefined;
    if (!storeData?.id) return;
    setLoadingDemo(true);
    try {
      const created = await createDemoProducts(storeData.id, storeData.category);
      if (created > 0) {
        toast.success(`${created} productos de ejemplo cargados`, { description: 'Edítalos o bórralos cuando quieras desde Productos.' });
        await fetchUserData();
      } else {
        toast.error('No se pudieron cargar los productos de ejemplo');
      }
    } catch {
      toast.error('Error al cargar los productos de ejemplo');
    } finally {
      setLoadingDemo(false);
    }
  };

  // Fetch analytics when store is available
  // La API /api/user devuelve objetos planos (stores[0] = store), no anidados
  useEffect(() => {
    const storeData = userData?.stores?.[0] as StoreData | undefined;
    if (storeData?.id) {
      const analyticsToken = localStorage.getItem('tiendapp_token');
      fetch(`/api/analytics?storeId=${storeData.id}`, {
        headers: (analyticsToken ? { Authorization: `Bearer ${analyticsToken}` } : {}) as Record<string, string>,
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          // /api/analytics devuelve el objeto plano (apiSuccess NO envuelve en .data).
          // Aceptamos ambas formas por compatibilidad.
          const payload = data?.data ?? data;
          if (payload?.orders && payload?.products) setAnalytics(payload);
        })
        .catch(() => {});
    }
  }, [userData]);

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

  // La API /api/user devuelve la tienda plana en stores[0] (con .store indiferido por compat)
  const store = (userData?.stores?.[0]?.store ?? userData?.stores?.[0]) as StoreData | undefined;

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
          Bienvenido, {currentUser?.name || 'Usuario'}
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

      {/* Empty store → cargar productos de ejemplo del rubro */}
      {analytics && analytics.products.total === 0 && (
        <Card className="border border-dashed border-violet-300 bg-violet-50/50">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm text-gray-900">
                Tu tienda está vacía — ¿empezamos con productos de ejemplo?
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Carga productos de ejemplo del rubro "{getRubro(store.category).name}" con precios
                de referencia para que veas tu tienda como quedaría.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleLoadDemoProducts}
              disabled={loadingDemo}
            >
              {loadingDemo ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Cargar productos de ejemplo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.products?.total ?? store._count?.products ?? 0}</p>
                <p className="text-gray-500 text-xs">Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.visits?.total ?? 0}</p>
                <p className="text-gray-500 text-xs">Visitas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <Link href="/dashboard/orders" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.orders?.total ?? 0}</p>
                <p className="text-gray-500 text-xs group-hover:text-violet-600 transition-colors">Pedidos →</p>
              </div>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">S/ {analytics ? Number(analytics.orders.totalRevenue).toFixed(0) : '0'}</p>
                <p className="text-gray-500 text-xs">Ingresos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales report (Excel) */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900 flex items-center gap-2">
                Reporte de ventas en Excel
                {(currentUser?.planId ?? 'free') === 'free' && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">PRO</Badge>
                )}
              </p>
              <p className="text-gray-400 text-xs">
                Resumen, ventas por día y productos más vendidos
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportSales} disabled={exporting}>
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Descargar Excel
          </Button>
        </CardContent>
      </Card>

      {/* Alerts */}
      {analytics && (analytics.products.outOfStock > 0 || analytics.orders.byStatus?.pending > 0) && (
        <div className="flex flex-wrap gap-2">
          {analytics.products.outOfStock > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 py-1 px-3">
              <AlertTriangle className="w-3 h-3" />
              {analytics.products.outOfStock} producto{analytics.products.outOfStock > 1 ? 's' : ''} agotado{analytics.products.outOfStock > 1 ? 's' : ''}
            </Badge>
          )}
          {analytics?.orders?.byStatus?.pending > 0 && (
            <Link href="/dashboard/orders">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 py-1 px-3 cursor-pointer hover:bg-amber-100">
                <ShoppingCart className="w-3 h-3" />
                {analytics.orders.byStatus.pending} pedido{analytics.orders.byStatus.pending > 1 ? 's' : ''} pendiente{analytics.orders.byStatus.pending > 1 ? 's' : ''} — ver pedidos
              </Badge>
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Link href="/dashboard/orders">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Ver pedidos</p>
                  <p className="text-gray-400 text-xs">Gestiona lo que te piden</p>
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
