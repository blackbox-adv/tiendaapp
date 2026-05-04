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

// ── Subscription Email Templates ──

function subscriptionTemplate(
  name: string,
  planName: string,
  planPrice: number,
  action: 'activated' | 'cancelled' | 'downgraded'
) {
  const config = {
    activated: {
      subject: 'Tu suscripción a TiendApp ha sido activada',
      themeBg: '#ecfdf5',
      themeBorder: '#a7f3d0',
      themeColor: '#059669',
      themeIcon: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `,
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
      subject: 'Tu suscripción a TiendApp ha sido cancelada',
      themeBg: '#fff7ed',
      themeBorder: '#fed7aa',
      themeColor: '#ea580c',
      themeIcon: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `,
      heading: 'Suscripción cancelada',
      message: `Tu plan <strong>${planName}</strong> ha sido cancelado. Tu cuenta vuelve al plan Gratuito.`,
      extraHtml: `
        <div style="margin: 20px 0 24px;">
          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
            Los datos de tu tienda se conservarán durante <strong>30 días</strong>. Si deseas reactivar tu plan, puedes hacerlo en cualquier momento desde tu panel.
          </p>
        </div>
      `,
      ctaText: 'Volver a TiendApp',
      ctaUrl: APP_URL,
      ctaBg: '#ea580c',
      footerNote: '',
    },
    downgraded: {
      subject: 'Tu plan en TiendApp ha cambiado',
      themeBg: '#eff6ff',
      themeBorder: '#bfdbfe',
      themeColor: '#2563eb',
      themeIcon: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      `,
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

          <div style="display: flex; align-items: center; gap: 10px; background: ${c.themeBg}; border: 1px solid ${c.themeBorder}; border-radius: 8px; padding: 14px 16px; margin: 0 0 20px;">
            ${c.themeIcon}
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
          <p style="margin: 0 0 4px;">Enviado por TiendApp - BlackboxPeru</p>
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
    const resend = getResend()
    const template = subscriptionTemplate(userName, planName, planPrice, action)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error(`[EMAIL] Error sending subscription email (${action}):`, error)
      return
    }

    console.log(`[EMAIL] Subscription email (${action}) sent to ${userEmail}, id: ${data?.id}`)
  } catch (err) {
    console.error(`[EMAIL] Subscription email (${action}) failed (non-blocking):`, err)
  }
}
