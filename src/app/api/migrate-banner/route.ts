import { NextRequest } from 'next/server'
import { apiError, handleCorsPreflight } from '@/lib/api-response'

// DISABLED: This endpoint has been removed for security.
// Use Prisma migrations instead: npx prisma migrate dev
export async function POST(request: NextRequest) {
  return apiError('Este endpoint ha sido deshabilitado. Usa prisma migrate dev para migraciones.', 410, undefined, request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
