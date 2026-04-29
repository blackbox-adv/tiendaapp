'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Search, Plus, Pencil, Trash2, Upload, X, Star, Eye, EyeOff, Loader2, Package } from 'lucide-react'
import DashboardLayout from '../DashboardLayout'

export default function ProductManager() {
  const { navigate, currentUser } = useStore()
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({ name: '', description: '', price: '', originalPrice: '', isActive: true, isFeatured: false })
  const [images, setImages] = useState<{ url: string; alt: string; isPrimary: boolean }[]>([])

  const fetchProducts = async () => {
    if (!currentUser) return
    const res = await fetch(`/api/products?storeId=${currentUser.id}`)
    setProducts(await res.json())
  }

  useEffect(() => { fetchProducts() }, [currentUser])

  useEffect(() => {
    if (!editId) { setForm({ name: '', description: '', price: '', originalPrice: '', isActive: true, isFeatured: false }); setImages([]); return }
    const p = products.find(p => p.id === editId)
    if (p) { setForm({ name: p.name, description: p.description || '', price: p.price.toString(), originalPrice: p.originalPrice?.toString() || '', isActive: p.isActive, isFeatured: p.isFeatured }); setImages(p.images?.map((img: any) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary })) || []) }
  }, [editId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setImages(prev => [...prev, { url: data.url, alt: form.name, isPrimary: prev.length === 0 }])
    }
    setUploading(false); e.target.value = ''
  }

  const handleSave = async () => {
    if (!currentUser) return
    setSaving(true)
    const body = { ...form, price: parseFloat(form.price), originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null, storeId: currentUser.id, images }
    const url = editId ? `/api/products/${editId}` : '/api/products'
    const method = editId ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setEditId(null); setSaving(false); fetchProducts()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); fetchProducts()
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout activePage="products">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <Button onClick={() => setEditId('new')} className="bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4 mr-1.5" /> Nuevo producto</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="border-0 shadow-sm overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {p.images[0] ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="h-12 w-12" /></div>}
                <div className="absolute top-2 right-2 flex gap-1">
                  {p.isFeatured && <Badge className="bg-amber-500 text-white text-[10px]">★</Badge>}
                  {!p.isActive && <Badge className="bg-red-500 text-white text-[10px]">Inactivo</Badge>}
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-violet-600 font-bold mt-1">S/ {p.price.toLocaleString('es-PE')}</p>
                {p.originalPrice && <p className="text-xs text-gray-400 line-through">S/ {p.originalPrice.toLocaleString('es-PE')}</p>}
                <div className="flex gap-1 mt-2" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditId(p.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-gray-400 col-span-full text-center py-12">No hay productos</p>}
        </div>

        {/* Edit/Create Dialog */}
        <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId === 'new' ? 'Nuevo Producto' : 'Editar Producto'}</DialogTitle>
              <DialogDescription>Agrega los detalles de tu producto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del producto" /></div>
              <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe tu producto..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Precio (S/) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></div>
                <div className="space-y-2"><Label>Precio anterior</Label><Input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="Opcional" /></div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Imágenes</Label>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X /></button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 transition-colors">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin text-violet-500" /> : <Upload className="h-5 w-5 text-gray-400" />}
                    <span className="text-[9px] text-gray-400 mt-0.5">Subir</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Activo</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} /> Destacado</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditId(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.price} className="bg-violet-600 hover:bg-violet-700 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent><DialogHeader><DialogTitle>Eliminar producto</DialogTitle><DialogDescription>¿Estás seguro? Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Eliminar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
