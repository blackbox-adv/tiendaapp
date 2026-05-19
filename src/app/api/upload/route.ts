import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { auditLog, getClientIp } from '@/lib/env'
import { supabase } from '@/lib/supabase'

// Allowed MIME types for upload
const ALLOWED_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET_NAME = 'product-images'

// Ensure bucket exists and is public (called once, cached)
let bucketInitialized = false

async function ensureBucketExists(): Promise<void> {
  if (bucketInitialized) return

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      console.error('[UPLOAD] Error listing buckets:', listError.message)
      return
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)
    if (!bucketExists) {
      console.log('[UPLOAD] Creating bucket:', BUCKET_NAME)
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: Object.keys(ALLOWED_TYPES),
      })
      if (createError) {
        console.error('[UPLOAD] Error creating bucket:', createError.message)
      } else {
        console.log('[UPLOAD] Bucket created successfully:', BUCKET_NAME)
      }
    } else {
      // Make sure bucket is public
      const bucket = buckets?.find(b => b.name === BUCKET_NAME)
      if (bucket && !bucket.public) {
        console.log('[UPLOAD] Making bucket public:', BUCKET_NAME)
        await supabase.storage.updateBucket(BUCKET_NAME, { public: true })
      }
    }

    bucketInitialized = true
  } catch (err) {
    console.error('[UPLOAD] Bucket init error:', err)
  }
}

// Generate a unique file path to avoid collisions
function generateFilePath(userId: string, fileName: string, prefix: string = 'uploads'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 30)
  return `${prefix}/${userId}/${timestamp}-${random}-${sanitizedName}`
}

// POST /api/upload - Upload a file to Supabase Storage
export async function POST(request: NextRequest) {
  // Auth is required for uploads
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) {
    return apiError('No autenticado', 401, undefined, request)
  }

  try {
    // Ensure bucket exists
    await ensureBucketExists()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null
    const prefix = formData.get('prefix') as string | null

    if (!file) {
      return apiError('No se proporciono ningun archivo', 400, undefined, request)
    }

    // Validate file type
    if (!ALLOWED_TYPES[file.type]) {
      return apiError(
        `Tipo de archivo no permitido: ${file.type}. Solo se permiten JPG, PNG, WebP y GIF.`,
        400,
        undefined,
        request
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximo 5MB.`,
        400,
        undefined,
        request
      )
    }

    // Determine bucket and path
    const bucketName = bucket && typeof bucket === 'string' ? bucket : BUCKET_NAME
    const pathPrefix = prefix && typeof prefix === 'string' ? prefix : 'uploads'
    const filePath = generateFilePath(auth.user.userId, file.name, pathPrefix)

    // Convert File to ArrayBuffer then to Buffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('[UPLOAD] Supabase upload error:', error.message, error)

      // If the bucket doesn't exist or has RLS issues, try with service role
      if (error.message.includes('not found') || error.message.includes('does not exist') ||
          error.message.includes('row-level') || error.message.includes('policy')) {
        // Try simpler path in root of bucket
        const simplePath = `${auth.user.userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucketName)
          .upload(simplePath, buffer, {
            contentType: file.type,
            upsert: false,
          })

        if (retryError) {
          console.error('[UPLOAD] Retry upload error:', retryError.message)
          return apiError('Error al subir el archivo. Intenta de nuevo.', 500, undefined, request)
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(simplePath)
        const publicUrl = urlData?.publicUrl

        if (!publicUrl) {
          return apiError('Error al obtener la URL del archivo', 500, undefined, request)
        }

        auditLog({
          action: 'UPLOAD_FILE',
          userId: auth.user.userId,
          userEmail: auth.user.email,
          ip: getClientIp(request),
          details: { fileName: file.name, size: file.size, bucket: bucketName, path: simplePath },
          success: true,
          statusCode: 200,
        })

        return apiSuccess({ url: publicUrl, path: simplePath }, 200, request)
      }

      return apiError('Error al subir el archivo: ' + error.message, 500, undefined, request)
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path)
    const publicUrl = urlData?.publicUrl

    if (!publicUrl) {
      return apiError('Error al obtener la URL del archivo', 500, undefined, request)
    }

    auditLog({
      action: 'UPLOAD_FILE',
      userId: auth.user.userId,
      userEmail: auth.user.email,
      ip: getClientIp(request),
      details: { fileName: file.name, size: file.size, bucket: bucketName, path: data.path },
      success: true,
      statusCode: 200,
    })

    return apiSuccess({ url: publicUrl, path: data.path }, 200, request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[UPLOAD] Error:', message)
    return apiError('Error al subir el archivo', 500, undefined, request)
  }
}

// DELETE /api/upload?path=xxx - Delete a file from Supabase Storage
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) {
    return apiError('No autenticado', 401, undefined, request)
  }

  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket') || BUCKET_NAME

    if (!path) {
      return apiError('Path del archivo requerido', 400, undefined, request)
    }

    // Security: Only allow deleting files from your own user folder
    if (!path.startsWith(auth.user.userId + '/') && !path.startsWith('uploads/' + auth.user.userId + '/')) {
      return apiError('Solo puedes eliminar tus propios archivos', 403, undefined, request)
    }

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error('[UPLOAD] Delete error:', error.message)
      return apiError('Error al eliminar el archivo', 500, undefined, request)
    }

    return apiSuccess({ message: 'Archivo eliminado correctamente' }, 200, request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[UPLOAD] Delete error:', message)
    return apiError('Error al eliminar el archivo', 500, undefined, request)
  }
}

// OPTIONS /api/upload - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
