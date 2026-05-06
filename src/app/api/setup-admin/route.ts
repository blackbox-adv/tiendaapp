import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'

// POST /api/setup-admin - Create or reset admin password
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const action = body.action || 'create'

    if (action === 'reset') {
      // Reset password for existing admin
      const existing = await db.user.findFirst({ where: { role: 'super_admin' } })
      if (!existing) {
        return NextResponse.json({ error: 'No existe admin' }, { status: 404 })
      }
      const newPass = body.password || 'TiendaApp2024'
      await db.user.update({
        where: { id: existing.id },
        data: { password: await hashPassword(newPass) },
      })
      return NextResponse.json({
        success: true,
        message: 'Password reseteado',
        email: existing.email,
        password: newPass,
      })
    }

    // Create admin (or update if exists)
    const existing = await db.user.findFirst({ where: { role: 'super_admin' } })
    if (existing) {
      // Update password of existing admin
      const newPass = 'TiendaApp2024'
      await db.user.update({
        where: { id: existing.id },
        data: { password: await hashPassword(newPass), email: 'admin@tiendapp.pe' },
      })
      return NextResponse.json({
        success: true,
        message: 'Admin actualizado',
        email: 'admin@tiendapp.pe',
        password: newPass,
      })
    }

    // Create new admin
    const admin = await db.user.create({
      data: {
        email: 'admin@tiendapp.pe',
        password: await hashPassword('TiendaApp2024'),
        name: 'Administrador',
        role: 'super_admin',
        phone: '+51999999999',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin creado exitosamente',
      email: admin.email,
      password: 'TiendaApp2024',
    })
  } catch (error: unknown) {
    console.error('[SETUP-ADMIN] Error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
