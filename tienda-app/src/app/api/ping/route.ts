import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ ping: 'pong', time: new Date().toISOString(), version: 'v3' })
}
