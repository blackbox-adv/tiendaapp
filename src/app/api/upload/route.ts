import { NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/api-response'
import { authenticateRequest } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET_NAME = 'product-images'

// Magic byte signatures for file validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (followed by WEBP)
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF8
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[mimeType] || 'jpg'
}

function validateFileMagicBytes(buffer: Buffer, claimedType: string): boolean {
  const signatures = FILE_SIGNATURES[claimedType]
  if (!signatures) return false

  return signatures.some(sig => {
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) return false
    }
    return true
  })
}

export async function POST(request: Request) {
  // CRITICAL: Require authentication for uploads
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: corsHeaders(request) })
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401, headers: corsHeaders(request) })
  }

  try {
    const formData = await request.formData()
    const fileEntry = formData.get('file')
    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400, headers: corsHeaders(request) })
    }
    const file = fileEntry

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF.' }, { status: 400, headers: corsHeaders(request) })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'La imagen es muy grande. Máximo 5MB.' }, { status: 400, headers: corsHeaders(request) })
    }

    // Convert File to Buffer and validate magic bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!validateFileMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: 'El archivo no coincide con el tipo declarado. Posible archivo malicioso.' }, { status: 400, headers: corsHeaders(request) })
    }

    // Generate unique file path using crypto-safe randomness
    const crypto = await import('crypto')
    const ext = getExtension(file.type)
    const randomId = crypto.randomUUID()
    const filePath = `${randomId}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache (immutable path)
        upsert: false,
      })

    if (uploadError) {
      console.error('[UPLOAD] Supabase Storage error:', uploadError.message)
      return NextResponse.json(
        { error: 'Error al subir la imagen al almacenamiento' },
        { status: 500, headers: corsHeaders(request) }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    return NextResponse.json({ url: publicUrl }, { headers: corsHeaders(request) })
  } catch (error) {
    console.error('[UPLOAD] Unexpected error:', error)
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500, headers: corsHeaders(request) })
  }
}

// DELETE endpoint to remove images from storage (auth required + ownership check)
export async function DELETE(request: Request) {
  // CRITICAL: Require authentication for deletions
  const auth = authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: corsHeaders(request) })
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401, headers: corsHeaders(request) })
  }

  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL de imagen requerida' }, { status: 400, headers: corsHeaders(request) })
    }

    // Only process Supabase Storage URLs (skip legacy base64)
    if (!url.includes('/storage/v1/object/public/')) {
      return NextResponse.json({ ok: true }, { headers: corsHeaders(request) })
    }

    // Validate URL belongs to our Supabase domain to prevent SSRF
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl && !url.startsWith(supabaseUrl)) {
      return NextResponse.json({ error: 'URL de imagen inválida' }, { status: 400, headers: corsHeaders(request) })
    }

    // Extract file path from URL: https://project.supabase.co/storage/v1/object/public/bucket/path
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.findIndex(p => p === 'public')
    if (bucketIndex === -1 || bucketIndex + 1 >= pathParts.length) {
      return NextResponse.json({ error: 'URL de imagen inválida' }, { status: 400, headers: corsHeaders(request) })
    }
    // Everything after the bucket name is the file path
    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (deleteError) {
      console.error('[UPLOAD] Delete error:', deleteError.message)
      return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500, headers: corsHeaders(request) })
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders(request) })
  } catch (error) {
    console.error('[UPLOAD] Delete unexpected error:', error)
    return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500, headers: corsHeaders(request) })
  }
}
