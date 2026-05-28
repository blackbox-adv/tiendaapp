import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      // Fallback to local
      return uploadToLocal(file);
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  }

  // Fallback: save to local filesystem
  return uploadToLocal(file);
}

async function uploadToLocal(file: File): Promise<{ url: string }> {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const filePath = path.join(uploadsDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(filePath, buffer);

  return { url: `/uploads/${fileName}` };
}
