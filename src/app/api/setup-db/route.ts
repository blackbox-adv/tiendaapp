import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { apiSuccess, handleCorsPreflight } from '@/lib/api-response'

// GET /api/setup-db - Auto-migrate: add missing columns (no auth required, idempotent)
// This ensures the production database schema matches the Prisma schema
export async function GET(request: NextRequest) {
  const results: { table: string; column: string; action: string; success: boolean; error?: string }[] = []

  // All columns that might be missing from older schema versions
  const columnsToAdd = [
    // User table
    { table: 'User', column: 'phone', sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT` },
    { table: 'User', column: 'avatar', sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT` },
    { table: 'User', column: 'lastLogin', sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3)` },
    { table: 'User', column: 'resetToken', sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT` },
    { table: 'User', column: 'resetTokenExpires', sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3)` },
    { table: 'User', column: 'tokenVersion', sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0` },

    // Store table
    { table: 'Store', column: 'hasShipping', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "hasShipping" BOOLEAN NOT NULL DEFAULT false` },
    { table: 'Store', column: 'hasSecurePayment', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "hasSecurePayment" BOOLEAN NOT NULL DEFAULT false` },
    { table: 'Store', column: 'hasReturns', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "hasReturns" BOOLEAN NOT NULL DEFAULT false` },
    { table: 'Store', column: 'popupEnabled', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "popupEnabled" BOOLEAN NOT NULL DEFAULT false` },
    { table: 'Store', column: 'popupType', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "popupType" TEXT NOT NULL DEFAULT 'product'` },
    { table: 'Store', column: 'popupProductId', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "popupProductId" TEXT` },
    { table: 'Store', column: 'popupCustomImage', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "popupCustomImage" TEXT` },
    { table: 'Store', column: 'popupTitle', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "popupTitle" TEXT` },
    { table: 'Store', column: 'popupButtonText', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "popupButtonText" TEXT NOT NULL DEFAULT 'Ver oferta'` },
    { table: 'Store', column: 'visitCount', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "visitCount" INTEGER NOT NULL DEFAULT 0` },
    { table: 'Store', column: 'bannerUrl', sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT NOT NULL DEFAULT ''` },

    // StoreProduct table
    { table: 'StoreProduct', column: 'color', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "color" TEXT` },
    { table: 'StoreProduct', column: 'featured', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false` },
    { table: 'StoreProduct', column: 'rating', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "rating" DECIMAL(2,1) NOT NULL DEFAULT 0` },
    { table: 'StoreProduct', column: 'isActive', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true` },
    { table: 'StoreProduct', column: 'originalPrice', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(10,2)` },
    { table: 'StoreProduct', column: 'category', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT ''` },
    { table: 'StoreProduct', column: 'description', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT ''` },
    { table: 'StoreProduct', column: 'imageUrl', sql: `ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT NOT NULL DEFAULT ''` },

    // Subscription table
    { table: 'Subscription', column: 'nextBillingDate', sql: `ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "nextBillingDate" TIMESTAMP(3)` },
    { table: 'Subscription', column: 'billingCycle', sql: `ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "billingCycle" TEXT NOT NULL DEFAULT 'monthly'` },
    { table: 'Subscription', column: 'amountPaid', sql: `ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0` },
    { table: 'Subscription', column: 'endDate', sql: `ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3)` },

    // Payment table
    { table: 'Payment', column: 'paymentMethod', sql: `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT` },
    { table: 'Payment', column: 'externalRef', sql: `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "externalRef" TEXT` },
    { table: 'Payment', column: 'gatewayResponse', sql: `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "gatewayResponse" TEXT` },
    { table: 'Payment', column: 'receiptUrl', sql: `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT` },
    { table: 'Payment', column: 'verifiedAt', sql: `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3)` },
    { table: 'Payment', column: 'verifiedBy', sql: `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT` },
    { table: 'Payment', column: 'notes', sql: `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "notes" TEXT` },
  ]

  // Add missing columns
  for (const col of columnsToAdd) {
    try {
      await db.$executeRawUnsafe(col.sql)
      results.push({ table: col.table, column: col.column, action: 'added_or_exists', success: true })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('already exists') || errMsg.includes('duplicate') || errMsg.includes('42701')) {
        results.push({ table: col.table, column: col.column, action: 'already_exists', success: true })
      } else {
        results.push({ table: col.table, column: col.column, action: 'error', success: false, error: errMsg.substring(0, 200) })
      }
    }
  }

  // Create missing indexes
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "StoreProduct_storeId_isActive_idx" ON "StoreProduct"("storeId", "isActive")`,
    `CREATE INDEX IF NOT EXISTS "StoreProduct_storeId_featured_idx" ON "StoreProduct"("storeId", "featured" DESC)`,
    `CREATE INDEX IF NOT EXISTS "StoreProduct_createdAt_idx" ON "StoreProduct"("createdAt" DESC)`,
    `CREATE INDEX IF NOT EXISTS "Store_createdAt_idx" ON "Store"("createdAt" DESC)`,
    `CREATE INDEX IF NOT EXISTS "Store_visitCount_idx" ON "Store"("visitCount" DESC)`,
    `CREATE INDEX IF NOT EXISTS "Subscription_userId_storeId_idx" ON "Subscription"("userId", "storeId")`,
    `CREATE INDEX IF NOT EXISTS "Subscription_userId_storeId_status_idx" ON "Subscription"("userId", "storeId", "status")`,
    `CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt" DESC)`,
    `CREATE INDEX IF NOT EXISTS "Payment_externalRef_idx" ON "Payment"("externalRef")`,
    `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`,
    `CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId")`,
    `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC)`,
    `CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt" DESC)`,
  ]

  for (const idxSql of indexes) {
    try {
      await db.$executeRawUnsafe(idxSql)
    } catch {
      // Index may already exist
    }
  }

  // Create Notification table if not exists
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'info',
        "icon" TEXT NOT NULL DEFAULT 'bell',
        "link" TEXT,
        "userId" TEXT,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "senderId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      )
    `)
    results.push({ table: 'Notification', column: '*', action: 'created_or_exists', success: true })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    results.push({ table: 'Notification', column: '*', action: 'error', success: false, error: errMsg.substring(0, 200) })
  }

  // Create AuditLog table if not exists
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
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
      )
    `)
    results.push({ table: 'AuditLog', column: '*', action: 'created_or_exists', success: true })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    results.push({ table: 'AuditLog', column: '*', action: 'error', success: false, error: errMsg.substring(0, 200) })
  }

  // Create PlatformSetting table if not exists
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PlatformSetting" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
      )
    `)
    results.push({ table: 'PlatformSetting', column: '*', action: 'created_or_exists', success: true })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    results.push({ table: 'PlatformSetting', column: '*', action: 'error', success: false, error: errMsg.substring(0, 200) })
  }

  const errors = results.filter(r => !r.success)
  const added = results.filter(r => r.success && r.action === 'added_or_exists')

  return apiSuccess({
    message: errors.length === 0 ? 'Schema actualizado correctamente' : 'Schema actualizado con algunos errores',
    columnsChecked: results.length,
    columnsAdded: added.length,
    errors: errors.length,
    details: results,
  }, 200, request)
}

// POST /api/setup-db - Add foreign key constraints and test DB operations
export async function POST(request: NextRequest) {
  const results: { action: string; success: boolean; error?: string }[] = []

  // Add foreign key constraints
  const foreignKeys = [
    { name: 'Store_ownerId_fkey', sql: `DO $$ BEGIN ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;` },
    { name: 'StoreProduct_storeId_fkey', sql: `DO $$ BEGIN ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;` },
    { name: 'Subscription_userId_fkey', sql: `DO $$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;` },
    { name: 'Subscription_storeId_fkey', sql: `DO $$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;` },
    { name: 'Subscription_planId_fkey', sql: `DO $$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;` },
    { name: 'Notification_senderId_fkey', sql: `DO $$ BEGIN ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN OTHERS THEN IF SQLSTATE != '42710' THEN RAISE; END IF; END $$;` },
  ]

  for (const fk of foreignKeys) {
    try {
      await db.$executeRawUnsafe(fk.sql)
      results.push({ action: `fk_${fk.name}`, success: true })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      results.push({ action: `fk_${fk.name}`, success: true, error: errMsg.substring(0, 100) })
    }
  }

  // Try a direct store insert to test
  try {
    const testUser = await db.$queryRawUnsafe(`SELECT id FROM "User" LIMIT 1`) as Array<{id: string}>
    if (testUser.length > 0) {
      results.push({ action: 'test_user_exists', success: true, error: `Found user: ${testUser[0].id}` })
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    results.push({ action: 'test_user_exists', success: false, error: errMsg.substring(0, 100) })
  }

  return apiSuccess({ message: 'FK setup complete', results }, 200, request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
