'use client'

// ============================================================
// Selector de color para el formulario de productos.
// Guarda "Nombre #hex" (ej: "Negro #111827") para que la tienda
// pública muestre cuadrados de color visuales además del nombre.
// También acepta texto libre (ej: "Rojo, Azul") como antes.
// ============================================================

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: 'Negro', hex: '#111827' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Rojo', hex: '#EF4444' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Amarillo', hex: '#EAB308' },
  { name: 'Verde', hex: '#22C55E' },
  { name: 'Celeste', hex: '#38BDF8' },
  { name: 'Azul', hex: '#2563EB' },
  { name: 'Morado', hex: '#8B5CF6' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Marrón', hex: '#92400E' },
  { name: 'Gris', hex: '#9CA3AF' },
]

const HEX_RE = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g

/** Extrae los códigos hex del string de color (ej: "Negro #111827 Rojo #EF4444" -> ambos hex). */
export function colorToSwatches(color?: string | null): string[] {
  if (!color) return []
  const hexes = color.match(HEX_RE) || []
  return [...new Set(hexes)].slice(0, 6)
}

/** Label legible sin códigos hex (ej: "Negro #111827" -> "Negro"). */
export function colorLabel(color?: string | null): string {
  if (!color) return ''
  return color.replace(HEX_RE, '').replace(/[\s,/|·-]+/g, ' ').trim()
}

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  id?: string
}

export function ColorPicker({ value, onChange, id }: ColorPickerProps) {
  const swatches = colorToSwatches(value)
  const previewHex = swatches[0] || (COLOR_PRESETS.find((p) => value.trim() === p.name)?.hex ?? '')

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map((p) => {
          const selected = value.includes(p.hex)
          return (
            <button
              key={p.hex}
              type="button"
              title={p.name}
              onClick={() => onChange(`${p.name} ${p.hex}`)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                selected
                  ? 'border-violet-600 ring-2 ring-violet-200 scale-110'
                  : 'border-gray-200 hover:scale-110 hover:border-gray-300'
              }`}
              style={{
                backgroundColor: p.hex,
                boxShadow: p.hex === '#FFFFFF' ? 'inset 0 0 0 1px #e5e7eb' : undefined,
              }}
            />
          )
        })}
      </div>
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder="Ej: Rojo, Azul, o varios: Negro #111827 Rojo #EF4444"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        {previewHex && (
          <div
            className="w-10 h-10 rounded-lg border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: previewHex }}
            title={previewHex}
          />
        )}
      </div>
      <p className="text-[11px] text-gray-400">
        Elige un color o escribe varios. Tu tienda los muestra como cuadraditos de color.
      </p>
      <Label className="sr-only">Color del producto</Label>
    </div>
  )
}
