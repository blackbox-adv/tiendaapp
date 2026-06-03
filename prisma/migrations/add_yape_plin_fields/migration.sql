-- Migration: Add Yape/Plin QR payment fields to Store table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE "Store"
  ADD COLUMN IF NOT EXISTS "yapeQrUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "plinQrUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "yapeNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "plinNumber" TEXT;
