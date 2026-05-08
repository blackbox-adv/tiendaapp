import { NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/api-response'
import { supabase } from '@/lib/supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET_NAME = 'product-images'

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[mimeType] || 'jpg'
}

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

    // Generate unique file path: {timestamp}-{random}.{ext}
    const ext = getExtension(file.type)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filePath = `${timestamp}-${random}.${ext}`

    // Convert File to Buffer for Supabase upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

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

// DELETE endpoint to remove images from storage
export async function DELETE(request: Request) {
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
