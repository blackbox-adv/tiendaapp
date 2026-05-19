import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'

// POST /api/setup - Initialize platform with first admin user and plans
// ONLY works when NO users exist in the database (first-run setup)
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only allow setup if no users exist yet
    const userCount = await db.user.count()

    if (userCount > 0) {
      return apiError(
        'La plataforma ya esta inicializada. No se puede ejecutar el setup nuevamente.',
        403,
        undefined,
        request
      )
    }

    // Parse optional body for custom admin credentials
    let adminEmail = 'admin@tiendapp.com'
    let adminPassword = 'admin123'
    let adminName = 'Super Admin'
    let adminPhone = '+51999990000'

    try {
      const body = await request.json()
      if (body.email) adminEmail = body.email
      if (body.password) adminPassword = body.password
      if (body.name) adminName = body.name
      if (body.phone) adminPhone = body.phone
    } catch {
      // No body provided, use defaults
    }

    // Validate minimum password length
    if (adminPassword.length < 6) {
      return apiError('La contrasena debe tener al menos 6 caracteres', 400, undefined, request)
    }

    // Create Plans
    const free = await db.plan.create({
      data: {
        type: 'free',
        name: 'Free',
        price: 0,
        maxProducts: 5,
        description: 'Perfecto para comenzar tu tienda online',
        features: JSON.stringify([
          '1 tienda online',
          '5 productos maximo',
          'Plantilla basica',
          'WhatsApp integrado',
          'Soporte por email',
        ]),
        popular: false,
      },
    })

    const pro = await db.plan.create({
      data: {
        type: 'pro',
        name: 'Pro',
        price: 29.99,
        maxProducts: 20,
        description: 'Para tiendas en crecimiento',
        features: JSON.stringify([
          '1 tienda online',
          '20 productos maximo',
          'Buscador de productos',
          'Todas las plantillas',
          'WhatsApp integrado',
          'Estadisticas avanzadas',
          'Soporte prioritario',
        ]),
        popular: true,
      },
    })

    const premium = await db.plan.create({
      data: {
        type: 'premium',
        name: 'Premium',
        price: 79.99,
        maxProducts: 100,
        description: 'La mejor experiencia para tu negocio',
        features: JSON.stringify([
          'Hasta 3 tiendas online',
          '100 productos maximo',
          'Buscador y filtros avanzados',
          'Todas las plantillas',
          'Dominio personalizado',
          'WhatsApp Business API',
          'Soporte 24/7',
          'Estadisticas avanzadas',
          'API access',
        ]),
        popular: false,
      },
    })

    // Create Super Admin user
    const admin = await db.user.create({
      data: {
        email: adminEmail.toLowerCase(),
        password: await hashPassword(adminPassword),
        name: adminName,
        role: 'super_admin',
        phone: adminPhone,
      },
    })

    // Create default platform settings
    const defaultSettings = [
      { key: 'name', value: 'TiendApp' },
      { key: 'defaultPlanId', value: 'free' },
      { key: 'maintenanceMode', value: 'false' },
      { key: 'registrationsEnabled', value: 'true' },
      { key: 'whatsappSupport', value: '+51999999999' },
      { key: 'currency', value: 'PEN' },
      { key: 'countryCode', value: 'PE' },
    ]
    for (const s of defaultSettings) {
      await db.platformSetting.create({ data: s })
    }

    const result = {
      success: true,
      message: 'Plataforma inicializada exitosamente',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      plans: {
        free: { id: free.id, name: free.name },
        pro: { id: pro.id, name: pro.name },
        premium: { id: premium.id, name: premium.name },
      },
      settings: defaultSettings.length,
    }

    console.log('[SETUP] Platform initialized successfully:', { adminEmail: admin.email })

    auditLog({
      action: 'PLATFORM_SETUP',
      userId: admin.id,
      userEmail: admin.email,
      ip: getClientIp(request),
      details: { adminEmail: admin.email, plansCreated: 3, settingsCreated: defaultSettings.length },
      success: true,
      statusCode: 201,
    })

    return apiSuccess(result, 201, request)
  } catch (error: unknown) {
    console.error('[SETUP] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error inicializando la plataforma', 500, undefined, request)
  }
}

// GET /api/setup - Check if platform is initialized
export async function GET(request: NextRequest) {
  try {
    const userCount = await db.user.count()
    const planCount = await db.plan.count()
    const settingsCount = await db.platformSetting.count()

    return apiSuccess(
      {
        initialized: userCount > 0,
        users: userCount,
        plans: planCount,
        settings: settingsCount,
      },
      200,
      request
    )
  } catch (error: unknown) {
    console.error('[SETUP] Check error:', error instanceof Error ? error.message : String(error))
    return apiError('Error verificando estado de la plataforma', 500, undefined, request)
  }
}

// OPTIONS /api/setup - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
