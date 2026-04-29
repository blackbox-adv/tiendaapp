'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { CATEGORIES } from '@/lib/mock-data'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

export function ProductForm({ productId }: { productId?: string }) {
  const { currentStore, products, navigate, addProduct, updateProduct } = useAppStore()

  const isEditing = !!productId
  const editProduct = useMemo(
    () => (productId ? products.find((p) => p.id === productId) : undefined),
    [productId, products]
  )

  const formDefaults = useMemo(() => {
    if (!editProduct) return { name: '', description: '', price: '', originalPrice: '', categoryId: '', imageUrl: '' }
    return {
      name: editProduct.name,
      description: editProduct.description,
      price: editProduct.price.toString(),
      originalPrice: editProduct.originalPrice?.toString() || '',
      categoryId: editProduct.categoryId,
      imageUrl: editProduct.imageUrl,
    }
  }, [editProduct])

  const [name, setName] = useState(formDefaults.name)
  const [description, setDescription] = useState(formDefaults.description)
  const [price, setPrice] = useState(formDefaults.price)
  const [originalPrice, setOriginalPrice] = useState(formDefaults.originalPrice)
  const [categoryId, setCategoryId] = useState(formDefaults.categoryId)
  const [imageUrl, setImageUrl] = useState(formDefaults.imageUrl)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleSubmit = (e: React.FormEvent) => {
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
      storeId: currentStore.id,
    }

    if (isEditing && productId) {
      updateProduct(productId, productData)
    } else {
      addProduct(productData)
    }

    navigate({ page: 'dashboard-products' })
  }

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
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar categoría...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label>URL de la imagen *</Label>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl}</p>}
              <p className="text-xs text-gray-400">Pega una URL de imagen o elige una de ejemplo:</p>
              <div className="flex gap-2 flex-wrap">
                {sampleImages.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setImageUrl(url)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      imageUrl === url ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <img src={url} alt="Ejemplo" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 h-48 bg-gray-50">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}

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
