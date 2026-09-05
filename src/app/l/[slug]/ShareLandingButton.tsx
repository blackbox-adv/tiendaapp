'use client'

// Botón compartir para landings /l/[slug]: usa Web Share API si existe
// (móvil) y si no copia el enlace al portapapeles.
import { useState } from 'react'

export default function ShareLandingButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ title, url })
        return
      } catch {
        /* el usuario canceló → nada */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* portapapeles bloqueado → nada */
    }
  }

  return (
    <button
      onClick={share}
      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-50"
    >
      {copied ? '¡Enlace copiado!' : 'Compartir'}
    </button>
  )
}
