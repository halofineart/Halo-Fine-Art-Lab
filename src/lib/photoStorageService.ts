import { supabase } from './supabase';

const PHOTOS_BUCKET = 'customer-photos';

export interface PhotoUploadResult {
  storagePath: string | null;
  error: string | null;
}

/**
 * Uploads an original photo file to Supabase Storage in the background.
 * Path format: {userId}/{projectId}/{photoId}_{filename}
 */
export async function uploadOriginalPhoto(
  userId: string,
  projectId: string,
  photoId: string,
  file: File
): Promise<PhotoUploadResult> {
  if (!supabase) {
    return { storagePath: null, error: null };
  }

  try {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${projectId}/${photoId}_${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return { storagePath: null, error: error.message };
    }

    return { storagePath: data?.path || path, error: null };
  } catch (err: any) {
    return { storagePath: null, error: err?.message || 'Error uploading photo' };
  }
}

/**
 * Gets a signed download URL for a private storage path.
 */
export async function getPhotoDownloadUrl(storagePath: string): Promise<string | null> {
  if (!supabase || !storagePath) return null;
  try {
    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUrl(storagePath, 3600);
    if (error) return null;
    return data?.signedUrl || null;
  } catch {
    return null;
  }
}

/**
 * Deletes an original photo from Supabase Storage.
 */
export async function deleteOriginalPhoto(storagePath: string): Promise<{ error: string | null }> {
  if (!supabase || !storagePath) return { error: null };

  try {
    const { error } = await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err?.message || 'Error deleting photo' };
  }
}
