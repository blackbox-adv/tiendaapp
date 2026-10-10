import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess, handleCorsPreflight } from '@/lib/api-response';
import { uploadFile } from '@/lib/upload';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// POST /api/upload - Upload a file (auth required)
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    // 2. Parse FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return apiError('FormData inválido', 400, undefined, request);
    }

    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return apiError('Archivo requerido', 400, undefined, request);
    }

    // 3. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(
        `Tipo de archivo no permitido. Tipos permitidos: jpeg, png, webp, gif`,
        400,
        undefined,
        request
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `El archivo excede el tamaño máximo de 5MB`,
        400,
        undefined,
        request
      );
    }

    // 5. Upload using existing utility
    const result = await uploadFile(file, folder || undefined);

    return apiSuccess({ url: result.url }, 201, request);
  } catch (error) {
    console.error('[UPLOAD] POST error:', error instanceof Error ? error.message : String(error));
    return apiError('Error al subir archivo', 500, undefined, request);
  }
}

// OPTIONS /api/upload - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}
