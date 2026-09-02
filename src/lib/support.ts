// WhatsApp de soporte de TiendApp.
// Configura NEXT_PUBLIC_SUPPORT_WHATSAPP en tu entorno (Vercel) con el número real
// en formato internacional sin "+" ni espacios, ej: 51987654321.
// Si no está configurado, los CTAs de la landing caen a la página de contacto.
export const SUPPORT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || ''

export function supportWhatsappUrl(message?: string): string | null {
  const num = SUPPORT_WHATSAPP_NUMBER.replace(/[^0-9]/g, '')
  if (!num) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${num}${text}`
}
