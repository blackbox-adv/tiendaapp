import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// One-time migration: add bannerUrl column to Store table
export async function POST() {
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT NOT NULL DEFAULT ''`)
    return NextResponse.json({ success: true, message: 'Columna bannerUrl agregada correctamente' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
