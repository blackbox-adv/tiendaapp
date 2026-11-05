import { APP_URL } from '@/lib/env'
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no esta configurada')
  }
  if (!resendInstance) {
    resendInstance = new Resend(RESEND_API_KEY)
  }
  return resendInstance
}

// Remitente configurable vía EMAIL_FROM (Vercel → Environment Variables).
// kyllari.com YA ESTÁ VERIFICADO en Resend (DKIM/SPF/MX OK) → el remitente
// sale de kyllari.com: dominio de envío = dominio de links/imágenes
// (alineación completa → mejor bandeja de entrada). Usamos hola@ en vez de
// noreply@ (Resend penaliza remitentes no-responibles). Pendiente opcional:
// registro DMARC en el DNS de kyllari.com (monitorización).
export const FROM_EMAIL = process.env.EMAIL_FROM?.trim() || 'Kyllari <hola@kyllari.com>'

// ── Envío con versión texto plano ──
// Los filtros de spam (Gmail/Outlook) penalizan emails solo-HTML. Derivamos
// un text/plain del mismo HTML para mejorar la entregabilidad.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '  • ')
    .replace(
      /<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
      (_m: string, href: string, txt: string) => `${txt.replace(/<[^>]+>/g, '')} -> ${href}`
    )
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function sendEmail(params: { from: string; to: string; subject: string; html: string; replyTo?: string }) {
  const resend = getResend()
  return resend.emails.send({ ...params, text: htmlToText(params.html) })
}

// ── Email Templates ──

function passwordResetTemplate(name: string, resetUrl: string) {
  return {
    subject: 'Restablece tu contraseña - Kyllari',
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius: 12px;" />
          <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">Kyllari</h1>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
            Hola, ${name}
          </h2>
          <p style="margin: 0 0 24px; font-size: 15px; color: #4b5563; line-height: 1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Kyllari. 
            Haz clic en el botón de abajo para crear una nueva contraseña:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #7C3AED; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Restablecer contraseña
            </a>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña actual seguirá siendo la misma.
          </p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            Este enlace expira en <strong>1 hora</strong>.
          </p>
        </div>

        <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0 0 4px;">Enviado por Kyllari</p>
          <p style="margin: 0;">Crea tu tienda online en minutos</p>
        </div>
      </div>
    `,
  }
}

function welcomeTemplate(name: string, loginUrl: string) {
  return {
    subject: 'Bienvenido a Kyllari - Tu tienda online lista',
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius: 12px;" />
          <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">Kyllari</h1>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
            Bienvenido, ${name}!
          </h2>
          <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.6;">
            Tu cuenta en Kyllari ha sido creada exitosamente. Ya puedes comenzar a configurar tu tienda online y empezar a vender.
          </p>

          <div style="background: #f5f3ff; border-radius: 8px; padding: 16px; margin: 16px 0 24px;">
            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #7C3AED;">Para empezar:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 1.8;">
              <li>Crea tu tienda con el asistente</li>
              <li>Agrega tus primeros productos</li>
              <li>Comparte el enlace de tu tienda</li>
              <li>Empieza a recibir pedidos por WhatsApp</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${loginUrl}" 
               style="display: inline-block; background: #7C3AED; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Ir a mi cuenta
            </a>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
        </div>

        <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0 0 4px;">Enviado por Kyllari</p>
          <p style="margin: 0;">Crea tu tienda online en minutos</p>
        </div>
      </div>
    `,
  }
}

// ── Public API ──

export async function sendPasswordResetEmail(name: string, email: string, token: string) {
  try {
    const template = passwordResetTemplate(name, `${APP_URL}/reset-password?token=${token}`)

    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error('[EMAIL] Error sending password reset:', error)
      return null
    }

    console.log(`[EMAIL] Password reset sent, id: ${data?.id}`)
    return data
  } catch (err) {
    console.error('[EMAIL] Password reset failed:', err)
    return null
  }
}

export async function sendWelcomeEmail(name: string, email: string) {
  try {
    const template = welcomeTemplate(name, APP_URL)

    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error('[EMAIL] Error sending welcome email:', error)
      return // Don't throw - registration should succeed even if email fails
    }

    console.log(`[EMAIL] Welcome email sent, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Welcome email failed (non-blocking):', err)
  }
}

// ── Subscription Email Templates ──

function subscriptionTemplate(
  name: string,
  planName: string,
  planPrice: number,
  action: 'activated' | 'cancelled' | 'downgraded'
) {
  const config = {
    activated: {
      subject: 'Tu suscripción a Kyllari ha sido activada',
      themeBg: '#ecfdf5',
      themeBorder: '#a7f3d0',
      themeColor: '#059669',
      heading: '¡Tu suscripción está activa!',
      message: `Tu plan <strong>${planName}</strong> (S/${planPrice}/mes) está activo. Ya puedes disfrutar de todos los beneficios.`,
      extraHtml: `
        <div style="margin: 20px 0 24px;">
          <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #374151;">Siguientes pasos:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 1.8;">
            <li>Configura tu tienda con el asistente</li>
            <li>Agrega tus productos</li>
            <li>Comparte tu enlace con tus clientes</li>
          </ul>
        </div>
      `,
      ctaText: 'Ir a mi dashboard',
      ctaUrl: `${APP_URL}/dashboard`,
      ctaBg: '#059669',
      footerNote: '',
    },
    cancelled: {
      subject: 'Tu suscripción a Kyllari ha sido cancelada',
      themeBg: '#fff7ed',
      themeBorder: '#fed7aa',
      themeColor: '#ea580c',
      heading: 'Suscripción cancelada',
      message: `Tu plan <strong>${planName}</strong> ha sido cancelado. Tu cuenta vuelve al plan Gratuito.`,
      extraHtml: `
        <div style="margin: 20px 0 24px;">
          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
            Los datos de tu tienda se conservarán durante <strong>30 días</strong>. Si deseas reactivar tu plan, puedes hacerlo en cualquier momento desde tu panel.
          </p>
        </div>
      `,
      ctaText: 'Volver a Kyllari',
      ctaUrl: APP_URL,
      ctaBg: '#ea580c',
      footerNote: '',
    },
    downgraded: {
      subject: 'Tu plan en Kyllari ha cambiado',
      themeBg: '#eff6ff',
      themeBorder: '#bfdbfe',
      themeColor: '#2563eb',
      heading: 'Cambio de plan',
      message: `Tu cuenta ha cambiado al plan <strong>${planName}</strong>. Revisa los límites de tu nuevo plan.`,
      extraHtml: `
        <div style="margin: 20px 0 24px;">
          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
            Ten en cuenta que los planes tienen distintos límites de productos y funcionalidades. Si necesitas más capacidad, puedes actualizar tu plan en cualquier momento.
          </p>
        </div>
      `,
      ctaText: 'Ver mi plan',
      ctaUrl: `${APP_URL}/dashboard`,
      ctaBg: '#2563eb',
      footerNote: '',
    },
  }

  const c = config[action]

  return {
    subject: c.subject,
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius: 12px;" />
          <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">Kyllari</h1>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
            Hola, ${name}
          </h2>

          <div style="display: flex; align-items: center; gap: 10px; background: ${c.themeBg}; border: 1px solid ${c.themeBorder}; border-radius: 8px; padding: 14px 16px; margin: 0 0 20px;">
            <span style="font-size: 15px; font-weight: 600; color: ${c.themeColor};">${c.heading}</span>
          </div>

          <p style="margin: 0 0 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
            ${c.message}
          </p>

          ${c.extraHtml}

          <div style="text-align: center; margin: 24px 0;">
            <a href="${c.ctaUrl}"
               style="display: inline-block; background: ${c.ctaBg}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              ${c.ctaText}
            </a>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
        </div>

        <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0 0 4px;">Enviado por Kyllari</p>
          <p style="margin: 0;">Crea tu tienda online en minutos</p>
        </div>
      </div>
    `,
  }
}

export async function sendSubscriptionEmail(
  userName: string,
  userEmail: string,
  planName: string,
  planPrice: number,
  action: 'activated' | 'cancelled' | 'downgraded'
): Promise<void> {
  try {
    const template = subscriptionTemplate(userName, planName, planPrice, action)

    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error(`[EMAIL] Error sending subscription email (${action}):`, error)
      return
    }

    console.log(`[EMAIL] Subscription email (${action}) sent, id: ${data?.id}`)
  } catch (err) {
    console.error(`[EMAIL] Subscription email (${action}) failed (non-blocking):`, err)
  }
}

// ── Payment Submitted Confirmation Email ──
export async function sendPaymentSubmittedEmail(
  userName: string,
  userEmail: string,
  planName: string,
  planPrice: number,
  externalRef: string
): Promise<void> {
  try {
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Comprobante de pago recibido - Kyllari',
      html: `
        <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="text-align: center; padding: 32px 0 24px;">
            <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius: 12px;" />
            <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">Kyllari</h1>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
              Hola, ${userName}
            </h2>

            <div style="display: flex; align-items: center; gap: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin: 0 0 20px;">
              <span style="font-size: 15px; font-weight: 600; color: #16a34a;">Comprobante recibido</span>
            </div>

            <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.6;">
              Hemos recibido tu comprobante de pago para el plan <strong>${planName}</strong> (S/${planPrice}/mes).
            </p>

            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                <strong>Referencia:</strong> ${externalRef}
              </p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #374151;">
                <strong>Estado:</strong> Pendiente de verificación
              </p>
            </div>

            <p style="margin: 16px 0 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
              Nuestro equipo verificará tu pago en un plazo máximo de <strong>24 horas</strong>. Recibirás un email de confirmación una vez aprobado.
            </p>
          </div>

          <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0 0 4px;">Enviado por Kyllari</p>
            <p style="margin: 0;">Crea tu tienda online en minutos</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[EMAIL] Error sending payment submitted email:', error)
      return
    }

    console.log(`[EMAIL] Payment submitted email sent, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Payment submitted email failed (non-blocking):', err)
  }
}

// ── Payment Rejected Email ──
export async function sendPaymentRejectedEmail(
  userName: string,
  userEmail: string,
  planName: string,
  reason?: string
): Promise<void> {
  try {
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Comprobante de pago no verificado - Kyllari',
      html: `
        <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="text-align: center; padding: 32px 0 24px;">
            <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius: 12px;" />
            <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">Kyllari</h1>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
              Hola, ${userName}
            </h2>

            <div style="display: flex; align-items: center; gap: 10px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 16px; margin: 0 0 20px;">
              <span style="font-size: 15px; font-weight: 600; color: #dc2626;">Pago no verificado</span>
            </div>

            <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.6;">
              No pudimos verificar tu comprobante de pago para el plan <strong>${planName}</strong>.
              ${reason ? `<br><strong>Motivo:</strong> ${reason}` : ''}
            </p>

            <p style="margin: 16px 0 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
              Puedes volver a enviar tu comprobante desde tu panel de suscripción. Si crees que es un error, contáctanos por WhatsApp o email.
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${APP_URL}/dashboard"
                 style="display: inline-block; background: #7C3AED; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Ir a mi panel
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0 0 4px;">Enviado por Kyllari</p>
            <p style="margin: 0;">Crea tu tienda online en minutos</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[EMAIL] Error sending payment rejected email:', error)
      return
    }

    console.log(`[EMAIL] Payment rejected email sent, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Payment rejected email failed (non-blocking):', err)
  }
}

// ── Admin Payment Alert (aviso al dueño cuando llega un comprobante) ──
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'kioanthony@gmail.com'

export async function sendAdminPaymentAlertEmail(params: {
  storeName: string
  ownerName: string
  planName: string
  amount: number
  reference?: string
}): Promise<void> {
  try {
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Nuevo pago por aprobar: ${params.storeName} (${params.planName})`,
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="text-align:center;padding:32px 0 16px;">
            <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius:12px;" />
            <h1 style="margin:16px 0 8px;font-size:20px;font-weight:700;color:#1f2937;">Kyllari</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1f2937;">Hay un pago esperando tu aprobación</h2>
            <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">
              Un cliente envió su comprobante. Apruébalo o recházalo desde tu panel de administración.
            </p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 20px;">
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Tienda:</strong> ${params.storeName}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Cliente:</strong> ${params.ownerName}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Plan:</strong> ${params.planName}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Monto:</strong> S/${params.amount.toFixed(2)}</p>
              ${params.reference ? `<p style="margin:0;font-size:14px;color:#374151;"><strong>Referencia:</strong> ${params.reference}</p>` : ''}
            </div>
            <div style="text-align:center;margin:24px 0 0;">
              <a href="${APP_URL}/admin"
                 style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">
                Abrir panel de administración
              </a>
            </div>
          </div>
          <div style="text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;">Enviado por Kyllari · Crea tu tienda online en minutos</div>
        </div>
      `,
    })

    if (error) {
      console.error('[EMAIL] Admin payment alert error:', error)
      return
    }
    console.log(`[EMAIL] Admin payment alert sent for ${params.storeName}, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Admin payment alert failed (non-blocking):', err)
  }
}

// ── Admin New User Alert (aviso al dueño cuando alguien crea cuenta) ──
// Solo llega al correo personal del admin; el cliente nuevo no ve nada.
export async function sendAdminNewUserAlertEmail(params: {
  name: string
  email: string
  phone?: string | null
}): Promise<void> {
  try {
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Nuevo registro: ${params.name} (${params.email})`,
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="text-align:center;padding:32px 0 16px;">
            <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius:12px;" />
            <h1 style="margin:16px 0 8px;font-size:20px;font-weight:700;color:#1f2937;">Kyllari</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1f2937;">Alguien se acaba de registrar</h2>
            <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">
              Una nueva cuenta fue creada. A&uacute;n no ha creado tienda ni ha pagado plan.
            </p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 20px;">
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Nombre:</strong> ${params.name}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Correo:</strong> ${params.email}</p>
              ${params.phone ? `<p style="margin:0;font-size:14px;color:#374151;"><strong>Tel&eacute;fono:</strong> ${params.phone}</p>` : ''}
            </div>
            <div style="text-align:center;margin:24px 0 0;">
              <a href="${APP_URL}/admin"
                 style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">
                Abrir panel de administraci&oacute;n
              </a>
            </div>
          </div>
          <div style="text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;">Enviado por Kyllari &middot; Crea tu tienda online en minutos</div>
        </div>
      `,
    })

    if (error) {
      console.error('[EMAIL] Admin new user alert error:', error)
      return
    }
    console.log(`[EMAIL] Admin new user alert sent for ${params.email}, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Admin new user alert failed (non-blocking):', err)
  }
}

// ── Admin New Store Alert (aviso al dueño cuando alguien crea su tienda) ──
export async function sendAdminStoreAlertEmail(params: {
  storeName: string
  slug: string
  ownerEmail: string
}): Promise<void> {
  try {
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Nueva tienda creada: ${params.storeName}`,
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="text-align:center;padding:32px 0 16px;">
            <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius:12px;" />
            <h1 style="margin:16px 0 8px;font-size:20px;font-weight:700;color:#1f2937;">Kyllari</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1f2937;">Una tienda nueva est&aacute; en l&iacute;nea</h2>
            <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">
              Un emprendedor termin&oacute; de configurar su tienda y ya est&aacute; publicada.
            </p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 20px;">
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Tienda:</strong> ${params.storeName}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Due&ntilde;o:</strong> ${params.ownerEmail}</p>
              <p style="margin:0;font-size:14px;color:#374151;"><strong>Enlace:</strong> ${APP_URL}/store/${params.slug}</p>
            </div>
            <div style="text-align:center;margin:24px 0 0;">
              <a href="${APP_URL}/store/${params.slug}"
                 style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">
                Ver la tienda
              </a>
            </div>
          </div>
          <div style="text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;">Enviado por Kyllari &middot; Crea tu tienda online en minutos</div>
        </div>
      `,
    })

    if (error) {
      console.error('[EMAIL] Admin store alert error:', error)
      return
    }
    console.log(`[EMAIL] Admin store alert sent for ${params.slug}, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Admin store alert failed (non-blocking):', err)
  }
}

// ── Password Changed Confirmation ──
export async function sendPasswordChangedEmail(name: string, email: string): Promise<void> {
  try {
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Tu contraseña fue cambiada - Kyllari',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="text-align:center;padding:32px 0 16px;">
            <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius:12px;" />
            <h1 style="margin:16px 0 8px;font-size:20px;font-weight:700;color:#1f2937;">Kyllari</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1f2937;">Hola, ${name}</h2>
            <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.6;">
              Tu contraseña fue cambiada correctamente desde la configuración de tu cuenta. Ya puedes usar tu nueva contraseña para entrar.
            </p>
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin:0 0 20px;">
              <p style="margin:0;font-size:14px;color:#ea580c;">
                <strong>¿No fuiste tú?</strong> Alguien pudo entrar a tu cuenta. Cambia tu contraseña de nuevo desde la página de acceso y contáctanos de inmediato.
              </p>
            </div>
          </div>
          <div style="text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;">Enviado por Kyllari · Crea tu tienda online en minutos</div>
        </div>
      `,
    })

    if (error) {
      console.error('[EMAIL] Password changed email error:', error)
      return
    }
    console.log(`[EMAIL] Password changed email sent, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Password changed email failed (non-blocking):', err)
  }
}

// ── Contacto web (formulario de /contact) ──
// Sin WhatsApp de soporte (decisión del dueño): el formulario envía un email
// al administrador con reply_to = correo del visitante para responder 1-clic.
// SÍ lanza error si Resend falla: la API responde 500 y el formulario muestra
// el email directo como plan B (el mensaje nunca se pierde en silencio).
export async function sendContactEmail(params: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  const { data, error } = await sendEmail({
    from: FROM_EMAIL,
    to: ADMIN_NOTIFY_EMAIL,
    replyTo: params.email,
    subject: `[Contacto web] ${params.subject} — ${params.name}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="text-align:center;padding:32px 0 16px;">
          <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius:12px;" />
          <h1 style="margin:16px 0 8px;font-size:20px;font-weight:700;color:#1f2937;">Kyllari</h1>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
          <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1f2937;">Nuevo mensaje desde la web</h2>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 20px;">
            <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Nombre:</strong> ${params.name}</p>
            <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Email:</strong> ${params.email}</p>
            <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Asunto:</strong> ${params.subject}</p>
          </div>
          <p style="margin:0 0 8px;font-size:14px;color:#374151;"><strong>Mensaje:</strong></p>
          <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;white-space:pre-wrap;">${params.message}</p>
        </div>
        <div style="text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;">Enviado por Kyllari · Crea tu tienda online en minutos</div>
      </div>
    `,
  })

  if (error) {
    console.error('[EMAIL] Contact email error:', error)
    throw new Error('No se pudo enviar el mensaje de contacto')
  }
  console.log(`[EMAIL] Contact email sent from ${params.email}, id: ${data?.id}`)
}

// ============================================================
// CORREOS DE VENCIMIENTO DE PLAN (cron diario + barrido)
//   - Avisos escalonados: 7 / 3 / 1 día antes de nextBillingDate
//   - Aviso "venció" al entrar a los 7 días de gracia (past_due)
// Mismo layout que las plantillas de suscripción. El envío real
// es decidido por src/lib/billing-emails.ts (dedupe vía EmailLog):
// aquí solo se construye y se manda.
// ============================================================

function expirationEmailShell(opts: {
  name: string
  themeBg: string
  themeBorder: string
  themeColor: string
  heading: string
  messageHtml: string
  extraHtml: string
  ctaText: string
  ctaBg: string
}) {
  return `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <img src="${APP_URL}/logo-email.png" width="48" height="48" alt="Kyllari" style="border-radius: 12px;" />
          <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">Kyllari</h1>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
            Hola, ${opts.name}
          </h2>

          <div style="display: flex; align-items: center; gap: 10px; background: ${opts.themeBg}; border: 1px solid ${opts.themeBorder}; border-radius: 8px; padding: 14px 16px; margin: 0 0 20px;">
            <span style="font-size: 15px; font-weight: 600; color: ${opts.themeColor};">${opts.heading}</span>
          </div>

          <div style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            ${opts.messageHtml}
          </div>

          ${opts.extraHtml}

          <div style="text-align: center; margin: 24px 0;">
            <a href="${APP_URL}/dashboard/plan"
               style="display: inline-block; background: ${opts.ctaBg}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              ${opts.ctaText}
            </a>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
        </div>

        <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0 0 4px;">Enviado por Kyllari</p>
          <p style="margin: 0;">Crea tu tienda online en minutos</p>
        </div>
      </div>
    `
}

function fechaCorta(d: Date): string {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long' }).format(d)
}

export async function sendSubscriptionExpiringEmail(
  userName: string,
  userEmail: string,
  planName: string,
  planPrice: number,
  daysLeft: 7 | 3 | 1,
  dueDate: Date
): Promise<void> {
  try {
    const fecha = fechaCorta(dueDate)
    const heads: Record<7 | 3 | 1, { subject: string; heading: string; intro: string }> = {
      7: {
        subject: `Tu plan ${planName} vence en 7 días`,
        heading: `⏰ Tu plan ${planName} vence el ${fecha}`,
        intro: `Tu plan <strong>${planName}</strong> (S/${planPrice}/mes) vence en <strong>7 días</strong>, el ${fecha}.`,
      },
      3: {
        subject: `Últimos 3 días de tu plan ${planName}`,
        heading: `⏰ Quedan 3 días: vence el ${fecha}`,
        intro: `Tu plan <strong>${planName}</strong> (S/${planPrice}/mes) vence el <strong>${fecha}</strong>, en 3 días.`,
      },
      1: {
        subject: `Tu plan ${planName} vence mañana`,
        heading: `⏰ Mañana vence tu plan ${planName}`,
        intro: `Tu plan <strong>${planName}</strong> (S/${planPrice}/mes) vence <strong>mañana</strong>, el ${fecha}.`,
      },
    }
    const h = heads[daysLeft]
    const html = expirationEmailShell({
      name: userName,
      themeBg: '#fef3c7',
      themeBorder: '#fcd34d',
      themeColor: '#b45309',
      heading: h.heading,
      messageHtml: `<p style="margin: 0 0 12px;">${h.intro}</p>
            <p style="margin: 0;">Si ya tienes tu comprobante de pago listo, súbelo y se confirmará pronto. Renueva a tiempo y tu tienda sigue vendiendo sin interrupciones.</p>`,
      extraHtml: '',
      ctaText: 'Renovar mi plan',
      ctaBg: '#d97706',
    })
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: userEmail,
      subject: h.subject,
      html,
    })
    if (error) {
      console.error(`[EMAIL] Error sending expiring email (${daysLeft}d):`, error)
      return
    }
    console.log(`[EMAIL] Expiring email (${daysLeft}d) sent to ${userEmail}, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Expiring email failed (non-blocking):', err)
  }
}

export async function sendSubscriptionExpiredEmail(
  userName: string,
  userEmail: string,
  planName: string,
  planPrice: number
): Promise<void> {
  try {
    const html = expirationEmailShell({
      name: userName,
      themeBg: '#fef2f2',
      themeBorder: '#fecaca',
      themeColor: '#b91c1c',
      heading: `Tu plan ${planName} venció`,
      messageHtml: `<p style="margin: 0 0 12px;">Tu plan <strong>${planName}</strong> (S/${planPrice}/mes) acaba de vencer.</p>
            <p style="margin: 0 0 12px;">Tienes <strong>7 días de gracia</strong> con todo funcionando para renovar. Pasado ese tiempo tu tienda vuelve al plan <strong>Gratuito</strong> automáticamente.</p>
            <p style="margin: 0;"><strong>No se borra nada</strong>: tus productos, pedidos y configuración se conservan. En cuanto confirme tu pago, tu plan vuelve a estar activo.</p>`,
      extraHtml: '',
      ctaText: 'Renovar mi plan ahora',
      ctaBg: '#dc2626',
    })
    const { data, error } = await sendEmail({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Tu plan ${planName} venció — renuévalo para no perder beneficios`,
      html,
    })
    if (error) {
      console.error('[EMAIL] Error sending expired email:', error)
      return
    }
    console.log(`[EMAIL] Expired email sent to ${userEmail}, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Expired email failed (non-blocking):', err)
  }
}
