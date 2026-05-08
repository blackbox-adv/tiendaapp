// ── Environment Variable Validation ──
// Run at server startup to fail fast if critical vars are missing

interface EnvVarConfig {
  name: string
  required: boolean
  description: string
  validator?: (value: string) => boolean
}

const ENV_CONFIG: EnvVarConfig[] = [
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'Clave secreta para firmar tokens JWT (min 16 caracteres)',
    validator: (v) => v.length >= 16,
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'URL de conexion a la base de datos',
    validator: (v) => v.startsWith('file:') || v.startsWith('postgresql://') || v.startsWith('mysql://'),
  },
  {
    name: 'WEBHOOK_SECRET',
    required: false,
    description: 'Clave secreta para verificar webhooks de pagos (min 16 caracteres)',
    validator: (v) => v.length >= 16,
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'API Key de Resend para enviar emails transaccionales (empieza con re_)',
    validator: (v) => v.startsWith('re_'),
  },
  {
    name: 'SUPABASE_URL',
    required: true,
    description: 'URL del proyecto Supabase para Storage y autenticacion',
    validator: (v) => v.startsWith('https://') && v.includes('.supabase.co'),
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Service Role Key de Supabase (server-side only, con acceso admin)',
    validator: (v) => v.length >= 20,
  },
]

export function validateEnvironment(): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = []
  const errors: string[] = []

  for (const config of ENV_CONFIG) {
    const value = process.env[config.name]

    if (!value) {
      if (config.required) {
        errors.push(`[ENV] FATAL: ${config.name} no esta configurada. ${config.description}`)
      } else {
        warnings.push(`[ENV] WARN: ${config.name} no esta configurada. ${config.description}`)
      }
      continue
    }

    if (config.validator && !config.validator(value)) {
      errors.push(`[ENV] FATAL: ${config.name} no pasa la validacion. ${config.description}`)
    }

    // Check for default/weak secrets in production
    if (process.env.NODE_ENV === 'production') {
      const weakPatterns = ['secret', 'change-me', 'demo', 'test', '12345', 'password']
      if (weakPatterns.some((p) => value.toLowerCase().includes(p))) {
        warnings.push(
          `[ENV] WARN: ${config.name} parece ser un valor debil. Usa un secreto fuerte en produccion.`
        )
      }
    }
  }

  return { valid: errors.length === 0, warnings, errors }
}

// ── Audit Logger ──

type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'REGISTER'
  | 'LOGOUT'
  | 'STORE_CREATE'
  | 'STORE_UPDATE'
  | 'STORE_DELETE'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'SUBSCRIPTION_CREATE'
  | 'SUBSCRIPTION_UPDATE'
  | 'SUBSCRIPTION_CANCEL'
  | 'PAYMENT_WEBHOOK'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'ADMIN_PASSWORD_RESET'
  | 'SEED_DB'
  | 'UPLOAD_FILE'
  | 'SETTINGS_UPDATE'
  | 'PASSWORD_RESET'

interface AuditEntry {
  timestamp?: string
  action: AuditAction
  userId?: string
  userEmail?: string
  ip?: string
  details?: Record<string, unknown>
  success: boolean
  statusCode?: number
}

export function auditLog(entry: AuditEntry): void {
  const logLine = JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })

  if (entry.success) {
    console.log(`[AUDIT] ${logLine}`)
  } else {
    console.warn(`[AUDIT-FAIL] ${logLine}`)
  }
}

// ── Request IP Helper ──
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  const realIp = request.headers.get('x-real-ip')
  return realIp || 'unknown'
}
