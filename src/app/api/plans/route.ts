import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// GET /api/plans - Public endpoint: list all available plans
export async function GET(request: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      orderBy: { price: 'asc' },
    })

    // Parse features from JSON string to array
    const parsedPlans = plans.map((plan: Record<string, unknown>) => ({
      id: plan.id,
      type: plan.type,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      maxProducts: plan.maxProducts,
      description: plan.description,
      features:
        typeof plan.features === 'string'
          ? JSON.parse(plan.features)
          : Array.isArray(plan.features)
            ? plan.features
            : [],
      popular: plan.popular,
    }))

    return apiSuccess(parsedPlans, 200, request)
  } catch (error: unknown) {
    console.error('[PLANS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo planes', 500, undefined, request)
  }
}

// OPTIONS /api/plans - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
