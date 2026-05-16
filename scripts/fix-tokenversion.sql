-- Fix NULL tokenVersion values for existing users
-- This column was added via migration but existing rows have NULL instead of 0
-- This caused ALL authenticated API calls to fail with 401

UPDATE "User" SET "tokenVersion" = 0 WHERE "tokenVersion" IS NULL;

-- Also fix any other columns that might have NULL defaults
UPDATE "Store" SET "hasShipping" = false WHERE "hasShipping" IS NULL;
UPDATE "Store" SET "hasSecurePayment" = false WHERE "hasSecurePayment" IS NULL;
UPDATE "Store" SET "hasReturns" = false WHERE "hasReturns" IS NULL;
UPDATE "Store" SET "bannerUrl" = '' WHERE "bannerUrl" IS NULL;
UPDATE "Store" SET "template" = 'moderna' WHERE "template" IS NULL;
UPDATE "Store" SET "category" = 'otros' WHERE "category" IS NULL;
UPDATE "Store" SET "logo" = '' WHERE "logo" IS NULL;

-- Verify the fix
SELECT id, email, "tokenVersion" FROM "User" LIMIT 10;
