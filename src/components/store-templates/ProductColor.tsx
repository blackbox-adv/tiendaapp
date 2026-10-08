'use client'

// ============================================================
// Muestra el color de un producto en la tienda pública:
// - Si el string contiene códigos hex -> cuadrados de color redondeados
//   + el nombre en texto (sin los hex).
// - Si es solo texto -> texto plano (comportamiento de siempre).
// Ej: "Negro #111827 Rojo #EF4444" -> [■][■] Negro · Rojo
// ============================================================

import { colorToSwatches, colorLabel } from '@/components/dashboard/ColorPicker'

interface ProductColorProps {
  color?: string | null
  size?: number
  className?: string
  labelClassName?: string
}

export function ProductColor({ color, size = 12, className = '', labelClassName = '' }: ProductColorProps) {
  if (!color) return null
  const swatches = colorToSwatches(color)
  const label = colorLabel(color)

  if (swatches.length === 0) {
    // Compatibilidad: texto libre sin hex (ej: "Rojo, Azul")
    return <span className={labelClassName}>{color}</span>
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {swatches.map((hex, i) => (
        <span
          key={`${hex}-${i}`}
          className="inline-block rounded-full border border-black/10 align-middle"
          style={{
            width: size,
            height: size,
            backgroundColor: hex,
            boxShadow: hex.toUpperCase() === '#FFFFFF' ? 'inset 0 0 0 1px #e5e7eb' : undefined,
          }}
        />
      ))}
      {label && <span className={labelClassName}>{label}</span>}
    </span>
  )
}
