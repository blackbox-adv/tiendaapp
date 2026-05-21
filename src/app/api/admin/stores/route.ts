import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// GET /api/admin/stores - List all stores (super_admin only)
// Uses raw SQL to avoid PgBouncer prepared statement issues
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)
  if (auth.user.role !== 'super_admin') return apiError('Solo administradores', 403, undefined, request)

  try {
    const sql = db.$queryRawUnsafe.bind(db)

    // Fetch all stores with owner info, product count, and latest subscription
    type StoreRow = {
      id: string; name: string; slug: string; description: string; logo: string
      primaryColor: string; secondaryColor: string; whatsappNumber: string | null
      template: string; category: string; isActive: boolean
      visitCount: number; hasShipping: boolean; hasSecurePayment: boolean; hasReturns: boolean
      createdAt: string; ownerId: string
      ownerName: string; ownerEmail: string
      productCount: number
      subStatus: string | null; planName: string | null; planPrice: string | null
    }

    const storeRows: StoreRow[] = await sql(`
      SELECT
        s.id, s.name, s.slug, s.description, s.logo,
        s."primaryColor", s."secondaryColor", s."whatsappNumber",
        s.template, s.category, s."isActive",
        s."visitCount"::int, s."hasShipping", s."hasSecurePayment", s."hasReturns",
        s."createdAt"::text, s."ownerId",
        u.name as "ownerName", u.email as "ownerEmail",
        COALESCE(pc.cnt, 0)::int as "productCount",
        sub_s.status::text as "subStatus",
        sub_p.name as "planName",
        sub_p.price::text as "planPrice"
      FROM "Store" s
      JOIN "User" u ON s."ownerId" = u.id
      LEFT JOIN (
        SELECT "storeId", COUNT(*)::int as cnt FROM "StoreProduct" WHERE "isActive" = true GROUP BY "storeId"
      ) pc ON pc."storeId" = s.id
      LEFT JOIN LATERAL (
        SELECT sub.status, p.name, p.price
        FROM "Subscription" sub
        JOIN "Plan" p ON sub."planId" = p.id
        WHERE sub."storeId" = s.id
        ORDER BY sub."createdAt" DESC LIMIT 1
      ) sub_s ON true
      LEFT JOIN LATERAL (
        SELECT p.name, p.price
        FROM "Subscription" sub
        JOIN "Plan" p ON sub."planId" = p.id
        WHERE sub."storeId" = s.id
        ORDER BY sub."createdAt" DESC LIMIT 1
      ) sub_p ON true
      ORDER BY s."createdAt" DESC
    `)

    const stores = storeRows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      logo: r.logo,
      primaryColor: r.primaryColor,
      secondaryColor: r.secondaryColor,
      whatsappNumber: r.whatsappNumber,
      template: r.template,
      category: r.category,
      isActive: r.isActive,
      visitCount: r.visitCount,
      hasShipping: r.hasShipping,
      hasSecurePayment: r.hasSecurePayment,
      hasReturns: r.hasReturns,
      createdAt: r.createdAt,
      ownerId: r.ownerId,
      owner: { id: r.ownerId, name: r.ownerName, email: r.ownerEmail },
      _count: { products: r.productCount },
      subscriptions: r.planName ? [{
        status: r.subStatus || 'active',
        plan: { id: '', name: r.planName, price: parseFloat(r.planPrice || '0') },
      }] : [],
    }))

    return apiSuccess(stores, 200, request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[ADMIN STORES] GET error:', message)
    if (error instanceof Error && error.stack) console.error('[ADMIN STORES] stack:', error.stack)
    return apiError('Error obteniendo tiendas', 500, undefined, request)
  }
}

// DELETE /api/admin/stores?id=xxx - Delete a store (super_admin only)
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)
  if (auth.user.role !== 'super_admin') return apiError('Solo administradores pueden eliminar tiendas', 403, undefined, request)

  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('id')

    if (!storeId) return apiError('ID de tienda requerido', 400, undefined, request)

    // Validate storeId format to prevent SQL injection (cuid or known patterns)
    if (!/^[a-zA-Z0-9-]+$/.test(storeId)) {
      return apiError('ID de tienda invalido', 400, undefined, request)
    }

    const sql = db.$queryRawUnsafe.bind(db)

    // Get store info before deletion
    type StoreInfo = { name: string; pc: number }
    const [storeInfo]: StoreInfo[] = await sql(`
      SELECT s.name, COALESCE(pc.cnt, 0)::int as pc
      FROM "Store" s
      LEFT JOIN (SELECT "storeId", COUNT(*)::int as cnt FROM "StoreProduct" GROUP BY "storeId") pc ON pc."storeId" = s.id
      WHERE s.id = '${storeId}'
    `)

    if (!storeInfo) return apiError('Tienda no encontrada', 404, undefined, request)

    // Delete the store - cascade will handle products, subscriptions, payments
    await db.store.delete({ where: { id: storeId } })

    return apiSuccess({
      message: `Tienda "${storeInfo.name}" eliminada correctamente`,
      deletedStoreId: storeId,
      deletedProducts: storeInfo.pc,
    }, 200, request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[ADMIN STORES] DELETE error:', message)
    return apiError('Error eliminando tienda', 500, undefined, request)
  }
}

// PUT /api/admin/stores - Update store (super_admin can update any store)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) return apiError(auth.error, auth.status, undefined, request)
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)
  if (auth.user.role !== 'super_admin') return apiError('Solo administradores', 403, undefined, request)

  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) return apiError('ID de tienda requerido', 400, undefined, request)

    // Prevent changing ownership via this endpoint
    delete data.ownerId

    // Sanitize string fields
    if (data.name && typeof data.name === 'string') data.name = data.name.trim()
    if (data.description && typeof data.description === 'string') data.description = data.description.trim()
    if (data.category && typeof data.category === 'string') data.category = data.category.trim()

    // Use raw SQL for simple boolean updates (like isActive) to avoid PgBouncer issues
    // For other updates, try Prisma first, fall back to raw SQL
    if (Object.keys(data).length === 1 && typeof data.isActive === 'boolean') {
      // Simple toggle - use raw SQL
      const isActiveVal = data.isActive
      if (!/^[a-zA-Z0-9-]+$/.test(id)) {
        return apiError('ID de tienda invalido', 400, undefined, request)
      }
      await db.$executeRawUnsafe(
        `UPDATE "Store" SET "isActive" = ${isActiveVal}, "updatedAt" = NOW() WHERE id = '${id}'`
      )
      return apiSuccess({ id, isActive: isActiveVal }, 200, request)
    }

    // For other updates, use Prisma (without complex includes to reduce PgBouncer issues)
    const store = await db.store.update({
      where: { id },
      data,
    })

    return apiSuccess(store, 200, request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[ADMIN STORES] PUT error:', message)
    return apiError('Error actualizando tienda', 500, undefined, request)
  }
}

// OPTIONS /api/admin/stores - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
