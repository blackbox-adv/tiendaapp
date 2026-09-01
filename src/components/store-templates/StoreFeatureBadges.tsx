'use client'

import { Truck, ShieldCheck, RotateCcw } from 'lucide-react'

type Variant = 'light' | 'dark' | 'vibrant' | 'classic' | 'luxury' | 'minimalist'

interface StoreFeatureBadgesProps {
  hasShipping?: boolean
  hasSecurePayment?: boolean
  hasReturns?: boolean
  variant?: Variant
  primaryColor?: string
}

const variantStyles: Record<Variant, { container: string; badge: string; icon: string; text: string }> = {
  light: {
    container: 'flex flex-wrap items-center justify-center gap-2',
    badge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100',
    icon: 'w-3.5 h-3.5 text-gray-500',
    text: 'text-[11px] font-medium text-gray-600',
  },
  dark: {
    container: 'flex flex-wrap items-center justify-center gap-2',
    badge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10',
    icon: 'w-3.5 h-3.5 text-white/70',
    text: 'text-[11px] font-medium text-white/70',
  },
  vibrant: {
    container: 'flex flex-wrap items-center justify-center gap-2',
    badge: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10',
    icon: 'w-3.5 h-3.5 text-white',
    text: 'text-[11px] font-bold text-white',
  },
  classic: {
    container: 'flex flex-wrap items-center justify-center gap-2',
    badge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border-2',
    icon: 'w-3.5 h-3.5',
    text: 'text-[11px] font-medium',
  },
  luxury: {
    container: 'flex flex-wrap items-center justify-center gap-3',
    badge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm',
    icon: 'w-3.5 h-3.5',
    text: 'text-[10px] font-medium tracking-[0.1em] uppercase',
  },
  minimalist: {
    container: 'flex flex-wrap items-center gap-3',
    badge: 'inline-flex items-center gap-1',
    icon: 'w-3 h-3',
    text: 'text-[10px] font-normal',
  },
}

export function StoreFeatureBadges({
  hasShipping,
  hasSecurePayment,
  hasReturns,
  variant = 'light',
  primaryColor = '#7C3AED',
}: StoreFeatureBadgesProps) {
  const features: { icon: typeof Truck; label: string; active: boolean }[] = [
    { icon: Truck, label: 'Envio', active: !!hasShipping },
    { icon: ShieldCheck, label: 'Pago seguro', active: !!hasSecurePayment },
    { icon: RotateCcw, label: 'Devoluciones', active: !!hasReturns },
  ]

  const activeFeatures = features.filter((f) => f.active)
  if (activeFeatures.length === 0) return null

  const styles = variantStyles[variant]

  // For classic/luxury/minimalist, use primaryColor for icon and text
  const colorStyle = ['classic', 'luxury', 'minimalist'].includes(variant)
    ? { color: primaryColor, borderColor: primaryColor + '40' }
    : {}

  return (
    <div className={styles.container}>
      {activeFeatures.map((f) => (
        <span key={f.label} className={styles.badge} style={colorStyle}>
          <f.icon className={styles.icon} style={colorStyle} />
          <span className={styles.text} style={colorStyle}>
            {f.label}
          </span>
        </span>
      ))}
    </div>
  )
}
