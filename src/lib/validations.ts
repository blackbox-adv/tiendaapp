import { z } from 'zod'

// ── Auth schemas ──
export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Contrasena debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Contrasena debe tener al menos 6 caracteres').max(128),
  phone: z.string().optional(),
})

// ── Store schemas ──
export const createStoreSchema = z.object({
  name: z.string().min(2, 'Nombre de tienda requerido').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minusculas, numeros y guiones'),
  description: z.string().max(500).optional().default(''),
  category: z.string().max(50).optional().default('otros'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color primario invalido').optional().default('#7C3AED'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color secundario invalido').optional().default('#10B981'),
  whatsappNumber: z.string().optional(),
  template: z.enum(['moderna', 'vibrante', 'clasica']).optional().default('moderna'),
})

// ── Product schemas ──
export const createProductSchema = z.object({
  storeId: z.string().min(1, 'storeId es requerido'),
  name: z.string().min(1, 'Nombre del producto requerido').max(200),
  description: z.string().max(1000).optional().default(''),
  price: z.number().positive('El precio debe ser positivo').max(999999),
  originalPrice: z.number().positive().max(999999).optional().nullable(),
  imageUrl: z.string().url('URL de imagen invalida').optional().default(''),
  category: z.string().max(50).optional().default(''),
  isActive: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  rating: z.number().min(0).max(5).optional().default(0),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, 'ID del producto requerido'),
})

// ── Payment webhook schema ──
export const webhookSchema = z.object({
  userId: z.string().min(1),
  planId: z.string().min(1),
  storeId: z.string().optional(),
  status: z.enum(['succeeded', 'paid', 'failed', 'refunded']),
  externalRef: z.string().optional(),
})

// ── Settings schema ──
export const settingsSchema = z.record(
  z.string().max(50),
  z.string().max(500)
)

// ── Helper: validate and return parsed data or error response ──
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return { success: false, error: firstError?.message || 'Datos invalidos' }
  }
  return { success: true, data: result.data }
}
