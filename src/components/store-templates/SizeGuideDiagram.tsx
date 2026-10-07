import type { SizeGuideType } from '@/lib/types'

// Diagramas estándar de medición (los mismos para todas las tiendas): el vendedor
// solo llena sus números. Trazos con stroke currentColor para heredar el color.
function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g stroke="currentColor" strokeWidth="1.5">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <circle cx={x1} cy={y1} r="2.6" fill="currentColor" stroke="none" />
      <circle cx={x2} cy={y2} r="2.6" fill="currentColor" stroke="none" />
    </g>
  )
}

function Label({ x, y, children, anchor = 'middle' }: { x: number; y: number; children: string; anchor?: 'middle' | 'start' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="10.5" fontWeight="600" fill="currentColor" stroke="none">
      {children}
    </text>
  )
}

export function SizeGuideDiagram({ type, className }: { type: SizeGuideType; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }

  return (
    <svg viewBox="0 0 220 210" className={className} role="img" aria-label={`Diagrama de medidas: ${type}`}>
      {type === 'polo' && (
        <g {...common}>
          <path d="M78,30 L58,42 L38,88 L60,100 L72,78 L72,182 L148,182 L148,78 L160,100 L182,88 L162,42 L142,30 Q131,48 110,48 Q89,48 78,30 Z" />
          <Arrow x1={72} y1={72} x2={148} y2={72} />
          <Label x={110} y={66}>Pecho</Label>
          <Arrow x1={192} y1={48} x2={192} y2={182} />
          <Label x={196} y={118} anchor="start">Largo</Label>
          <Arrow x1={52} y1={44} x2={40} y2={84} />
          <Label x={12} y={40} anchor="start">Manga</Label>
        </g>
      )}
      {type === 'pantalon' && (
        <g {...common}>
          <path d="M72,28 L148,28 L154,62 L140,186 L116,186 L110,96 L104,186 L80,186 L66,62 Z" />
          <Arrow x1={72} y1={18} x2={148} y2={18} />
          <Label x={110} y={13}>Cintura</Label>
          <Arrow x1={62} y1={56} x2={158} y2={56} />
          <Label x={110} y={50}>Cadera</Label>
          <Arrow x1={170} y1={28} x2={170} y2={186} />
          <Label x={176} y={110} anchor="start">Largo</Label>
        </g>
      )}
      {type === 'vestido' && (
        <g {...common}>
          <path d="M80,26 L140,26 L146,58 L136,96 L158,186 L62,186 L84,96 L74,58 Z" />
          <Arrow x1={80} y1={52} x2={140} y2={52} />
          <Label x={110} y={46}>Pecho</Label>
          <Arrow x1={86} y1={96} x2={134} y2={96} />
          <Label x={110} y={90}>Cintura</Label>
          <Arrow x1={176} y1={26} x2={176} y2={186} />
          <Label x={182} y={110} anchor="start">Largo</Label>
        </g>
      )}
      {type === 'zapatos' && (
        <g {...common}>
          <path d="M110,28 C142,32 158,62 156,98 C154,138 142,168 110,180 C78,168 66,138 64,98 C62,62 78,32 110,28 Z" />
          <Arrow x1={110} y1={28} x2={110} y2={180} />
          <Label x={110} y={107}>Largo</Label>
          <Arrow x1={64} y1={98} x2={156} y2={98} />
          <Label x={110} y={92}>Ancho</Label>
        </g>
      )}
    </svg>
  )
}
