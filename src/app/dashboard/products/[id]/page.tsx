'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
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
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStoreCategories } from '@/lib/use-store-categories';
import { compressImage } from '@/lib/image-compress';
import { ColorPicker } from '@/components/dashboard/ColorPicker';
import { removeImageBackground } from '@/lib/background-remover';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { currentStore, products, syncFromAPI } = useAppStore();
  const baseCategories = useStoreCategories();

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
  const [stock, setStock] = useState(-1);
  const [featured, setFeatured] = useState(false);
  // rating: NO lo edita el dueño (lo ponen los clientes). Se conserva el valor existente.
  const [rating, setRating] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Cover image
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [removingBg, setRemovingBg] = useState(false);
  const [bgStatus, setBgStatus] = useState('');

  // Gallery images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Load product data
  useEffect(() => {
    async function fetchData() {
      try {
        // Try to get from Zustand store first
        let product = products.find((p) => p.id === productId);

        // If not found, try API
        if (!product) {
          const token = localStorage.getItem('tiendapp_token');
          const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
          const productRes = await fetch(`/api/store-products/${productId}`, { headers: authHeaders });
          if (productRes.ok) {
            const productData = await productRes.json();
            product = productData.data || productData;
          }
        }

        if (product) {
          setName(product.name || '');
          setDescription(product.description || '');
          setPrice(typeof product.price === 'object' ? String(product.price) : String(product.price || ''));
          setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
          // La categoría puede llegar de 2 formas: producto crudo de la API (campo
          // `category`) o del store de Zustand (mapeado como `categoryId`). Leer
          // ambas: antes solo se leía `categoryId`, que NO existe en la respuesta
          // de la API -> la categoría cargaba vacía y el guardado la borraba.
          const apiProduct = product as unknown as { category?: string };
          setCategory(apiProduct.category || product.categoryId || '');
          setColor(product.color || '');
          setFeatured(product.featured || false);
          setRating(product.rating || 0);
          setStock(product.stock !== undefined ? product.stock : -1);
          setIsActive(product.isActive !== false);
          setCoverPreview(product.imageUrl || null);
          setCurrentImageUrl(product.imageUrl || '');
          setExistingImages(Array.isArray(product.images) ? product.images : []);
        }
      } catch {
        // ignore
      } finally {
        setFetching(false);
      }
    }
    if (productId) fetchData();
  }, [productId, products]);

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
      return uploadData.url || uploadData.data?.url;
    }
    return null;
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Comprimir en el navegador: foto de celular pesada -> JPG liviano máx 1200px
    setCoverUploading(true);
    try {
      const optimized = await compressImage(file);
      setNewCoverFile(optimized);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(optimized);
    } finally {
      setCoverUploading(false);
    }
  };

  // Quita-fondos: IA 100% en el navegador (gratis). Funciona sobre la imagen
  // recién elegida o sobre la imagen actual del producto.
  const handleRemoveBackground = async () => {
    if (removingBg) return;
    setRemovingBg(true);
    setBgStatus('Preparando...');
    try {
      let source: Blob | null = newCoverFile;
      if (!source) {
        const res = await fetch(coverPreview || currentImageUrl);
        if (!res.ok) throw new Error('no-image');
        source = await res.blob();
      }
      const processed = await removeImageBackground(source, (stage, pct) => {
        setBgStatus(
          stage === 'download'
            ? pct == null || pct === 0
              ? 'Descargando modelo (solo la 1ra vez)...'
              : `Descargando modelo... ${pct}%`
            : 'Quitando fondo...'
        );
      });
      const file = new File([processed], 'producto-sin-fondo.png', { type: 'image/png' });
      setNewCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
      toast.success('Fondo quitado', { description: 'Guarda los cambios para aplicarla.' });
    } catch (err) {
      // Mostrar la CAUSA real: conexión (descarga del modelo), navegador sin
      // soporte WASM/canvas, o el detalle técnico si lo hay.
      const raw = err instanceof Error ? err.message : '';
      const m = raw.toLowerCase();
      let description = 'Revisa tu conexión e inténtalo de nuevo.';
      if (m.includes('fetch') || m.includes('network') || m.includes('load failed') || m.includes('importing a module') || m.includes('import')) {
        description = 'No se pudo descargar el modelo de IA (~65 MB la primera vez, luego queda en caché). Conéctate a WiFi y reintenta.';
      } else if (m.includes('bitmap') || m.includes('canvas') || m.includes('wasm') || m.includes('webassembly') || m.includes('worker')) {
        description = 'Tu navegador no es compatible con esta función. Ábrelo en Chrome actualizado.';
      } else if (raw) {
        description = raw;
      }
      toast.error('No se pudo quitar el fondo', { description, duration: 10000 });
      console.error('[BG-REMOVE]', err);
    } finally {
      setRemovingBg(false);
      setBgStatus('');
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const totalImages = existingImages.length + galleryFiles.length + newFiles.length;
    if (totalImages > 8) {
      setError('Máximo 8 imágenes adicionales en total');
      return;
    }
    setGalleryUploading(true);
    try {
      const optimized = await Promise.all(newFiles.map((f) => compressImage(f)));
      setGalleryFiles((prev) => [...prev, ...optimized]);
      optimized.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Opciones de categoría: las de la tienda + la actual del producto si fuera una vieja
  const categories =
    category && !baseCategories.includes(category) ? [category, ...baseCategories] : baseCategories;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    setLoading(true);
    try {
      const delToken = localStorage.getItem('tiendapp_token');
      const res = await fetch(`/api/store-products?id=${productId}`, {
        method: 'DELETE',
        headers: (delToken ? { Authorization: `Bearer ${delToken}` } : {}) as Record<string, string>,
      });
      if (res.ok) {
        toast.success('Producto eliminado');
        await syncFromAPI();
        router.push('/dashboard/products');
      } else {
        setError('Error al eliminar el producto');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload new cover if changed
      let imageUrl = currentImageUrl;
      if (newCoverFile) {
        setCoverUploading(true);
        const uploaded = await uploadImage(newCoverFile);
        setCoverUploading(false);
        if (!uploaded) {
          setError('Error al subir la imagen principal');
          setLoading(false);
          return;
        }
        imageUrl = uploaded;
      }

      // Upload new gallery images
      let newImageUrls: string[] = [];
      if (galleryFiles.length > 0) {
        setGalleryUploading(true);
        const uploadResults = await Promise.all(
          galleryFiles.map((file) => uploadImage(file))
        );
        newImageUrls = uploadResults.filter((url): url is string => url !== null);
        setGalleryUploading(false);
      }

      // Combine existing + new gallery images
      const allImages = [...existingImages, ...newImageUrls];

      // Update via /api/store-products PUT
      const updateToken = localStorage.getItem('tiendapp_token');
      const res = await fetch('/api/store-products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(updateToken ? { Authorization: `Bearer ${updateToken}` } : {} as Record<string, string>),
        },
        body: JSON.stringify({
          id: productId,
          name,
          description: description || '',
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          imageUrl,
          images: allImages,
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
        setError(data.error || 'Error al actualizar el producto');
        return;
      }

      toast.success('Producto actualizado', { description: `"${name}" fue actualizado correctamente.` });
      await syncFromAPI();
      router.push('/dashboard/products');
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

  if (!name && !fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Package className="w-12 h-12 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">Producto no encontrado</h2>
        <Link href="/dashboard/products">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            Volver a productos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
          <Trash2 className="w-4 h-4 mr-1" />
          Eliminar
        </Button>
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
                      <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <Button variant="destructive" size="sm" className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0" onClick={() => { setNewCoverFile(null); setCoverPreview(null); }}>×</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Portada</span>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
                  </label>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Recomendado: <span className="font-medium text-gray-500">800×800 px (cuadrada) u 800×1000 px (vertical)</span>.
                    La foto se optimiza sola para que pese poco y cargue rápido.
                  </p>
                  {(coverPreview || currentImageUrl) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveBackground}
                      disabled={removingBg}
                      className="mt-2 gap-1.5 text-xs"
                    >
                      {removingBg ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      )}
                      {removingBg ? (bgStatus || 'Procesando...') : 'Quitar fondo (gratis)'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <Label>Imágenes adicionales (máximo 8)</Label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={img} alt={`Galería ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <Button variant="destructive" size="sm" className="absolute -top-1 -right-1 w-4 h-4 rounded-full p-0 text-[10px]" onClick={() => removeExistingImage(idx)}>×</Button>
                  </div>
                ))}
                {galleryPreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={preview} alt={`Nueva ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <Button variant="destructive" size="sm" className="absolute -top-1 -right-1 w-4 h-4 rounded-full p-0 text-[10px]" onClick={() => removeGalleryImage(idx)}>×</Button>
                  </div>
                ))}
                {existingImages.length + galleryFiles.length < 8 && (
                  <label className="cursor-pointer">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50 transition-colors">
                      <Plus className="w-5 h-5 text-gray-400" />
                      <span className="text-[9px] text-gray-400 mt-0.5">Agregar</span>
                    </div>
                    <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleGalleryChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input id="name" placeholder="Nombre del producto" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Describe tu producto..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Tip: escribe especificaciones una por línea y tu tienda las mostrará como ficha técnica — ej: <span className="text-gray-500 font-medium">Material: acero inoxidable · Talla: M · Incluye: caja de regalo</span>
              </p>
            </div>

            {/* Price & Original Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (S/) *</Label>
                <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Precio anterior (S/)</Label>
                <Input id="originalPrice" type="number" step="0.01" min="0" placeholder="0.00 (opcional)" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
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
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-400">
                  Las primeras son las que creaste en <span className="font-medium">Categorías</span>.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color / Variante</Label>
                <ColorPicker id="color" value={color} onChange={setColor} />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock / Inventario</Label>
              <div className="flex items-center gap-3">
                <Input id="stock" type="number" min="-1" placeholder="-1 = Sin límite" value={stock} onChange={(e) => { const n = parseInt(e.target.value, 10); setStock(Number.isNaN(n) ? -1 : n); }} className="w-32" />
                <span className="text-xs text-gray-400">
                  {stock === -1 ? 'Sin límite' : stock === 0 ? 'Agotado' : `${stock} unidades`}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">-1 = sin límite, 0 = agotado, número positivo = unidades disponibles</p>
            </div>

            {/* Rating: lo ponen los clientes, el dueño no lo edita. Se conserva el valor existente. */}

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
                  {coverUploading ? 'Subiendo imagen principal...' : galleryUploading ? 'Subiendo imágenes...' : 'Guardando...'}
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
