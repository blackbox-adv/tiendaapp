import { z } from 'zod'

// ── Peru WhatsApp validation helper ──
// Validates and normalizes Peru mobile numbers to format: 519XXXXXXXX
export const PERU_WHATSAPP_ERROR = 'Ingresa un número válido de WhatsApp Perú (ej: +51 912 345 678)'

export function normalizePeruWhatsapp(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  // Country code + number: 519XXXXXXXX (11 digits)
  if (digits.startsWith('519') && digits.length === 11) {
    return digits
  }
  // Local 9-digit number starting with 9: prepend country code 51
  if (digits.startsWith('9') && digits.length === 9) {
    return `51${digits}`
  }
  throw new Error(PERU_WHATSAPP_ERROR)
}

// Reusable Zod schema for Peru WhatsApp numbers (nullable-friendly)
export const peruWhatsappString = z
  .string()
  .min(1, PERU_WHATSAPP_ERROR)
  .transform(normalizePeruWhatsapp)

// ── Auth schemas ──
export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Contrasena debe tener al menos 8 caracteres'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .trim(),
  email: z.string().email('Email invalido').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Contrasena debe tener al menos 8 caracteres')
    .max(128, 'Contrasena no puede exceder 128 caracteres'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{7,20}$/, 'Numero de telefono invalido')
    .optional()
    .or(z.literal('')),
})

// ── Store schemas ──
export const createStoreSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre de tienda requerido (min 2 caracteres)')
    .max(100, 'Nombre de tienda no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'Descripcion no puede exceder 500 caracteres')
    .optional()
    .default(''),
  category: z
    .string()
    .max(50, 'Categoria no puede exceder 50 caracteres')
    .optional()
    .default('otros'),
  logo: z.string().max(1000).optional().default(''),
  bannerUrl: z.string().max(1000).optional().default(''),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6,8}$/, 'Color primario invalido (formato: #RRGGBB o #RRGGBBAA)')
    .optional()
    .default('#7C3AED'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6,8}$/, 'Color secundario invalido (formato: #RRGGBB o #RRGGBBAA)')
    .optional()
    .default('#10B981'),
  whatsappNumber: peruWhatsappString
    .optional()
    .or(z.literal('')),
  template: z
    .enum(['moderna', 'vibrante', 'clasica', 'luxury', 'minimalist'])
    .optional()
    .default('moderna'),
})

export const updateStoreSchema = createStoreSchema.partial().extend({
  id: z.string().min(1, 'ID de tienda requerido'),
  isActive: z.boolean().optional(),
  hasShipping: z.boolean().optional(),
  hasSecurePayment: z.boolean().optional(),
  hasReturns: z.boolean().optional(),
})

// ── Product schemas ──
export const createProductSchema = z.object({
  storeId: z.string().min(1, 'storeId es requerido'),
  name: z
    .string()
    .min(1, 'Nombre del producto requerido')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  description: z
    .string()
    .max(1000, 'Descripcion no puede exceder 1000 caracteres')
    .optional()
    .default(''),
  price: z
    .number({ error: 'Precio debe ser un numero' })
    .positive('El precio debe ser positivo')
    .max(999999, 'Precio maximo es S/999,999'),
  originalPrice: z
    .number()
    .positive('El precio original debe ser positivo')
    .max(999999, 'Precio maximo es S/999,999')
    .optional()
    .nullable(),
  imageUrl: z
    .string()
    .max(1000, 'URL de imagen muy larga')
    .optional()
    .default(''),
  category: z
    .string()
    .max(50, 'Categoria no puede exceder 50 caracteres')
    .optional()
    .default(''),
  color: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  rating: z
    .number()
    .min(0, 'Rating minimo es 0')
    .max(5, 'Rating maximo es 5')
    .optional()
    .default(0),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, 'ID del producto requerido'),
})

// ── Payment schemas ──
export const paymentIntentSchema = z.object({
  planId: z.string().min(1, 'planId es requerido'),
  storeId: z.string().optional(),
  paymentMethod: z
    .enum(['visa', 'mastercard', 'american_express', 'diners_club', 'yape', 'plin', 'bank_transfer'])
    .optional(),
})

export const webhookSchema = z.object({
  userId: z.string().min(1, 'userId es requerido'),
  planId: z.string().min(1, 'planId es requerido'),
  storeId: z.string().optional(),
  status: z.enum(['succeeded', 'paid', 'failed', 'refunded']),
  externalRef: z.string().optional(),
  amount: z.number().positive().max(999999).optional(),
})

// ── Subscription schemas ──
export const createSubscriptionSchema = z.object({
  userId: z.string().min(1, 'userId es requerido'),
  storeId: z.string().optional(),
  planId: z.string().min(1, 'planId es requerido'),
  status: z.enum(['active', 'past_due', 'cancelled']).optional().default('active'),
})

export const updateSubscriptionSchema = z.object({
  id: z.string().min(1, 'ID de suscripcion requerido'),
  planId: z.string().optional(),
  status: z.enum(['active', 'past_due', 'cancelled', 'expired']).optional(),
})

// ── Payment submission schema (Yape/Transfer) ──
export const paymentSubmitSchema = z.object({
  planId: z.string().min(1, 'planId es requerido'),
  storeId: z.string().optional(),
  externalRef: z
    .string()
    .min(1, 'Numero de operacion requerido')
    .max(50, 'Numero de operacion no puede exceder 50 caracteres')
    .trim(),
  paymentMethod: z
    .enum(['yape', 'plin', 'bank_transfer'])
    .optional()
    .default('yape'),
})

// ── Admin setup schema ──
export const adminSetupSchema = z.object({
  email: z.string().email('Email invalido').toLowerCase().trim(),
  newPassword: z
    .string()
    .min(8, 'Contrasena debe tener al menos 8 caracteres')
    .max(128, 'Contrasena no puede exceder 128 caracteres'),
})

// ── Admin payment action schema ──
export const adminPaymentActionSchema = z.object({
  paymentId: z.string().min(1, 'paymentId es requerido'),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(500, 'Notas no pueden exceder 500 caracteres').optional(),
})

// ── Settings schema ──
export const settingsSchema = z.record(
  z.string().max(50, 'Key no puede exceder 50 caracteres'),
  z.string().max(500, 'Value no puede exceder 500 caracteres')
)

// Whitelist of allowed setting keys (prevent arbitrary data injection)
export const ALLOWED_SETTING_KEYS = new Set([
  'name',
  'defaultPlanId',
  'maintenanceMode',
  'registrationsEnabled',
  'whatsappSupport',
  'currency',
  'countryCode',
  'supportEmail',
  'contactEmail',
  'contactPhone',
  'logoUrl',
  'customDomain',
])

// ── WhatsApp schema ──
export const whatsappSchema = z.object({
  storeId: z.string().min(1, 'storeId es requerido'),
  productName: z.string().max(200).optional(),
  productPrice: z.number().positive().max(999999).optional(),
  productUrl: z.string().url().max(500).optional().or(z.literal('')),
  customerMessage: z.string().max(1000).optional(),
})

// ── User update schema ──
export const updateUserSchema = z.object({
  id: z.string().min(1, 'ID de usuario requerido'),
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{7,20}$/, 'Numero de telefono invalido')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8).max(128).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().max(1000).optional(),
})

// ── Helper: validate and return parsed data or error response ──
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return {
      success: false,
      error: firstError?.message || 'Datos invalidos',
    }
  }
  return { success: true, data: result.data }
}
