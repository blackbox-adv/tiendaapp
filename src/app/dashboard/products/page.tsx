'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  RefreshCw,
  Loader2,
  Package,
  Edit,
  Trash2,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { currentStore, products, syncFromAPI } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Sync products from API on mount
  useEffect(() => {
    async function init() {
      if (products.length === 0) {
        await syncFromAPI();
      }
      setLoading(false);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    setDeleting(productId);
    try {
      const token = localStorage.getItem('tiendapp_token');
      const res = await fetch(`/api/store-products?id=${productId}`, {
        method: 'DELETE',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
      });
      if (res.ok) {
        await syncFromAPI();
        toast.success('Producto eliminado');
      } else {
        toast.error('Error al eliminar el producto');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await syncFromAPI();
    setLoading(false);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Package className="w-12 h-12 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">No tienes tienda</h2>
        <p className="text-gray-500">Crea tu tienda primero para agregar productos</p>
        <Link href="/onboarding">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            Crear tienda
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Link href="/dashboard/products/new">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Agregar producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Package className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700">
            {search ? 'No se encontraron productos' : 'No hay productos aún'}
          </h3>
          <p className="text-gray-400 text-sm">
            {search
              ? 'Intenta con otro término de búsqueda'
              : 'Agrega tu primer producto para comenzar a vender'}
          </p>
          {!search && (
            <Link href="/dashboard/products/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Agregar producto
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const totalImages = (product.images?.length || 0) + (product.imageUrl ? 1 : 0);
            const priceNum = Number(product.price);
            const origPrice = product.originalPrice ? Number(product.originalPrice) : null;

            return (
              <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 rounded-t-lg relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  {product.categoryId && (
                    <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700 text-[10px]">
                      {product.categoryId}
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] border-0">
                      Destacado
                    </Badge>
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                      <Badge className="bg-gray-800 text-white text-xs">Inactivo</Badge>
                    </div>
                  )}
                  {totalImages > 1 && (
                    <Badge className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] border-0">
                      {totalImages} fotos
                    </Badge>
                  )}
                  {origPrice && origPrice > priceNum && (
                    <Badge className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] border-0">
                      -{Math.round((1 - priceNum / origPrice) * 100)}%
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {product.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">{product.rating}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: product.color.toLowerCase() }}
                        />
                        <span className="text-xs text-gray-500">{product.color}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="font-bold text-violet-600">
                        S/ {priceNum.toFixed(2)}
                      </span>
                      {origPrice && origPrice > priceNum && (
                        <span className="text-xs text-gray-400 line-through ml-1">
                          S/ {origPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/dashboard/products/${product.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                      >
                        {deleting === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
