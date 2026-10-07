import type { SizeGuideType } from './types'

// Etiquetas de columnas por tipo de prenda (compartido: editor del dashboard + modal en tienda)
export const SIZE_GUIDE_COLUMNS: Record<SizeGuideType, { key: 'a' | 'b' | 'c'; label: string }[]> = {
  polo: [
    { key: 'a', label: 'Pecho (cm)' },
    { key: 'b', label: 'Largo (cm)' },
    { key: 'c', label: 'Manga (cm)' },
  ],
  pantalon: [
    { key: 'a', label: 'Cintura (cm)' },
    { key: 'b', label: 'Cadera (cm)' },
    { key: 'c', label: 'Largo (cm)' },
  ],
  vestido: [
    { key: 'a', label: 'Pecho (cm)' },
    { key: 'b', label: 'Cintura (cm)' },
    { key: 'c', label: 'Largo (cm)' },
  ],
  zapatos: [
    { key: 'a', label: 'Largo del pie (cm)' },
    { key: 'b', label: 'Ancho del pie (cm)' },
  ],
}

export const SIZE_GUIDE_TYPE_LABEL: Record<SizeGuideType, string> = {
  polo: 'Camiseta / Polo',
  pantalon: 'Pantalón',
  vestido: 'Vestido',
  zapatos: 'Zapatos',
}

export const SIZE_GUIDE_TYPES: SizeGuideType[] = ['polo', 'pantalon', 'vestido', 'zapatos']
