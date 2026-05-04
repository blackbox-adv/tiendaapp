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

const FROM_EMAIL = 'TiendApp <noreply@blackboxperu.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blackboxperu.com'

// ── Email Templates ──

function passwordResetTemplate(name: string, resetUrl: string) {
  return {
    subject: 'Restablece tu contraseña - TiendApp',
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #7C3AED; border-radius: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">TiendApp</h1>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
            Hola, ${name}
          </h2>
          <p style="margin: 0 0 24px; font-size: 15px; color: #4b5563; line-height: 1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en TiendApp. 
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
          <p style="margin: 0 0 4px;">Enviado por TiendApp - BlackboxPeru</p>
          <p style="margin: 0;">Crea tu tienda online en minutos</p>
        </div>
      </div>
    `,
  }
}

function welcomeTemplate(name: string, loginUrl: string) {
  return {
    subject: 'Bienvenido a TiendApp - Tu tienda online lista',
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #7C3AED; border-radius: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h1 style="margin: 16px 0 8px; font-size: 20px; font-weight: 700; color: #1f2937;">TiendApp</h1>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">
            Bienvenido, ${name}!
          </h2>
          <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.6;">
            Tu cuenta en TiendApp ha sido creada exitosamente. Ya puedes comenzar a configurar tu tienda online y empezar a vender.
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
          <p style="margin: 0 0 4px;">Enviado por TiendApp - BlackboxPeru</p>
          <p style="margin: 0;">Crea tu tienda online en minutos</p>
        </div>
      </div>
    `,
  }
}

// ── Public API ──

export async function sendPasswordResetEmail(name: string, email: string, token: string) {
  try {
    const resend = getResend()
    const template = passwordResetTemplate(name, `${APP_URL}/reset-password?token=${token}`)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error('[EMAIL] Error sending password reset:', error)
      return null
    }

    console.log(`[EMAIL] Password reset sent to ${email}, id: ${data?.id}`)
    return data
  } catch (err) {
    console.error('[EMAIL] Password reset failed:', err)
    return null
  }
}

export async function sendWelcomeEmail(name: string, email: string) {
  try {
    const resend = getResend()
    const template = welcomeTemplate(name, APP_URL)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error('[EMAIL] Error sending welcome email:', error)
      return // Don't throw - registration should succeed even if email fails
    }

    console.log(`[EMAIL] Welcome email sent to ${email}, id: ${data?.id}`)
  } catch (err) {
    console.error('[EMAIL] Welcome email failed (non-blocking):', err)
  }
}
