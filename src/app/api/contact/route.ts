import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'

// POST /api/contact — formulario de contacto de la landing (/contact).
// Sin WhatsApp de soporte (decisión del dueño): el mensaje llega POR EMAIL
// al administrador (ADMIN_NOTIFY_EMAIL) con reply_to del visitante.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
    }

    const name = String((body as Record<string, unknown>).name ?? '').trim()
    const email = String((body as Record<string, unknown>).email ?? '').trim()
    const subject = String((body as Record<string, unknown>).subject ?? '').trim()
    const message = String((body as Record<string, unknown>).message ?? '').trim()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Completa todos los campos obligatorios' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'El email no es válido' }, { status: 400 })
    }
    if (name.length > 120 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'Algún campo es demasiado largo' }, { status: 400 })
    }

    await sendContactEmail({ name, email, subject, message })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[CONTACT] Error enviando mensaje de contacto:', err)
    return NextResponse.json(
      { error: 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por email.' },
      { status: 500 }
    )
  }
}
