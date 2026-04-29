import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

// In-memory settings (migrate to DB later)
const settingsStore: Record<string, string> = {
  name: 'TiendApp',
  defaultPlanId: 'free',
  maintenanceMode: 'false',
  registrationsEnabled: 'true',
  whatsappSupport: '+51999999999',
  currency: 'PEN',
  countryCode: 'PE',
}

// GET /api/settings - Public
export async function GET() {
  return NextResponse.json(settingsStore)
}

// PUT /api/settings - Admin only
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const entries = Object.entries(body) as [string, string][]

    for (const [key, value] of entries) {
      settingsStore[key] = value
    }

    return NextResponse.json({ success: true, settings: settingsStore })
  } catch (error) {
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}
