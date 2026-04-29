'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { CATEGORIES } from '@/lib/mock-data'
import { Search, Plus, Edit3, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function ProductList() {
  const { currentStore, products, navigate, deleteProduct } = useAppStore()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  if (!currentStore) return null

  const storeProducts = products.filter(
    (p) => p.storeId === currentStore.id && p.isActive && p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = () => {
    if (deleteTarget) {
      const product = products.find(p => p.id === deleteTarget)
      deleteProduct(deleteTarget)
      setDeleteTarget(null)
      toast.success('Producto eliminado', {
        description: product ? `"${product.name}" fue eliminado correctamente.` : 'El producto fue eliminado correctamente.',
      })
    }
  }

  const productToDelete = deleteTarget ? products.find(p => p.id === deleteTarget) : null

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">{storeProducts.length} productos en tu tienda</p>
        </div>
        <Button
          onClick={() => navigate({ page: 'dashboard-product-form' })}
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product Grid */}
      {storeProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No hay productos</h3>
            <p className="text-sm text-gray-400 mt-1">
              {search ? 'No se encontraron resultados para tu búsqueda.' : 'Agrega tu primer producto para comenzar.'}
            </p>
            {!search && (
              <Button
                onClick={() => navigate({ page: 'dashboard-product-form' })}
                className="mt-4 bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar producto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {storeProducts.map((product) => {
            const category = CATEGORIES.find((c) => c.id === product.categoryId)
            return (
              <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                <div className="h-44 bg-gray-100 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f3f0ff" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="40">📦</text></svg>' }}
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-bold text-violet-600">S/{product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">S/{product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  {category && (
                    <Badge variant="secondary" className="mt-2 text-xs">{category.name}</Badge>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ page: 'dashboard-product-form', productId: product.id })}
                      className="flex-1 text-violet-600 border-violet-200 hover:bg-violet-50 gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTarget(product.id)}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar <span className="font-semibold text-gray-900">{productToDelete?.name}</span>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
