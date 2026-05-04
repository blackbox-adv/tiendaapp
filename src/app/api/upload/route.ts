import { NextResponse } from 'next/server'
import { handleCorsPreflight, corsHeaders } from '@/lib/api-response'

// POST /api/upload — Upload file to Supabase Storage
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'logos'

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400, headers: corsHeaders(request) })
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP, GIF o SVG.' }, { status: 400, headers: corsHeaders(request) })
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no debe superar los 5MB' }, { status: 400, headers: corsHeaders(request) })
    }

    // Lazy import supabase
    const { getSupabase } = await import('@/lib/supabase')
    const supabase = getSupabase()

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png'
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}_${randomStr}.${ext}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tiendaapp-uploads')
      .upload(`${folder}/${fileName}`, file, {
        cacheControl: '31536000', // 1 year
        upsert: false,
      })

    if (error) {
      console.error('[UPLOAD] Storage error:', error.message)

      // If bucket doesn't exist, try to create it
      if (error.message.includes('does not exist') || error.message.includes('Bucket not found')) {
        const { error: bucketError } = await supabase.storage.createBucket('tiendaapp-uploads', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: allowedTypes,
        })

        if (bucketError) {
          console.error('[UPLOAD] Failed to create bucket:', bucketError.message)
          return NextResponse.json({ error: 'Error al crear bucket de almacenamiento' }, { status: 500, headers: corsHeaders(request) })
        }

        // Retry upload after bucket creation
        const retry = await supabase.storage
          .from('tiendaapp-uploads')
          .upload(`${folder}/${fileName}`, file, {
            cacheControl: '31536000',
            upsert: false,
          })

        if (retry.error) {
          return NextResponse.json({ error: retry.error.message }, { status: 500, headers: corsHeaders(request) })
        }

        const publicUrl = supabase.storage.from('tiendaapp-uploads').getPublicUrl(`${folder}/${retry.data.path}`).data.publicUrl
        return NextResponse.json({ url: publicUrl }, { status: 200, headers: corsHeaders(request) })
      }

      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(request) })
    }

    // Get public URL
    const publicUrl = supabase.storage.from('tiendaapp-uploads').getPublicUrl(`${folder}/${data.path}`).data.publicUrl

    console.log(`[UPLOAD] File uploaded: ${folder}/${fileName} (${(file.size / 1024).toFixed(1)}KB)`)

    return NextResponse.json({ url: publicUrl }, { status: 200, headers: corsHeaders(request) })
  } catch (err) {
    console.error('[UPLOAD] Error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500, headers: corsHeaders(request) })
  }
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}
