'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  Loader2,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface StoreData {
  id: string;
  slug: string;
  categories: Category[];
}

export default function CategoriesPage() {
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchStore = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        setError('Error al cargar las categorías');
        return;
      }
      const data = await res.json();
      const storeData = data.stores?.[0]?.store;
      if (storeData) {
        const storeRes = await fetch(`/api/stores/${storeData.slug}`);
        if (storeRes.ok) {
          const fullStore = await storeRes.json();
          setStore(fullStore);
        }
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !store) return;
    setCreating(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          storeId: store.id,
        }),
      });

      if (res.ok) {
        setNewCatName('');
        fetchStore();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (catId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    setDeleting(catId);
    try {
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        setStore((prev) =>
          prev
            ? { ...prev, categories: prev.categories.filter((c) => c.id !== catId) }
            : null
        );
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

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
        <Button variant="outline" onClick={fetchStore}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <FolderOpen className="w-12 h-12 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">No tienes tienda</h2>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <p className="text-gray-500 text-sm mt-1">
          Organiza tus productos en categorías
        </p>
      </div>

      {/* Create Category */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleCreate} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Nombre de la categoría"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                disabled={creating}
              />
            </div>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              disabled={creating || !newCatName.trim()}
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      {store.categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700">No hay categorías</h3>
          <p className="text-gray-400 text-sm">
            Crea tu primera categoría para organizar tus productos
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {store.categories.map((cat) => (
            <Card key={cat.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-medium text-gray-900">{cat.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deleting === cat.id}
                >
                  {deleting === cat.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
