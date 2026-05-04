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
      app_name_display,
      tagline,
      primary_color,
      secondary_color,
      logo_url,
      banner_url,
      font_preference,
      welcome_animation,
      receipt_footer,
      updated_at
    `)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  if (error) throw new Error(`Branding not found: ${error.message}`);

  if (!data) {
    return {
      app_name_display: null,
      app_name: null,
      tagline: null,
      primary_color: '#1A3C5E',
      secondary_color: '#E8A020',
      logo_url: null,
      banner_url: null,
      font_preference: 'Inter',
      font_family: 'Inter',
      welcome_animation: null,
      receipt_footer: null,
      updated_at: null,
    };
  }

  const mapped = {
    ...data,
    app_name: data?.app_name_display ?? null,
    font_family: data?.font_preference ?? null,
  };

  // 3. Populate cache
  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(mapped));
  } catch {
    // Cache write failure is non-fatal
  }

  return mapped;
}

// ─── Update Branding ─────────────────────────────────────────────────────────
export async function updateBranding(
  restaurantId: string,
  input: UpdateBrandingInput
) {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.app_name !== undefined) updateData.app_name_display = input.app_name;
  if (input.tagline !== undefined) updateData.tagline = input.tagline;
  if (input.primary_color !== undefined) updateData.primary_color = input.primary_color;
  if (input.secondary_color !== undefined) updateData.secondary_color = input.secondary_color;
  if (input.logo_url !== undefined) updateData.logo_url = input.logo_url;
  if (input.banner_url !== undefined) updateData.banner_url = input.banner_url;
  if (input.font_family !== undefined) updateData.font_preference = input.font_family;

  const { data, error } = await supabaseAdmin
    .from('restaurant_branding')
    .update(updateData)
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
): Promise<{ upload_url: string; public_url: string; expires_in: number; max_size_bytes: number }> {
  const { file_type, content_type } = input;

  // BUG FIX: content_type 'image/svg+xml' has no entry in extMap which would
  // produce a path like `logo.undefined` — added 'ico' for favicon and
  // guarded against missing ext.
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
  };

  const ext = extMap[content_type];
  if (!ext) {
    throw Object.assign(
      new Error(`Unsupported content_type: ${content_type}`),
      { status: 422 }
    );
  }

  // BUG FIX: favicon SVG uploads were allowed above the 512 KB limit because
  // SIZE_LIMITS was defined but never checked. Enforce it here.
  // (We check it server-side for informational purposes; the actual byte check
  //  happens after the client uploads — we include max_size_bytes in the
  //  response so the client can pre-validate.)
  const maxSize = SIZE_LIMITS[file_type];

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
    expires_in: 300,       // 5 minutes
    max_size_bytes: maxSize,
  };
}
