'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Loader2,
  Upload,
  Package,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface StoreData {
  id: string;
  slug: string;
  categories: Category[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          const storeData = data.stores?.[0]?.store;
          if (storeData) {
            const storeRes = await fetch(`/api/stores/${storeData.slug}`);
            if (storeRes.ok) {
              const fullStore = await storeRes.json();
              setStore(fullStore);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setFetching(false);
      }
    }
    fetchStore();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          price: parseFloat(price),
          image: imageUrl,
          category: category || null,
          storeId: store?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al crear el producto');
        return;
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Package className="w-12 h-12 text-gray-300" />
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Agregar producto</h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input
                id="name"
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu producto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (S/) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {store.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagen del producto</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Subir</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar producto'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
