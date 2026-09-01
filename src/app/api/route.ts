import { NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/api-response'

export async function GET() {
  return NextResponse.json(
    { message: 'TiendApp API v2 - Secure', status: 'healthy' },
    { headers: corsHeaders() }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}
