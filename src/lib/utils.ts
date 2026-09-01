import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a Prisma Decimal value to a JavaScript number.
 * Prisma Decimal fields serialize as objects { d, e, s } or strings in JSON.
 * This safely converts them to native numbers for API responses and email templates.
 */
export function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  // Prisma Decimal object — has toString() method
  if (typeof value === 'object' && 'toString' in (value as object)) {
    return parseFloat((value as { toString: () => string }).toString()) || 0
  }
  return Number(value) || 0
}

/**
 * Check if a value looks like a Prisma Decimal object { s, e, d }.
 * Prisma Decimal fields can arrive with constructor.name !== 'Decimal'
 * (e.g. minified builds, cross-realm objects), so we also check the shape.
 */
function isPrismaDecimalLike(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    's' in obj && 'e' in obj && 'd' in obj &&
    (typeof obj.s === 'number' || obj.s === 1 || obj.s === -1) &&
    typeof obj.e === 'number' &&
    Array.isArray(obj.d)
  )
}

/**
 * Recursively convert all Prisma Decimal fields in an object/array to numbers.
 * This ensures API responses serialize cleanly as JSON numbers instead of Decimal objects.
 */
export function serializeDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(serializeDecimals) as T
  // Prisma Decimal class instance (constructor.name === 'Decimal')
  if (typeof obj === 'object' && obj.constructor?.name === 'Decimal') {
    return decimalToNumber(obj) as T
  }
  // Prisma Decimal serialized shape { s, e, d } that survived JSON round-trip
  if (isPrismaDecimalLike(obj)) {
    return decimalToNumber(obj) as T
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeDecimals(value)
    }
    return result as T
  }
  return obj
}
