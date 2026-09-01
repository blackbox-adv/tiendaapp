-- ============================================================
-- TiendApp - Migración de esquema para Supabase
-- Ejecutar en: Supabase → SQL Editor
-- Este script agrega las columnas y tablas faltantes
-- que el código de Prisma espera pero no existen en la DB.
-- ES SEGURO: no borra datos existentes.
-- ============================================================

-- 1. Agregar columnas faltantes a la tabla "User"
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- 2. Agregar columnas faltantes a la tabla "Store"
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "visitCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "hasShipping" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "hasSecurePayment" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "hasReturns" BOOLEAN NOT NULL DEFAULT false;

-- 3. Agregar columna faltante a la tabla "StoreProduct"
ALTER TABLE "StoreProduct" ADD COLUMN IF NOT EXISTS "color" TEXT;

-- 4. Agregar columnas faltantes a la tabla "Subscription"
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "nextBillingDate" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "billingCycle" TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- 5. Crear tabla "AuditLog" si no existe
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
);

-- 6. Crear tabla "PlatformSetting" si no existe
CREATE TABLE IF NOT EXISTS "PlatformSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- 7. Crear índices faltantes
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_resetToken_idx" ON "User"("resetToken");

CREATE INDEX IF NOT EXISTS "Store_ownerId_idx" ON "Store"("ownerId");
CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");
CREATE INDEX IF NOT EXISTS "Store_category_idx" ON "Store"("category");
CREATE INDEX IF NOT EXISTS "Store_visitCount_idx" ON "Store"("visitCount" DESC);
CREATE INDEX IF NOT EXISTS "Store_createdAt_idx" ON "Store"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "StoreProduct_storeId_idx" ON "StoreProduct"("storeId");
CREATE INDEX IF NOT EXISTS "StoreProduct_storeId_isActive_idx" ON "StoreProduct"("storeId", "isActive");
CREATE INDEX IF NOT EXISTS "StoreProduct_storeId_featured_idx" ON "StoreProduct"("storeId", "featured" DESC);
CREATE INDEX IF NOT EXISTS "StoreProduct_createdAt_idx" ON "StoreProduct"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "StoreProduct_category_idx" ON "StoreProduct"("category");

CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_storeId_idx" ON "Subscription"("storeId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX IF NOT EXISTS "Subscription_status_nextBillingDate_idx" ON "Subscription"("status", "nextBillingDate");
CREATE INDEX IF NOT EXISTS "Subscription_userId_storeId_idx" ON "Subscription"("userId", "storeId");
CREATE INDEX IF NOT EXISTS "Subscription_userId_storeId_status_idx" ON "Subscription"("userId", "storeId", "status");

CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_storeId_idx" ON "Payment"("storeId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Payment_externalRef_idx" ON "Payment"("externalRef");

CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSetting_key_key" ON "PlatformSetting"("key");
CREATE INDEX IF NOT EXISTS "PlatformSetting_key_idx" ON "PlatformSetting"("key");

-- 8. Agregar foreign keys si no existen (para AuditLog y PlatformSetting que son nuevas)
-- Estas son seguras porque CREATE TABLE IF NOT EXISTS no falla si ya existen

-- Confirmar: verificar que las columnas existen
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position;
