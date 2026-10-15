// Hook de arranque del servidor Next.js (una vez por proceso).
// Valida variables de entorno y deja el aviso en los logs de Vercel.
export async function register() {
  // Import dinámico: evitar side-effects en edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logEnvironmentIssues } = await import('@/lib/env-check')
    logEnvironmentIssues()
  }
}
