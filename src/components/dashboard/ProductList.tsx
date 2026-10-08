'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Search, Plus, Edit3, Trash2, Package, Download, Upload, Crown, LayoutGrid, List as ListIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { PLAN_BY_TYPE } from '@/lib/plans'

export function ProductList() {
  const { currentStore, products, deleteProduct } = useAppStore()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  // Import/Export CSV: función de planes de pago (Pro / Premium)
  const planId = (currentStore?.planId || '').toLowerCase()
  const isPaidPlan = planId === 'premium' || planId === 'pro'

  if (!currentStore) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-10 max-w-md rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
              <Skeleton className="h-44 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const storeProducts = products.filter(
    (p) => p.storeId === currentStore.id && p.isActive && p.name.toLowerCase().includes(search.toLowerCase())
  )

  // Límite de productos del plan actual (6 en Gratis, 50 en Pro, ∞ en Premium)
  const planType = (currentStore.planId || 'free').toLowerCase()
  const maxProducts = PLAN_BY_TYPE[planType]?.maxProducts ?? 6
  const totalActiveProducts = products.filter((p) => p.storeId === currentStore.id && p.isActive).length
  const atLimit = maxProducts !== -1 && totalActiveProducts >= maxProducts

  const handleDelete = async () => {
    if (deleteTarget) {
      const product = products.find(p => p.id === deleteTarget)
      try {
        const token = localStorage.getItem('tiendapp_token')
        const res = await fetch(`/api/store-products?id=${deleteTarget}`, {
          method: 'DELETE',
          headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
        })
        if (res.ok) {
          deleteProduct(deleteTarget)
          toast.success('Producto eliminado', {
            description: product ? `"${product.name}" fue eliminado correctamente.` : 'El producto fue eliminado correctamente.',
          })
        } else {
          toast.error('Error al eliminar el producto')
        }
      } catch {
        toast.error('Error de conexión')
      }
      setDeleteTarget(null)
    }
  }

  const productToDelete = deleteTarget ? products.find(p => p.id === deleteTarget) : null

  const authHeader = () => {
    const t = localStorage.getItem('tiendapp_token')
    return (t ? { Authorization: `Bearer ${t}` } : {}) as Record<string, string>
  }

  const upsellCsv = () => {
    toast.error('Función de planes de pago', {
      description: 'Importa y exporta tu catálogo con Excel o Google Sheets en los planes Pro o Premium.',
      action: { label: 'Ver planes', onClick: () => router.push('/dashboard/plan') },
    })
  }

  const handleDownloadCsv = async (template = false) => {
    if (!isPaidPlan) { upsellCsv(); return }
    if (!currentStore) return
    try {
      const url = `/api/store-products/export?storeId=${currentStore.id}${template ? '&template=1' : ''}`
      const res = await fetch(url, { headers: authHeader() })
      if (!res.ok) {
        toast.error('No se pudo descargar el CSV')
        return
      }
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = template ? 'plantilla-productos-kyllari.csv' : `productos-${currentStore.slug}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(a.href)
      toast.success(template ? 'Plantilla descargada' : 'Catálogo descargado', {
        description: 'Ábrelo con Excel o Google Sheets, edítalo y vuélvelo a subir.',
      })
    } catch {
      toast.error('Error de conexión')
    }
  }

  const handleImport = async () => {
    if (!importFile || !currentStore) return
    setImporting(true)
    try {
      const fd = new FormData()
      fd.append('storeId', currentStore.id)
      fd.append('file', importFile)
      const res = await fetch('/api/store-products/import', {
        method: 'POST',
        headers: authHeader(),
        body: fd,
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.success) {
        toast.success('Importación completada', {
          description: `${data.created} creados · ${data.updated} actualizados${data.skipped ? ` · ${data.skipped} omitidos` : ''}`,
        })
        setImportOpen(false)
        setImportFile(null)
        setTimeout(() => window.location.reload(), 1400)
      } else {
        toast.error(data?.error || 'No se pudo importar el CSV')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">
            {totalActiveProducts} productos en tu tienda
            {maxProducts !== -1 && (
              <span className="text-gray-400"> · límite del plan: {maxProducts}</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Grid / Lista */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden" role="group" aria-label="Modo de vista">
            <button
              type="button"
              onClick={() => setView('grid')}
              title="Ver como tarjetas"
              className={`px-2.5 py-2 transition-colors ${view === 'grid' ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              title="Ver como lista"
              className={`px-2.5 py-2 transition-colors ${view === 'list' ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => isPaidPlan ? setImportOpen(true) : upsellCsv()}
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar CSV</span>
            {!isPaidPlan && <Crown className="w-3.5 h-3.5 text-amber-500" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => isPaidPlan ? handleDownloadCsv(false) : upsellCsv()}
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar CSV</span>
            {!isPaidPlan && <Crown className="w-3.5 h-3.5 text-amber-500" />}
          </Button>
          <Button
            onClick={() => router.push('/dashboard/products/new')}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Aviso de límite del plan */}
      {atLimit && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Alcanzaste el límite de tu plan: {totalActiveProducts} de {maxProducts} productos
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Los productos nuevos no se guardarán hasta que elimines uno o actualices tu plan
              {planType === 'free' ? ' (Pro: 50 productos, S/29.99/mes)' : ''}.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/plan')}
            className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
          >
            <Crown className="w-4 h-4 mr-1.5" />
            Ver planes
          </Button>
        </div>
      )}

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
                onClick={() => router.push('/dashboard/products/new')}
                className="mt-4 bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar producto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === 'list' ? (
        /* Vista de lista: filas horizontales rápidas de revisar/editar */
        <div className="space-y-2">
          {storeProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center gap-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{product.name}</h3>
                    {product.originalPrice ? (
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 flex-shrink-0">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{product.description || 'Sin descripción'}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm font-bold text-violet-600">S/{product.price.toFixed(2)}</span>
                    {product.originalPrice ? (
                      <span className="text-xs text-gray-400 line-through">S/{product.originalPrice.toFixed(2)}</span>
                    ) : null}
                    {product.categoryId ? (
                      <Badge variant="secondary" className="text-[10px]">{product.categoryId}</Badge>
                    ) : null}
                    {product.stock === 0 ? (
                      <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600">Agotado</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/products/${product.id}`)}
                    className="text-violet-600 border-violet-200 hover:bg-violet-50 gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar</span>
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
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {storeProducts.map((product) => {
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
                  {product.categoryId && (
                    <Badge variant="secondary" className="mt-2 text-xs">{product.categoryId}</Badge>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/products/${product.id}`)}
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

      {/* Import CSV Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Importar productos desde CSV</DialogTitle>
            <DialogDescription>
              Sube tu catálogo en CSV desde Excel o Google Sheets. Si una fila tiene el ID de un producto existente se actualiza; si no, se crea nuevo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
              <li>Descarga tu catálogo o la plantilla vacía</li>
              <li>Edítalo en Excel o Google Sheets (respeta los encabezados)</li>
              <li>Guárdalo como CSV y súbelo aquí</li>
            </ol>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 file:font-semibold hover:file:bg-violet-100"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => handleDownloadCsv(true)}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 underline underline-offset-2"
              >
                Descargar plantilla
              </button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setImportOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={!importFile || importing}
                  onClick={handleImport}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {importing ? 'Importando…' : 'Importar'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
