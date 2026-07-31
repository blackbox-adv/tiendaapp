'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  X,
  ImageIcon,
  Star,
  Plus,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

interface StoreData {
  id: string;
  slug: string;
  name: string;
  categories: Category[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState(-1); // -1 = unlimited
  const [featured, setFeatured] = useState(false);
  const [rating, setRating] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  // Additional images (gallery)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchStore() {
      try {
        const token = localStorage.getItem('tiendapp_token');
        const res = await fetch('/api/user', {
          headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
        });
        if (res.ok) {
          const data = await res.json();
          const storeData = data.stores?.[0]?.store;
          if (storeData) {
            const storeRes = await fetch(`/api/stores/${storeData.slug}`, {
              headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
            });
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

  // Upload a single file to /api/upload
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');
    const token = localStorage.getItem('tiendapp_token');
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
      body: formData,
    });
    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      return uploadData.url;
    }
    return null;
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    if (galleryFiles.length + newFiles.length > 8) {
      setError('Máximo 8 imágenes adicionales');
      return;
    }
    setGalleryFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload cover image
      let imageUrl: string | null = null;
      if (coverFile) {
        setCoverUploading(true);
        imageUrl = await uploadImage(coverFile);
        setCoverUploading(false);
        if (!imageUrl) {
          setError('Error al subir la imagen principal');
          setLoading(false);
          return;
        }
      }

      // Upload gallery images
      let images: string[] = [];
      if (galleryFiles.length > 0) {
        setGalleryUploading(true);
        const uploadResults = await Promise.all(
          galleryFiles.map((file) => uploadImage(file))
        );
        images = uploadResults.filter((url): url is string => url !== null);
        setGalleryUploading(false);
        if (images.length !== galleryFiles.length) {
          setError('Algunas imágenes no se pudieron subir');
          setLoading(false);
          return;
        }
      }

      // Create product via /api/store-products
      const authToken = localStorage.getItem('tiendapp_token');
      const res = await fetch('/api/store-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {} as Record<string, string>),
        },
        body: JSON.stringify({
          storeId: store?.id,
          name,
          description: description || '',
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          imageUrl: imageUrl || '',
          images,
          category: category || '',
          color: color || null,
          stock,
          isActive,
          featured,
          rating,
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Imagen principal</Label>
              <div className="flex items-center gap-4">
                {coverPreview ? (
                  <div className="relative">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={coverPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Portada</span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <Label>Imágenes adicionales (máximo 8)</Label>
              <div className="flex flex-wrap gap-2">
                {galleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt={`Galería ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full p-0 text-[10px]"
                      onClick={() => removeGalleryImage(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {galleryPreviews.length < 8 && (
                  <label className="cursor-pointer">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50 transition-colors">
                      <Plus className="w-5 h-5 text-gray-400" />
                      <span className="text-[9px] text-gray-400 mt-0.5">Agregar</span>
                    </div>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleGalleryChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name */}
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

            {/* Description */}
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

            {/* Price & Original Price */}
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
                <Label htmlFor="originalPrice">Precio anterior (S/)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00 (opcional)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
                <p className="text-[11px] text-gray-400">Se mostrará como descuento</p>
              </div>
            </div>

            {/* Category & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {store.categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {/* Fallback if no categories from DB */}
                    {(!store.categories || store.categories.length === 0) && (
                      <>
                        <SelectItem value="Ropa">Ropa</SelectItem>
                        <SelectItem value="Accesorios">Accesorios</SelectItem>
                        <SelectItem value="Electrónica">Electrónica</SelectItem>
                        <SelectItem value="Hogar">Hogar</SelectItem>
                        <SelectItem value="Belleza">Belleza</SelectItem>
                        <SelectItem value="Deportes">Deportes</SelectItem>
                        <SelectItem value="Alimentos">Alimentos</SelectItem>
                        <SelectItem value="Otros">Otros</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color / Variante</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    placeholder="Ej: Rojo, Azul..."
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1"
                  />
                  {color && (
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock / Inventario</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="stock"
                  type="number"
                  min="-1"
                  placeholder="-1 = Sin límite"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || -1)}
                  className="w-32"
                />
                <span className="text-xs text-gray-400">
                  {stock === -1 ? 'Sin límite' : stock === 0 ? 'Agotado' : `${stock} unidades`}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">-1 = sin límite, 0 = agotado, número positivo = unidades disponibles</p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Calificación</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? 0 : star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm text-gray-500 ml-2">{rating}.0</span>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Producto destacado</Label>
                  <p className="text-[11px] text-gray-400">Se mostrará con badge especial</p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Producto activo</Label>
                  <p className="text-[11px] text-gray-400">Los inactivos no se muestran en la tienda</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading || coverUploading || galleryUploading}
            >
              {loading || coverUploading || galleryUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {coverUploading
                    ? 'Subiendo imagen principal...'
                    : galleryUploading
                    ? 'Subiendo imágenes...'
                    : 'Guardando...'}
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
