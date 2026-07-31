import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_NAME = 'product-images';

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

// Ensure the Supabase bucket exists (called lazily on first upload)
let bucketInitialized = false;

async function ensureBucketExists(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  if (bucketInitialized) return true;

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('[UPLOAD] Error listing buckets:', listError);
      bucketInitialized = false;
      return false;
    }

    const bucketExists = buckets?.some((b: { id: string }) => b.id === BUCKET_NAME);

    if (!bucketExists) {
      console.log('[UPLOAD] Creating bucket:', BUCKET_NAME);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });

      if (createError) {
        console.error('[UPLOAD] Error creating bucket:', createError);
        bucketInitialized = false;
        return false;
      }
      console.log('[UPLOAD] Bucket created successfully:', BUCKET_NAME);
    }

    bucketInitialized = true;
    return true;
  } catch (err) {
    console.error('[UPLOAD] Error ensuring bucket exists:', err);
    bucketInitialized = false;
    return false;
  }
}

export async function uploadFile(file: File, folder?: string): Promise<{ url: string }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    // Ensure bucket exists before uploading
    const bucketReady = await ensureBucketExists(supabase);

    if (bucketReady) {
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path);

        return { url: urlData.publicUrl };
      }

      console.error('[UPLOAD] Supabase upload error:', error);
      // Fallback to local
    }
  }

  // Fallback: save to local filesystem
  return uploadToLocal(file, folder);
}

async function uploadToLocal(file: File, folder?: string): Promise<{ url: string }> {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const subDir = folder ? folder : '';
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subDir);

  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const filePath = path.join(uploadsDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(filePath, buffer);

  return { url: `/uploads/${subDir ? subDir + '/' : ''}${fileName}` };
}
