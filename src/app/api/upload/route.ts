import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, corsHeaders } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── File Upload Configuration ──
const ALLOWED_TYPES: Record<string, string[]> = {
  product: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  logo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  banner: ['image/jpeg', 'image/png', 'image/webp'],
}

const ALL_ALLOWED_TYPES = Object.values(ALLOWED_TYPES).flat()
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET_NAME = 'product-images' // Single bucket for all uploads (matches health check)

// Ensure the upload bucket exists and is public
async function ensureBucket(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      console.error('[UPLOAD] Error listing buckets:', listError)
      // If we can't list buckets, try uploading anyway — the bucket might exist
      return true
    }

    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME)
    if (!bucketExists) {
      console.log('[UPLOAD] Creating bucket:', BUCKET_NAME)
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
      })
      if (createError) {
        console.error('[UPLOAD] Error creating bucket:', createError)
        // Bucket might already exist (race condition), try anyway
        return true
      }
      console.log('[UPLOAD] Bucket created successfully:', BUCKET_NAME)
    }
    return true
  } catch (err) {
    console.error('[UPLOAD] Error ensuring bucket:', err)
    // Don't block uploads — try anyway
    return true
  }
}

export async function POST(request: Request) {
  // Authenticate user
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  const user = auth.user

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'product'

    if (!file) {
      return apiError('No se proporcionó ningún archivo', 400, undefined, request)
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[folder] || ALL_ALLOWED_TYPES
    if (!allowedTypes.includes(file.type)) {
      return apiError(
        `Tipo de archivo no permitido: ${file.type}. Permitidos: JPG, PNG, WebP, GIF`,
        400,
        undefined,
        request
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError('El archivo excede el tamaño máximo de 5MB', 400, undefined, request)
    }

    // Get Supabase client
    let supabase: SupabaseClient
    try {
      const mod = await import('@/lib/supabase')
      supabase = mod.supabase as SupabaseClient
    } catch (err) {
      console.error('[UPLOAD] Supabase client error:', err)
      return apiError('Servicio de almacenamiento no disponible', 503, undefined, request)
    }

    // Ensure bucket exists
    await ensureBucket(supabase)

    // Generate unique file path: {folder}/{userId}/{timestamp}-{random}.{ext}
    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const filePath = `${folder}/${user!.userId}/${timestamp}-${randomStr}.${ext}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[UPLOAD] Supabase upload error:', uploadError)
      return apiError('Error al subir el archivo al almacenamiento', 500, undefined, request)
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl

    if (!publicUrl) {
      return apiError('No se pudo obtener la URL pública del archivo', 500, undefined, request)
    }

    console.log('[UPLOAD] File uploaded successfully:', publicUrl)

    // Audit log
    auditLog({
      action: 'UPLOAD_FILE',
      userId: user!.userId,
      userEmail: user!.email,
      ip: getClientIp(request),
      details: { folder, bucket: BUCKET_NAME, filePath, size: file.size, type: file.type },
      success: true,
      statusCode: 200,
    })

    return apiSuccess({ url: publicUrl, filePath, size: file.size }, 200, request)
  } catch (err) {
    console.error('[UPLOAD] Unexpected error:', err)

    auditLog({
      action: 'UPLOAD_FILE',
      userId: user?.userId,
      userEmail: user?.email,
      ip: getClientIp(request),
      details: { error: err instanceof Error ? err.message : 'Unknown error' },
      success: false,
      statusCode: 500,
    })

    return apiError('Error interno del servidor al subir archivo', 500, undefined, request)
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  })
}
