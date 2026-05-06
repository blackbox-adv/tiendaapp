import { NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/api-response'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400, headers: corsHeaders(request) })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF.' }, { status: 400, headers: corsHeaders(request) })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'La imagen es muy grande. Máximo 5MB.' }, { status: 400, headers: corsHeaders(request) })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({ url: dataUrl }, { headers: corsHeaders(request) })
  } catch {
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500, headers: corsHeaders(request) })
  }
}
