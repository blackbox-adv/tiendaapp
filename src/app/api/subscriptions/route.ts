import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { validateBody, createSubscriptionSchema, updateSubscriptionSchema } from '@/lib/validations'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { sendSubscriptionEmail } from '@/lib/email'
import { serializeDecimals, decimalToNumber } from '@/lib/utils'

// GET /api/subscriptions - Admin only
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado', 403, undefined, request)
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Use raw SQL to avoid PgBouncer timeout with Prisma include
    const subscriptions = await db.$queryRawUnsafe(`
      SELECT sub.id, sub.status, sub."startDate"::text, sub."endDate"::text,
        sub."nextBillingDate"::text, sub."billingCycle", sub."amountPaid"::text,
        sub."createdAt"::text,
        u.id as "userId", u.name as "userName", u.email as "userEmail",
        s.id as "storeId", s.name as "storeName", s.slug as "storeSlug",
        p.id as "planId", p.name as "planName", p.price::text as "planPrice", p.type as "planType"
      FROM "Subscription" sub
      JOIN "User" u ON sub."userId" = u.id
      LEFT JOIN "Store" s ON sub."storeId" = s.id
      JOIN "Plan" p ON sub."planId" = p.id
      ORDER BY sub."startDate" DESC
      LIMIT $1 OFFSET $2
    `, limit, skip) as Array<Record<string, unknown>>

    const countResult = await db.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM "Subscription"`) as Array<{ cnt: number }>
    const total = countResult[0]?.cnt || 0

    const mapped = subscriptions.map((sub) => ({
      id: sub.id,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      nextBillingDate: sub.nextBillingDate,
      billingCycle: sub.billingCycle,
      amountPaid: sub.amountPaid ? parseFloat(String(sub.amountPaid)) : 0,
      createdAt: sub.createdAt,
      user: { id: sub.userId, name: sub.userName, email: sub.userEmail },
      store: sub.storeId ? { id: sub.storeId, name: sub.storeName, slug: sub.storeSlug } : null,
      plan: { id: sub.planId, name: sub.planName, price: parseFloat(String(sub.planPrice || '0')), type: sub.planType },
    }))

    return apiSuccess(serializeDecimals({
      subscriptions: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }), 200, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] GET error:', error instanceof Error ? error.message : String(error))
    return apiError('Error obteniendo suscripciones', 500, undefined, request)
  }
}

// POST /api/subscriptions - Auth required
// Users can ONLY create free plan subscriptions.
// Paid plan subscriptions are created ONLY via admin approval or webhook.
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(createSubscriptionSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { userId, storeId, planId } = validation.data

    // Users can only manage their own subscriptions (unless admin)
    if (!requireRole(auth.user, ['super_admin']) && auth.user.userId !== userId) {
      return apiError('Acceso denegado. Solo puedes gestionar tus suscripciones.', 403, undefined, request)
    }

    // Verify the plan exists
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return apiError('Plan no encontrado', 404, undefined, request)
    }

    // CRITICAL FIX: Non-admin users CANNOT activate paid plans directly.
    // Paid plans must go through the payment flow (admin approval or webhook).
    if (plan.type !== 'free' && !requireRole(auth.user, ['super_admin'])) {
      return apiError(
        'No puedes activar un plan de pago directamente. Realiza el pago a través del flujo de suscripción.',
        403,
        undefined,
        request
      )
    }

    // Verify store ownership if storeId provided
    if (storeId) {
      const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } })
      if (!store) {
        return apiError('Tienda no encontrada', 404, undefined, request)
      }
      if (!requireRole(auth.user, ['super_admin']) && store.ownerId !== auth.user.userId) {
        return apiError('Acceso denegado. No eres dueño de esta tienda.', 403, undefined, request)
      }
    }

    // Check for existing active subscription - use raw SQL to avoid PgBouncer include issues
    const existingRows = storeId
      ? await db.$queryRawUnsafe(`
          SELECT id, "planId", status FROM "Subscription"
          WHERE "userId" = $1 AND "storeId" = $2 AND status = 'active'
          LIMIT 1
        `, userId, storeId) as Array<Record<string, unknown>>
      : await db.$queryRawUnsafe(`
          SELECT id, "planId", status FROM "Subscription"
          WHERE "userId" = $1 AND status = 'active'
          LIMIT 1
        `, userId) as Array<Record<string, unknown>>

    const existing = existingRows[0]

    // Calculate nextBillingDate based on billing cycle for paid plans
    const nextBillingDate = plan.type !== 'free'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      : null

    if (existing) {
      // Update existing subscription using raw SQL
      const nextBillingSql = nextBillingDate ? `'${nextBillingDate.toISOString()}'` : 'NULL'
      await db.$queryRawUnsafe(`
        UPDATE "Subscription"
        SET "planId" = $1, status = 'active', "startDate" = NOW(), "nextBillingDate" = ${nextBillingSql}
        WHERE id = $2
      `, planId, existing.id)

      // Return the updated subscription with relations
      const updated = await db.$queryRawUnsafe(`
        SELECT sub.*,
          u.name as "userName", u.email as "userEmail",
          s.name as "storeName", s.slug as "storeSlug",
          p.name as "planName", p.price::text as "planPrice", p.type as "planType"
        FROM "Subscription" sub
        JOIN "User" u ON sub."userId" = u.id
        LEFT JOIN "Store" s ON sub."storeId" = s.id
        JOIN "Plan" p ON sub."planId" = p.id
        WHERE sub.id = $1
      `, existing.id) as Array<Record<string, unknown>>

      // Send email notification for free plan downgrade
      if (plan.type === 'free' && existing.planId !== planId) {
        const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
        if (user) {
          sendSubscriptionEmail(user.name, user.email, plan.name, decimalToNumber(plan.price), 'downgraded').catch(() => {})
        }
      }

      const result = updated[0] ? {
        id: updated[0].id,
        status: 'active',
        user: { id: userId, name: updated[0].userName, email: updated[0].userEmail },
        store: updated[0].storeName ? { id: storeId, name: updated[0].storeName, slug: updated[0].storeSlug } : null,
        plan: { id: planId, name: updated[0].planName, price: parseFloat(String(updated[0].planPrice || '0')), type: updated[0].planType },
      } : { id: existing.id, status: 'active', plan: { id: planId, type: plan.type } }

      return apiSuccess(serializeDecimals(result), 200, request)
    }

    // Create new subscription using raw SQL to avoid PgBouncer issues
    const subId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const effectiveStoreId = storeId || ''
    const nextBillingSql = nextBillingDate ? `'${nextBillingDate.toISOString()}'` : 'NULL'

    await db.$queryRawUnsafe(`
      INSERT INTO "Subscription" (id, "userId", "storeId", "planId", status, "startDate", "nextBillingDate", "billingCycle", "amountPaid", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, 'active', NOW(), ${nextBillingSql}, 'monthly', 0, NOW(), NOW())
    `, subId, userId, effectiveStoreId, planId)

    // Fetch the created subscription with relations
    const created = await db.$queryRawUnsafe(`
      SELECT sub.*,
        u.name as "userName", u.email as "userEmail",
        s.name as "storeName", s.slug as "storeSlug",
        p.name as "planName", p.price::text as "planPrice", p.type as "planType"
      FROM "Subscription" sub
      JOIN "User" u ON sub."userId" = u.id
      LEFT JOIN "Store" s ON sub."storeId" = s.id
      JOIN "Plan" p ON sub."planId" = p.id
      WHERE sub.id = $1
    `, subId) as Array<Record<string, unknown>>

    const result = created[0] ? {
      id: created[0].id,
      status: 'active',
      user: { id: userId, name: created[0].userName, email: created[0].userEmail },
      store: created[0].storeName ? { id: effectiveStoreId, name: created[0].storeName, slug: created[0].storeSlug } : null,
      plan: { id: planId, name: created[0].planName, price: parseFloat(String(created[0].planPrice || '0')), type: created[0].planType },
    } : { id: subId, status: 'active', plan: { id: planId, type: plan.type } }

    return apiSuccess(serializeDecimals(result), 201, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] POST error:', error instanceof Error ? error.message : String(error))
    return apiError('Error creando suscripción: ' + (error instanceof Error ? error.message : String(error)), 500, undefined, request)
  }
}

// PUT /api/subscriptions - Auth required (admin can update any, user can cancel own)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const body = await request.json()
    const validation = validateBody(updateSubscriptionSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request)
    }

    const { id, planId, status } = validation.data

    // Fetch subscription to check ownership - use raw SQL
    const subRows = await db.$queryRawUnsafe(`
      SELECT sub.id, sub."userId", sub.status,
        u.name as "userName", u.email as "userEmail",
        p.name as "planName", p.price::text as "planPrice"
      FROM "Subscription" sub
      JOIN "User" u ON sub."userId" = u.id
      JOIN "Plan" p ON sub."planId" = p.id
      WHERE sub.id = $1
    `, id) as Array<Record<string, unknown>>

    const subscription = subRows[0]

    if (!subscription) {
      return apiError('Suscripción no encontrada', 404, undefined, request)
    }

    // Only admin or subscription owner can update
    if (!requireRole(auth.user, ['super_admin']) && subscription.userId !== auth.user.userId) {
      return apiError('Acceso denegado', 403, undefined, request)
    }

    // Non-admin users can only cancel their own subscription
    if (!requireRole(auth.user, ['super_admin']) && status && status !== 'cancelled') {
      return apiError('Solo puedes cancelar tu suscripción. Contacta soporte para otros cambios.', 403, undefined, request)
    }

    // Build update SQL
    const updates: string[] = []
    const params: unknown[] = []
    let paramIdx = 1

    if (planId) {
      updates.push(`"planId" = $${paramIdx++}`)
      params.push(planId)
    }
    if (status) {
      updates.push(`status = $${paramIdx++}`)
      params.push(status)
      if (status === 'cancelled') {
        updates.push(`"endDate" = NOW()`)
      }
    }

    if (updates.length > 0) {
      params.push(id)
      await db.$queryRawUnsafe(`
        UPDATE "Subscription" SET ${updates.join(', ')} WHERE id = $${paramIdx}
      `, ...params)
    }

    // Send cancellation email
    if (status === 'cancelled' && subscription.userEmail) {
      sendSubscriptionEmail(
        String(subscription.userName || ''),
        String(subscription.userEmail || ''),
        String(subscription.planName || ''),
        parseFloat(String(subscription.planPrice || '0')),
        'cancelled'
      ).catch(() => {})
    }

    // Fetch updated subscription
    const updatedRows = await db.$queryRawUnsafe(`
      SELECT sub.*,
        u.name as "userName", u.email as "userEmail",
        s.name as "storeName", s.slug as "storeSlug",
        p.id as "planId", p.name as "planName", p.price::text as "planPrice", p.type as "planType"
      FROM "Subscription" sub
      JOIN "User" u ON sub."userId" = u.id
      LEFT JOIN "Store" s ON sub."storeId" = s.id
      JOIN "Plan" p ON sub."planId" = p.id
      WHERE sub.id = $1
    `, id) as Array<Record<string, unknown>>

    const result = updatedRows[0] ? {
      id: updatedRows[0].id,
      status: updatedRows[0].status,
      user: { name: updatedRows[0].userName, email: updatedRows[0].userEmail },
      store: updatedRows[0].storeName ? { name: updatedRows[0].storeName, slug: updatedRows[0].storeSlug } : null,
      plan: { id: updatedRows[0].planId, name: updatedRows[0].planName, price: parseFloat(String(updatedRows[0].planPrice || '0')), type: updatedRows[0].planType },
    } : { id }

    return apiSuccess(serializeDecimals(result), 200, request)
  } catch (error: unknown) {
    console.error('[SUBSCRIPTIONS] PUT error:', error instanceof Error ? error.message : String(error))
    return apiError('Error actualizando suscripción', 500, undefined, request)
  }
}

// OPTIONS /api/subscriptions - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
