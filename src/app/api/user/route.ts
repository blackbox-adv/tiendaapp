import { db } from '@/lib/db';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeDecimals } from '@/lib/utils';

// GET /api/user - Get current user data with stores and subscription info
// Uses raw SQL to avoid PgBouncer timeout with Prisma include
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;

    // 1) Get basic user info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingDone: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError('Usuario no encontrado', 404, undefined, request);
    }

    // 2) Get user's stores with product/category counts using raw SQL
    const storeRows = await db.$queryRawUnsafe(`
      SELECT s.id, s.slug, s.name, s.description, s.template, s.logo,
        s."whatsappNumber", s.category, s."primaryColor", s."secondaryColor",
        s."hasShipping", s."hasSecurePayment", s."hasReturns",
        s."popupEnabled", s."popupType", s."popupButtonText",
        s."isDemo", s."isActive",
        COALESCE(pc.cnt, 0)::int as "productCount",
        COALESCE(cc.cnt, 0)::int as "categoryCount"
      FROM "Store" s
      LEFT JOIN (
        SELECT "storeId", COUNT(*)::int as cnt FROM "StoreProduct" WHERE "isActive" = true GROUP BY "storeId"
      ) pc ON pc."storeId" = s.id
      LEFT JOIN (
        SELECT "storeId", COUNT(*)::int as cnt FROM "Category" GROUP BY "storeId"
      ) cc ON cc."storeId" = s.id
      WHERE s."ownerId" = $1
      ORDER BY s."createdAt" DESC
    `, userId) as Array<Record<string, unknown>>;

    const stores = storeRows.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      template: s.template,
      logo: s.logo,
      whatsappNumber: s.whatsappNumber,
      category: s.category,
      primaryColor: s.primaryColor,
      secondaryColor: s.secondaryColor,
      hasShipping: s.hasShipping,
      hasSecurePayment: s.hasSecurePayment,
      hasReturns: s.hasReturns,
      popupEnabled: s.popupEnabled,
      popupType: s.popupType,
      popupButtonText: s.popupButtonText,
      isDemo: s.isDemo,
      isActive: s.isActive,
      _count: {
        products: Number(s.productCount) || 0,
        categories: Number(s.categoryCount) || 0,
      },
    }));

    // 3) Get active subscription with plan info using raw SQL
    const subRows = await db.$queryRawUnsafe(`
      SELECT sub.id, sub.status, sub."planId",
        p.id as "planId", p.name as "planName", p.type as "planType",
        p.price::text as "planPrice", p."maxProducts", p.features
      FROM "Subscription" sub
      JOIN "Plan" p ON p.id = sub."planId"
      WHERE sub."userId" = $1 AND sub.status = 'active'
      ORDER BY sub."createdAt" DESC LIMIT 1
    `, userId) as Array<Record<string, unknown>>;

    const subscriptions = subRows.map((s) => ({
      id: s.id,
      status: s.status,
      plan: {
        id: s.planId,
        name: s.planName,
        type: s.planType,
        price: parseFloat(String(s.planPrice || '0')),
        maxProducts: s.maxProducts,
        features: s.features,
      },
    }));

    return apiSuccess(serializeDecimals({
      ...user,
      stores,
      subscriptions,
    }), 200, request);
  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Error al obtener usuario', 500, undefined, request);
  }
}

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'phone', 'avatar'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingDone: true,
        avatar: true,
        phone: true,
      },
    });

    return apiSuccess(user, 200, request);
  } catch (error) {
    console.error('Update user error:', error);
    return apiError('Error al actualizar usuario', 500, undefined, request);
  }
}
