// WhatsApp de soporte de Kyllari.
// SIN NÚMERO DE SOPORTE POR DECISIÓN DEL DUEÑO: la web no publica un WhatsApp
// de contacto (el dueño atiende por correo). Los CTAs de la landing caen a la
// página /contact (formulario por email).
// Si algún día se desea reactivar: configura NEXT_PUBLIC_SUPPORT_WHATSAPP en
// Vercel con el número en formato internacional sin "+" ni espacios
// (ej: 51987654321) y todos los CTAs volverán a abrir WhatsApp solos.
export const SUPPORT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || ''

export function supportWhatsappUrl(message?: string): string | null {
  const num = SUPPORT_WHATSAPP_NUMBER.replace(/[^0-9]/g, '')
  if (!num) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${num}${text}`
}
