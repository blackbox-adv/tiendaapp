import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { price: 'asc' },
    })

    // Parse features from JSON string to array
    const parsedPlans = plans.map((plan: Record<string, unknown>) => ({
      ...plan,
      features:
        typeof plan.features === 'string'
          ? JSON.parse(plan.features)
          : plan.features ?? [],
    }))

    return NextResponse.json(parsedPlans)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching plans'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
