import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { authenticateRequest, requireRole } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// POST /api/admin/migrate - Auto-create missing tables (super_admin only)
// This ensures all required tables exist in Supabase even if migrations weren't run
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  if (!requireRole(auth.user, ['super_admin'])) {
    return apiError('Acceso denegado. Solo administradores.', 403, undefined, request)
  }

  const results: { table: string; action: string; success: boolean; error?: string }[] = []

  const tables = [
    {
      name: 'Plan',
      sql: `CREATE TABLE IF NOT EXISTS "Plan" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'PEN',
        "maxProducts" INTEGER NOT NULL DEFAULT 10,
        "description" TEXT NOT NULL DEFAULT '',
        "features" JSONB NOT NULL DEFAULT '[]',
        "popular" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "Plan_type_key" ON "Plan"("type");`,
    },
    {
      name: 'User',
      sql: `CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'store_owner',
        "phone" TEXT,
        "avatar" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP(3),
        "resetToken" TEXT,
        "resetTokenExpires" TIMESTAMP(3),
        "tokenVersion" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
      CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive");
      CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
      CREATE INDEX IF NOT EXISTS "User_resetToken_idx" ON "User"("resetToken");`,
    },
    {
      name: 'Store',
      sql: `CREATE TABLE IF NOT EXISTS "Store" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "logo" TEXT NOT NULL DEFAULT '',
        "primaryColor" TEXT NOT NULL DEFAULT '#7C3AED',
        "secondaryColor" TEXT NOT NULL DEFAULT '#10B981',
        "whatsappNumber" TEXT,
        "template" TEXT NOT NULL DEFAULT 'moderna',
        "bannerUrl" TEXT NOT NULL DEFAULT '',
        "category" TEXT NOT NULL DEFAULT 'otros',
        "hasShipping" BOOLEAN NOT NULL DEFAULT false,
        "hasSecurePayment" BOOLEAN NOT NULL DEFAULT false,
        "hasReturns" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "visitCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "ownerId" TEXT NOT NULL,
        CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "Store_slug_key" ON "Store"("slug");
      CREATE INDEX IF NOT EXISTS "Store_ownerId_idx" ON "Store"("ownerId");
      CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");
      CREATE INDEX IF NOT EXISTS "Store_category_idx" ON "Store"("category");`,
    },
    {
      name: 'StoreProduct',
      sql: `CREATE TABLE IF NOT EXISTS "StoreProduct" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "price" DECIMAL(10,2) NOT NULL,
        "originalPrice" DECIMAL(10,2),
        "imageUrl" TEXT NOT NULL DEFAULT '',
        "category" TEXT NOT NULL DEFAULT '',
        "color" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "storeId" TEXT NOT NULL,
        CONSTRAINT "StoreProduct_pkey" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "StoreProduct_storeId_idx" ON "StoreProduct"("storeId");
      CREATE INDEX IF NOT EXISTS "StoreProduct_category_idx" ON "StoreProduct"("category");`,
    },
    {
      name: 'Subscription',
      sql: `CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3),
        "nextBillingDate" TIMESTAMP(3),
        "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
        "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "userId" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "planId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
      CREATE INDEX IF NOT EXISTS "Subscription_storeId_idx" ON "Subscription"("storeId");
      CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");`,
    },
    {
      name: 'Payment',
      sql: `CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'PEN',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "paymentMethod" TEXT,
        "externalRef" TEXT,
        "gatewayResponse" TEXT,
        "receiptUrl" TEXT,
        "verifiedAt" TIMESTAMP(3),
        "verifiedBy" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "subscriptionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "planId" TEXT NOT NULL,
        CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
      CREATE INDEX IF NOT EXISTS "Payment_storeId_idx" ON "Payment"("storeId");
      CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
      CREATE INDEX IF NOT EXISTS "Payment_externalRef_idx" ON "Payment"("externalRef");`,
    },
    {
      name: 'PlatformSetting',
      sql: `CREATE TABLE IF NOT EXISTS "PlatformSetting" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSetting_key_key" ON "PlatformSetting"("key");
      CREATE INDEX IF NOT EXISTS "PlatformSetting_key_idx" ON "PlatformSetting"("key");`,
    },
    {
      name: 'AuditLog',
      sql: `CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "userId" TEXT,
        "userEmail" TEXT,
        "ip" TEXT,
        "details" JSONB,
        "success" BOOLEAN NOT NULL DEFAULT true,
        "statusCode" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
      CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
      CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");`,
    },
  ]

  // Add foreign keys separately (they depend on tables existing)
  const foreignKeys = [
    `DO $$ BEGIN ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "Payment" ADD CONSTRAINT "Payment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
    `DO $$ BEGIN ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;`,
  ]

  // Create tables
  for (const table of tables) {
    try {
      // Check if table exists
      const exists = await db.$queryRawUnsafe(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table.name}')`
      ) as Array<{ exists: boolean }>

      if (exists[0]?.exists) {
        results.push({ table: table.name, action: 'already_exists', success: true })
      } else {
        await db.$executeRawUnsafe(table.sql)
        results.push({ table: table.name, action: 'created', success: true })
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      results.push({ table: table.name, action: 'error', success: false, error: errMsg.substring(0, 200) })
    }
  }

  // Add foreign keys
  for (const fkSql of foreignKeys) {
    try {
      await db.$executeRawUnsafe(fkSql)
    } catch {
      // Foreign key may already exist, that's OK
    }
  }

  return apiSuccess({
    message: 'Migracion completada',
    results,
    foreignKeys: 'applied',
  }, 200, request)
}

// OPTIONS /api/admin/migrate - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
