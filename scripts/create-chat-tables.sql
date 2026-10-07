-- Tablas chat interno + empleados (Kyllari) — idempotente
CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "sender" TEXT NOT NULL DEFAULT 'customer',
  "authorName" TEXT NOT NULL DEFAULT '',
  "authorWhatsapp" TEXT,
  "body" TEXT NOT NULL,
  "readByStore" BOOLEAN NOT NULL DEFAULT false,
  "readByCustomer" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ChatMessage_storeId_threadId_createdAt_idx" ON "ChatMessage"("storeId", "threadId", "createdAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_storeId_readByStore_createdAt_idx" ON "ChatMessage"("storeId", "readByStore", "createdAt");

CREATE TABLE IF NOT EXISTS "StoreMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "whatsappNumber" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "StoreMember_userId_key" ON "StoreMember"("userId");
CREATE INDEX IF NOT EXISTS "StoreMember_storeId_idx" ON "StoreMember"("storeId");
