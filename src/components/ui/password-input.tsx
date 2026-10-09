'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Input de contrasena con "ojito" para ver/ocultar lo que se escribe.
// Se comporta igual que Input (mismas props) y anade el boton a la derecha.
// hasLeftIcon: pasarlo en true cuando el formulario pone un icono a la
// izquierda (ej. candado) para conservar el padding pl-10.
export function PasswordInput({
  className,
  hasLeftIcon,
  ...props
}: React.ComponentProps<'input'> & { hasLeftIcon?: boolean }) {
  const [show, setShow] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        className={`${hasLeftIcon ? 'pl-10 ' : ''}pr-10 ${className ?? ''}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        title={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}
