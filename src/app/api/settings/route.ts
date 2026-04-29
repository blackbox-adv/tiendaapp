import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// GET /api/settings - Public
export async function GET() {
  try {
    // Try to get from database (PlatformSettings table)
    // Fallback to defaults if table doesn't exist yet
    let settings: Record<string, string> = {}

    try {
      const dbSettings = await db.platformSetting.findMany()
      for (const s of dbSettings) {
        settings[s.key] = s.value
      }
    } catch {
      // Table doesn't exist yet, use defaults
    }

    const defaults: Record<string, string> = {
      name: 'TiendApp',
      defaultPlanId: 'free',
      maintenanceMode: 'false',
      registrationsEnabled: 'true',
      whatsappSupport: '+51999999999',
      currency: 'PEN',
      countryCode: 'PE',
    }

    // Merge: defaults as base, DB overrides
    return NextResponse.json({ ...defaults, ...settings })
  } catch {
    return NextResponse.json({
      name: 'TiendApp',
      defaultPlanId: 'free',
      maintenanceMode: 'false',
      registrationsEnabled: 'true',
      whatsappSupport: '+51999999999',
      currency: 'PEN',
      countryCode: 'PE',
    })
  }
}

// PUT /api/settings - Admin only
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!auth.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const entries = Object.entries(body) as [string, string][]

    for (const [key, value] of entries) {
      if (typeof key !== 'string' || typeof value !== 'string') continue

      await db.platformSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error actualizando configuracion' }, { status: 500 })
  }
}
