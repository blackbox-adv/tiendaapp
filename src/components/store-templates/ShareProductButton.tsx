'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

// ============================================================
// Botón de compartir producto (boca a boca gratis).
// - Móvil: abre la hoja nativa de compartir (WhatsApp, Instagram, etc.)
// - Escritorio: abre WhatsApp con el mensaje listo (wa.me/?text=)
// - Último recurso: copia el enlace al portapapeles
// Se coloca sobre la imagen de la tarjeta (contenedor debe ser relative).
// Es un <span role="button"> para poder vivir dentro de <button>
// de las tarjetas hero sin HTML inválido.
// ============================================================

export function ShareProductButton({
  productName,
  price,
  productId,
  slug,
  storeName,
  className = 'absolute top-2 right-2 z-20',
}: {
  productName: string
  price: string | number
  productId: string
  slug: string
  storeName: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/store/${slug}/product/${productId}`
    const priceText = Number(price).toFixed(2)
    const shareText = `Mira: ${productName} a S/${priceText} en ${storeName}`

    // 1) Móvil: hoja nativa del sistema
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, text: shareText, url })
        return
      }
    } catch {
      return // usuario canceló la hoja nativa
    }

    // 2) Escritorio: WhatsApp directo con el mensaje prellenado
    try {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}. ${url}`)}`, '_blank')
      return
    } catch {
      /* sigue al portapapeles */
    }

    // 3) Portapapeles con confirmación visible
    try {
      await navigator.clipboard.writeText(`${shareText}. ${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* navegador sin permisos */
    }
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Compartir ${productName} por WhatsApp`}
      onClick={handleShare}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleShare(e as unknown as React.MouseEvent) } }}
      className={`${className} inline-flex w-8 h-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:scale-110 hover:bg-white active:scale-95 transition-transform cursor-pointer border border-black/5`}
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-600" />
      ) : (
        <Share2 className="w-4 h-4 text-gray-700" />
      )}
    </span>
  )
}
