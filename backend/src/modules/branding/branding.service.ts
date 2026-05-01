import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { UpdateBrandingInput, UploadUrlInput } from './branding.schema';

const CACHE_PREFIX = 'branding:';
const CACHE_TTL = 60 * 60; // 1 hour

// File size limits in bytes
const SIZE_LIMITS: Record<string, number> = {
  logo: 2 * 1024 * 1024,    // 2 MB
  banner: 5 * 1024 * 1024,  // 5 MB
  favicon: 512 * 1024,       // 512 KB
};

// ─── Get Branding (Redis cache → DB fallback) ────────────────────────────────
export async function getBranding(restaurantId: string) {
  const cacheKey = `${CACHE_PREFIX}${restaurantId}`;

  // 1. Try Redis cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis miss or error — fall through to DB
  }

  // 2. Fallback to Supabase
  const { data, error } = await supabaseAdmin
    .from('restaurant_branding')
    .select(`
      app_name, tagline,
      primary_color, secondary_color, accent_color,
      font_family, theme_mode,
      logo_url, banner_url, favicon_url,
      updated_at
    `)
    .eq('restaurant_id', restaurantId)
    .single();

  if (error) throw new Error(`Branding not found: ${error.message}`);

  // 3. Populate cache
  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
  } catch {
    // Cache write failure is non-fatal
  }

  return data;
}

// ─── Update Branding ─────────────────────────────────────────────────────────
export async function updateBranding(
  restaurantId: string,
  input: UpdateBrandingInput
) {
  const { data, error } = await supabaseAdmin
    .from('restaurant_branding')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('restaurant_id', restaurantId)
    .select()
    .single();

  if (error) throw new Error(`Branding update failed: ${error.message}`);

  // Invalidate Redis cache so next request gets fresh data
  try {
    await redis.del(`${CACHE_PREFIX}${restaurantId}`);
  } catch {
    // Cache invalidation failure is non-fatal
  }

  return data;
}

// ─── Get Presigned Upload URL ─────────────────────────────────────────────────
export async function getUploadUrl(
  restaurantId: string,
  input: UploadUrlInput
): Promise<{ upload_url: string; public_url: string; expires_in: number }> {
  const { file_type, content_type } = input;

  // Determine extension from content type
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  const ext = extMap[content_type];
  const path = `restaurants/${restaurantId}/branding/${file_type}.${ext}`;
  const bucket = 'restaurant-assets';

  // Generate signed upload URL (valid for 5 minutes)
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) throw new Error(`Could not generate upload URL: ${error.message}`);

  const publicUrl = supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  return {
    upload_url: data.signedUrl,
    public_url: publicUrl,
    expires_in: 300, // 5 minutes
  };
}
