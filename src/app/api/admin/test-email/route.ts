import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/admin/test-email - Envía un correo de prueba y devuelve el motivo
// EXACTO si Resend lo rechaza (super_admin only).
// Nace del reporte del dueño: "no me ha salido ningún correo" — el envío de
// emails es non-blocking y fallaba en silencio; esto hace visible la causa.

interface TestEmailResult {
  ok: boolean
  id?: string
  message?: string
  stage?: 'config' | 'exception' | 'send'
  resendError?: { name?: string; message: string }
  hint?: string
}

function buildHint(rawMessage: string): string {
  const m = (rawMessage || '').toLowerCase()
  if (m.includes('testing emails') || m.includes('not verified') || m.includes('verify your domain') || m.includes('ownership')) {
    return 'Resend rechazó el envío: el dominio de envío (blackboxperu.com) NO está verificado dentro de tu cuenta de Resend. Mientras no se verifique, Resend solo deja enviar correos al email con el que creaste la cuenta de Resend. Solución: entra a resend.com → Domains → agrega blackboxperu.com → agrega los registros DNS que muestra → dale Verify.'
  }
  if (m.includes('api key') || m.includes('unauthorized') || m.includes('invalid') || m.includes('forbidden')) {
    return 'La API key de Resend es inválida o fue revocada. Genera una nueva en resend.com → API Keys y actualiza RESEND_API_KEY en Vercel (Settings → Environment Variables) y vuelve a desplegar.'
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Se alcanzó el límite de envíos del plan gratuito de Resend (100 correos/día, 3.000/mes).'
  }
  if (m.includes('suspend')) {
    return 'Tu cuenta de Resend aparece suspendida. Revisa tu email de Resend o contacta a su soporte.'
  }
  if (m.includes('schema') || m.includes('validation')) {
    return 'Resend rechazó el formato del correo. Revisa el remitente FROM en src/lib/email.ts.'
  }
  return 'Resend rechazó el envío. Revisa resend.com → Logs para ver el detalle completo.'
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)
  if (auth.user.role !== 'super_admin') return apiError('Solo administradores', 403, undefined, request)

  let body: { to?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Body inválido', 400, undefined, request)
  }

  const to = (body.to || '').trim()
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return apiError('Destinatario inválido', 400, undefined, request)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    const result: TestEmailResult = {
      ok: false,
      stage: 'config',
      resendError: { message: 'RESEND_API_KEY no está configurada en Vercel' },
      hint: 'Falta RESEND_API_KEY en Vercel (Settings → Environment Variables). Créala en resend.com → API Keys, agrégala en Vercel y vuelve a desplegar.',
    }
    return apiSuccess(result, 200, request)
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: 'Kyllari <noreply@blackboxperu.com>',
      to,
      subject: 'Correo de prueba - Kyllari',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="text-align:center;padding:32px 0 16px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:#7C3AED;border-radius:12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h1 style="margin:16px 0 8px;font-size:20px;font-weight:700;color:#1f2937;">Kyllari</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1f2937;">Esto es un correo de prueba</h2>
            <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.6;">
              Si lees esto en tu bandeja, los correos de Kyllari (bienvenida, pagos, restablecimiento de clave) están funcionando correctamente.
            </p>
            <p style="margin:0;font-size:13px;color:#9ca3af;">Si llegó a spam, márcalo como "No es spam" para mejorar la entrega.</p>
          </div>
          <div style="text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;">Enviado por Kyllari · Crea tu tienda online en minutos</div>
        </div>
      `,
    })

    if (error) {
      const result: TestEmailResult = {
        ok: false,
        stage: 'send',
        resendError: { name: error.name, message: error.message },
        hint: buildHint(error.message),
      }
      console.error('[TEST-EMAIL] Resend error:', JSON.stringify(error))
      return apiSuccess(result, 200, request)
    }

    const result: TestEmailResult = {
      ok: true,
      id: data?.id,
      message: `Correo aceptado por Resend y enviado a ${to}. Revisa tu bandeja (y la carpeta de spam).`,
    }
    console.log(`[TEST-EMAIL] Sent to ${to}, id: ${data?.id}`)
    return apiSuccess(result, 200, request)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const result: TestEmailResult = {
      ok: false,
      stage: 'exception',
      resendError: { message },
      hint: buildHint(message),
    }
    console.error('[TEST-EMAIL] Exception:', message)
    return apiSuccess(result, 200, request)
  }
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}
