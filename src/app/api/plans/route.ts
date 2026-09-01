import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { serializeDecimals } from '@/lib/utils'
import { CANONICAL_PLANS } from '@/lib/plans'

// GET /api/plans - Public endpoint: list all available plans
//
// Los precios/limites/features se NORMALIZAN con los valores canónicos de
// src/lib/plans.ts (fuente única de verdad). La BD aporta el `id` real
// (necesario para suscripciones); si la BD está desactualizada o le falta
// un plan, el público nunca ve precios inconsistentes.
export async function GET(request: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      orderBy: { price: 'asc' },
    })

    // Index DB rows by type (type is unique)
    const dbByType = new Map<string, Record<string, unknown>>()
    for (const plan of plans as unknown as Record<string, unknown>[]) {
      if (typeof plan.type === 'string') dbByType.set(plan.type, plan)
    }

    // Build the response from canonical definitions, enriching with DB ids
    const parsedPlans = CANONICAL_PLANS.map((canonical) => {
      const dbRow = dbByType.get(canonical.type)
      return {
        id: (dbRow?.id as string) || canonical.type,
        type: canonical.type,
        name: canonical.name,
        price: canonical.price,
        currency: (dbRow?.currency as string) || 'PEN',
        maxProducts: canonical.maxProducts,
        description: canonical.description,
        features: canonical.features,
        popular: canonical.popular,
      }
    })

    return apiSuccess(serializeDecimals(parsedPlans), 200, request)
  } catch (error: unknown) {
    console.error('[PLANS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo planes', 500, undefined, request)
  }
}

// OPTIONS /api/plans - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
