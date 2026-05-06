'use client'

import { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
const CATEGORIES = [
  { id: 'ropa', name: 'Ropa' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'electronica', name: 'Electronica' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'belleza', name: 'Belleza' },
  { id: 'deportes', name: 'Deportes' },
  { id: 'alimentos', name: 'Alimentos' },
  { id: 'juguetes', name: 'Juguetes' },
  { id: 'otros', name: 'Otros' },
]
import { ArrowLeft, Save, Star, Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function ProductForm({ productId }: { productId?: string }) {
  const { currentStore, products, navigate, addProduct, updateProduct } = useAppStore()

  const isEditing = !!productId
  const editProduct = useMemo(
    () => (productId ? products.find((p) => p.id === productId) : undefined),
    [productId, products]
  )

  const formDefaults = useMemo(() => {
    if (!editProduct) return { name: '', description: '', price: '', originalPrice: '', categoryId: '', imageUrl: '', featured: false, rating: 0 }
    return {
      name: editProduct.name,
      description: editProduct.description,
      price: editProduct.price.toString(),
      originalPrice: editProduct.originalPrice?.toString() || '',
      categoryId: editProduct.categoryId,
      imageUrl: editProduct.imageUrl,
      featured: editProduct.featured,
      rating: editProduct.rating,
    }
  }, [editProduct])

  const [name, setName] = useState(formDefaults.name)
  const [description, setDescription] = useState(formDefaults.description)
  const [price, setPrice] = useState(formDefaults.price)
  const [originalPrice, setOriginalPrice] = useState(formDefaults.originalPrice)
  const [categoryId, setCategoryId] = useState(formDefaults.categoryId)
  const [imageUrl, setImageUrl] = useState(formDefaults.imageUrl)
  const [featured, setFeatured] = useState(formDefaults.featured)
  const [rating, setRating] = useState(formDefaults.rating)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'El nombre es obligatorio'
    if (!description.trim()) errs.description = 'La descripción es obligatoria'
    if (!price || parseFloat(price) <= 0) errs.price = 'El precio debe ser mayor a 0'
    if (!categoryId) errs.categoryId = 'Selecciona una categoría'
    if (!imageUrl.trim()) errs.imageUrl = 'La URL de la imagen es obligatoria'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !currentStore) return

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      categoryId,
      imageUrl: imageUrl.trim(),
      isActive: true,
      featured,
      rating,
      storeId: currentStore.id,
    }

    if (isEditing && productId) {
      await updateProduct(productId, productData)
      toast.success('Producto actualizado', {
        description: `"${name.trim()}" fue actualizado correctamente.`,
      })
    } else {
      await addProduct(productData)
      toast.success('Producto creado', {
        description: `"${name.trim()}" fue agregado a tu tienda.`,
      })
    }

    navigate({ page: 'dashboard-products' })
  }

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, imageUrl: 'Solo se permiten JPG, PNG, WebP y GIF' }))
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: 'La imagen no debe superar los 5MB' }))
      return
    }

    setUploading(true)
    setErrors(prev => ({ ...prev, imageUrl: '' }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('tiendapp_token')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          setImageUrl(data.url)
        } else {
          setErrors(prev => ({ ...prev, imageUrl: 'No se recibió la URL de la imagen' }))
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setErrors(prev => ({ ...prev, imageUrl: data.error || 'Error al subir la imagen' }))
      }
    } catch {
      setErrors(prev => ({ ...prev, imageUrl: 'Error de conexión al subir' }))
    } finally {
      setUploading(false)
    }
  }, [])

  const sampleImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
  ]

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate({ page: 'dashboard-products' })} size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEditing ? 'Modifica los datos del producto' : 'Agrega un producto a tu tienda'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label>Nombre del producto *</Label>
              <Input
                placeholder="Ej: Vestido Floral de Verano"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea
                placeholder="Describe tu producto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio (S/) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="89.90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label>Precio anterior (S/)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="129.90 (opcional)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
            </div>

            {/* Image Upload & URL */}
            <div className="space-y-3">
              <Label>Imagen del producto *</Label>

              {/* Upload area */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-violet-300 hover:bg-violet-50/30 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-upload"
                />
                <label
                  htmlFor="product-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                      <p className="text-sm text-gray-500">Subiendo imagen...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Haz clic para subir una imagen</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP o GIF. Máximo 5MB</p>
                        <p className="text-xs text-violet-500 mt-1 font-medium">Recomendado: 800 × 800 px (cuadrada) ó 800 × 1000 px (vertical)</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* Or separator */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">o pega una URL</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* URL input */}
              <div className="relative">
                <Input
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="pr-10"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
              {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl}</p>}

              {/* Sample images */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Imágenes de ejemplo:</p>
                <div className="flex gap-2 flex-wrap">
                  {sampleImages.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setImageUrl(url)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        imageUrl === url ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <img src={url} alt="Ejemplo" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-56 bg-gray-50">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 h-56 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-300">
                <ImageIcon className="w-10 h-10" />
                <p className="text-sm">Vista previa de la imagen</p>
              </div>
            )}

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div>
                <Label className="text-sm font-semibold text-gray-900">Producto destacado</Label>
                <p className="text-xs text-gray-500 mt-0.5">Los productos destacados aparecen primero en tu tienda</p>
              </div>
              <Switch
                checked={featured}
                onCheckedChange={setFeatured}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Valoración</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  {rating > 0 ? `${rating} de 5 estrellas` : 'Sin valoración'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ page: 'dashboard-products' })}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Save className="w-4 h-4" />
                {isEditing ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
