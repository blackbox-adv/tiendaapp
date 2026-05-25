import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'product'

    if (!file) {
      return apiError('No se encontro archivo', 400, undefined, request)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return apiError('Tipo de archivo no permitido. Solo JPG, PNG, WebP y GIF', 400, undefined, request)
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return apiError('El archivo no debe superar los 5MB', 400, undefined, request)
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${auth.user.userId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    // Upload to Supabase Storage
    const supabase = getSupabase()
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('[Upload] Supabase upload error:', error.message)
      return apiError('Error al subir imagen: ' + error.message, 500, undefined, request)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)

    const publicUrl = urlData.publicUrl

    return apiSuccess({ url: publicUrl, path: data.path }, 201, request)
  } catch (error: unknown) {
    console.error('[Upload] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error al subir imagen', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
