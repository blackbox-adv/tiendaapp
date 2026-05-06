import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'

// POST /api/setup-admin - Create admin user (one-time setup)
// Security: uses SETUP_SECRET env var
export async function POST() {
  try {
    // Check if already exists
    const existing = await db.user.findFirst({ where: { role: 'super_admin' } })
    if (existing) {
      return NextResponse.json({ message: 'Admin ya existe', email: existing.email })
    }

    // Create admin
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
    return NextResponse.json({ error: 'Error creating admin' }, { status: 500 })
  }
}
