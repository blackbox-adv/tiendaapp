import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response';
import { getSupabase } from '@/lib/supabase';

// POST /api/setup-storage - Create the product-images bucket if it doesn't exist (auth required)
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.error || !auth.user) {
    return apiError('No autorizado', 401, undefined, request);
  }

  try {
    const supabase = getSupabase();

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('[SETUP-STORAGE] Error listing buckets:', listError);
      return apiError('Error al listar buckets: ' + listError.message, 500, undefined, request);
    }

    const bucketName = 'product-images';
    const bucketExists = buckets?.some((b: { id: string }) => b.id === bucketName);

    if (!bucketExists) {
      // Create the bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });

      if (createError) {
        console.error('[SETUP-STORAGE] Error creating bucket:', createError);
        return apiError('Error al crear bucket: ' + createError.message, 500, undefined, request);
      }

      console.log('[SETUP-STORAGE] Created bucket:', data);
    }

    return apiSuccess({
      message: bucketExists ? 'Bucket already exists' : 'Bucket created successfully',
      bucket: bucketName,
    }, 200, request);
  } catch (error) {
    console.error('[SETUP-STORAGE] Error:', error instanceof Error ? error.message : String(error));
    return apiError('Error al configurar storage', 500, undefined, request);
  }
}

// OPTIONS /api/setup-storage - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}
