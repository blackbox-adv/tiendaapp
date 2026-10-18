-- Migration: Importador de Excel (Fase 1)
-- 1) externalCode en StoreProduct: llave del producto en el Excel del dueño
--    (SKU, o nombre normalizado si su Excel no trae código) para los re-imports.
-- 2) Tabla StoreImportMapping: recuerda el mapeo de columnas por tienda
--    para que las siguientes importaciones sean de UN click.
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE "StoreProduct"
  ADD COLUMN IF NOT EXISTS "externalCode" TEXT;

CREATE INDEX IF NOT EXISTS "StoreProduct_storeId_externalCode_idx"
  ON "StoreProduct"("storeId", "externalCode");

CREATE TABLE IF NOT EXISTS "StoreImportMapping" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "mapping" JSONB NOT NULL,
    "missingAction" TEXT NOT NULL DEFAULT 'keep',
    "lastFileName" TEXT,
    "lastImportAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreImportMapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StoreImportMapping_storeId_key"
  ON "StoreImportMapping"("storeId");

CREATE INDEX IF NOT EXISTS "StoreImportMapping_storeId_idx"
  ON "StoreImportMapping"("storeId");

ALTER TABLE "StoreImportMapping"
  ADD CONSTRAINT "StoreImportMapping_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
