'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Upload, Loader2 } from 'lucide-react';

// ============================================================
// Editor de variantes de color (dueño).
// Cada fila = un color del producto con stock propio, precio
// opcional distinto y foto propia opcional. Máximo 10 colores.
// El estado vive en la página padre (new/edit) para poder
// subir las fotos junto con el formulario.
// ============================================================

export interface VariantRowInput {
  color: string
  hex: string        // '#rrggbb' del selector nativo
  stock: string      // '' = sin límite (-1)
  price: string      // '' = hereda el precio del producto
  imageUrl: string   // URL existente (solo edición)
  file: File | null  // foto nueva elegida
  preview: string | null
}

interface VariantsEditorProps {
  enabled: boolean
  onEnabledChange: (v: boolean) => void
  rows: VariantRowInput[]
  onChange: (rows: VariantRowInput[]) => void
}

const MAX_VARIANTS = 10

export function VariantsEditor({ enabled, onEnabledChange, rows, onChange }: VariantsEditorProps) {
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([])

  const addRow = () => {
    if (rows.length >= MAX_VARIANTS) return
    onChange([...rows, { color: '', hex: '#9ca3af', stock: '', price: '', imageUrl: '', file: null, preview: null }])
  }

  const removeRow = (idx: number) => {
    onChange(rows.filter((_, i) => i !== idx))
    fileInputRefs.current.splice(idx, 1)
  }

  const updateRow = (idx: number, patch: Partial<VariantRowInput>) => {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  const pickFile = (idx: number, file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => updateRow(idx, { file, preview: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>El producto tiene varios colores</Label>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Ej: el mismo reloj en Negro, Plata y Dorado — cada color con su propio stock. El cliente elige el color en la ficha.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={(v) => { onEnabledChange(v); if (!v) onChange([]) }} />
      </div>

      {enabled && (
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 p-2">
              {/* Color nativo */}
              <input
                type="color"
                value={row.hex || '#9ca3af'}
                onChange={(e) => updateRow(idx, { hex: e.target.value })}
                aria-label={`Color de ${row.color || `variante ${idx + 1}`}`}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
              />
              {/* Nombre del color */}
              <Input
                value={row.color}
                onChange={(e) => updateRow(idx, { color: e.target.value })}
                placeholder="Nombre: Negro, Dorado..."
                maxLength={40}
                className="flex-1 min-w-0 h-9 text-sm"
              />
              {/* Precio opcional */}
              <Input
                value={row.price}
                onChange={(e) => updateRow(idx, { price: e.target.value })}
                type="number"
                step="0.01"
                min="0"
                placeholder="S/ (igual)"
                className="w-24 h-9 text-sm shrink-0"
                title="Precio distinto para este color (opcional)"
              />
              {/* Stock propio */}
              <Input
                value={row.stock}
                onChange={(e) => updateRow(idx, { stock: e.target.value })}
                type="number"
                min="-1"
                placeholder="Stock ∞"
                className="w-20 h-9 text-sm shrink-0"
                title="Stock de este color. Vacío = sin límite, 0 = agotado"
              />
              {/* Foto propia */}
              <button
                type="button"
                onClick={() => fileInputRefs.current[idx]?.click()}
                className="relative w-9 h-9 rounded-lg border border-gray-200 hover:border-violet-400 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden"
                title="Foto propia de este color (opcional)"
              >
                {row.preview ? (
                  <img src={row.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <input
                ref={(el) => { fileInputRefs.current[idx] = el }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => pickFile(idx, e.target.files?.[0] || null)}
              />
              {/* Quitar fila */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                onClick={() => removeRow(idx)}
                aria-label={`Quitar color ${row.color || idx + 1}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {rows.length < MAX_VARIANTS ? (
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 py-1 px-1"
            >
              <Plus className="w-4 h-4" />
              Agregar color
            </button>
          ) : (
            <p className="text-[11px] text-gray-400">Máximo {MAX_VARIANTS} colores por producto.</p>
          )}

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Stock vacío = sin límite · 0 = agotado. Precio vacío = igual al del producto.
            La foto es opcional: si no subes una, la ficha usa la foto principal.
          </p>
        </div>
      )}
    </div>
  )
}

// Spinner reutilizable si el padre quiere mostrar estado de subida
export function VariantsUploadingHint({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <p className="text-[11px] text-violet-600 flex items-center gap-1.5">
      <Loader2 className="w-3 h-3 animate-spin" />
      Subiendo fotos de colores...
    </p>
  )
}
