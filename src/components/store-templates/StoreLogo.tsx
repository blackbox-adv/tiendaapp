'use client'

interface StoreLogoProps {
  logo: string
  className?: string
  size?: number
}

function isUrl(s: string): boolean {
  return /^https?:\/\//.test(s)
}

export function StoreLogo({ logo, className = '', size = 40 }: StoreLogoProps) {
  if (!logo) return null

  if (isUrl(logo)) {
    return (
      <img
        src={logo}
        alt="Logo"
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  // Emoji or text logo
  return <span className={className} style={{ fontSize: size * 0.5 }}>{logo}</span>
}
