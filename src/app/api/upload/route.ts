import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

// POST /api/upload - Upload image to Supabase Storage
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return apiError(auth.error, auth.status, undefined, request)
  }
  if (!auth.user) return apiError('No autenticado', 401, undefined, request)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const subfolder = (formData.get('subfolder') as string) || 'product'

    if (!file) {
      return apiError('No se encontro el archivo', 400, undefined, request)
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return apiError('Tipo de archivo no valido. Solo JPG, PNG, WebP y GIF.', 400, undefined, request)
    }

    if (file.size > 5 * 1024 * 1024) {
      return apiError('El archivo es muy grande. Maximo 5MB.', 400, undefined, request)
    }

    const supabase = getSupabase()
    if (supabase) {
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${subfolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      const { data, error } = await supabase.storage.from('product-images').upload(fileName, buffer, { contentType: file.type, upsert: false })
      if (error) {
        console.error('[UPLOAD] Supabase error:', error.message)
        return apiError('Error al subir imagen: ' + error.message, 500, undefined, request)
      }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path)
      return apiSuccess({ url: urlData.publicUrl }, 200, request)
    }

    // Fallback: save to public/uploads
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const fs = await import('fs/promises')
    const path = await import('path')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadDir, fileName), buffer)
    return apiSuccess({ url: `/uploads/${fileName}` }, 200, request)
  } catch (error: unknown) {
    console.error('[UPLOAD] Error:', error instanceof Error ? error.message : String(error))
    return apiError('Error al subir imagen', 500, undefined, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request)
}
