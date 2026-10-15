// Validación de variables de entorno al arrancar el servidor.
// Solo ADVIERTE (console.error/warn) — nunca tumba el proceso.
// Se ejecuta una vez por arranque via src/instrumentation.ts register().

interface EnvIssue {
  varName: string
  severity: 'critical' | 'recommended'
  impact: string
}

export function validateEnvironment(): EnvIssue[] {
  const issues: EnvIssue[] = []
  const has = (name: string) => Boolean(process.env[name] && process.env[name]!.trim())

  // ── Críticas: sin estas la app no funciona ──
  if (!has('DATABASE_URL')) {
    issues.push({
      varName: 'DATABASE_URL',
      severity: 'critical',
      impact: 'La app no puede conectar a la base de datos',
    })
  }
  if (!has('JWT_SECRET')) {
    issues.push({
      varName: 'JWT_SECRET',
      severity: 'critical',
      impact: 'Login y sesiones no funcionan (tokens no se pueden firmar)',
    })
  }

  // ── Recomendadas: funciones que se degradan sin ellas ──
  if (!has('RESEND_API_KEY')) {
    issues.push({
      varName: 'RESEND_API_KEY',
      severity: 'recommended',
      impact: 'Correos automáticos (bienvenida, pago aprobado, reset) no se envían',
    })
  }
  if (!has('NEXT_PUBLIC_SUPABASE_URL') || !has('SUPABASE_SERVICE_ROLE_KEY')) {
    issues.push({
      varName: 'NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
      severity: 'recommended',
      impact: 'Subida de imágenes (logos, productos, comprobantes) deshabilitada',
    })
  }

  return issues
}

export function logEnvironmentIssues(): void {
  // No validar en build/prerender, solo en runtime del servidor
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  try {
    const issues = validateEnvironment()
    if (issues.length === 0) return
    for (const issue of issues) {
      const tag = issue.severity === 'critical' ? '[ENV][CRITICO]' : '[ENV][aviso]'
      console.error(`${tag} Falta ${issue.varName} -> ${issue.impact}`)
    }
  } catch {
    // la validación nunca debe romper el arranque
  }
}
