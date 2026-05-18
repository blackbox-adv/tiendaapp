import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { NextResponse } from 'next/server'

// TEMPORARY: Reset admin password - DELETE AFTER USE
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, newPassword, secret } = body

    if (secret !== 'tiendapp-reset-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and newPassword required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hashedPassword = await hashPassword(newPassword)
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, tokenVersion: { increment: 1 } },
    })

    return NextResponse.json({ success: true, message: `Password reset for ${email}` })
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
