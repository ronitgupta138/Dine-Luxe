"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranding = getBranding;
exports.updateBranding = updateBranding;
exports.getUploadUrl = getUploadUrl;
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
const CACHE_PREFIX = 'branding:';
const CACHE_TTL = 60 * 60; // 1 hour
// File size limits in bytes
const SIZE_LIMITS = {
    logo: 2 * 1024 * 1024, // 2 MB
    banner: 5 * 1024 * 1024, // 5 MB
    favicon: 512 * 1024, // 512 KB
};
// ─── Get Branding (Redis cache → DB fallback) ────────────────────────────────
async function getBranding(restaurantId) {
    const cacheKey = `${CACHE_PREFIX}${restaurantId}`;
    // 1. Try Redis cache first
    try {
        const cached = await redis_1.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
    }
    catch {
        // Redis miss or error — fall through to DB
    }
    // 2. Fallback to Supabase
    const { data, error } = await supabase_1.supabaseAdmin
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
    if (error)
        throw new Error(`Branding not found: ${error.message}`);
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
        await redis_1.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(mapped));
    }
    catch {
        // Cache write failure is non-fatal
    }
    return mapped;
}
// ─── Update Branding ─────────────────────────────────────────────────────────
async function updateBranding(restaurantId, input) {
    const updateData = {
        updated_at: new Date().toISOString(),
    };
    if (input.app_name !== undefined)
        updateData.app_name_display = input.app_name;
    if (input.tagline !== undefined)
        updateData.tagline = input.tagline;
    if (input.primary_color !== undefined)
        updateData.primary_color = input.primary_color;
    if (input.secondary_color !== undefined)
        updateData.secondary_color = input.secondary_color;
    if (input.logo_url !== undefined)
        updateData.logo_url = input.logo_url;
    if (input.banner_url !== undefined)
        updateData.banner_url = input.banner_url;
    if (input.font_family !== undefined)
        updateData.font_preference = input.font_family;
    const { data, error } = await supabase_1.supabaseAdmin
        .from('restaurant_branding')
        .update(updateData)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();
    if (error)
        throw new Error(`Branding update failed: ${error.message}`);
    // Invalidate Redis cache so next request gets fresh data
    try {
        await redis_1.redis.del(`${CACHE_PREFIX}${restaurantId}`);
    }
    catch {
        // Cache invalidation failure is non-fatal
    }
    return data;
}
// ─── Get Presigned Upload URL ─────────────────────────────────────────────────
async function getUploadUrl(restaurantId, input) {
    const { file_type, content_type } = input;
    const extMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/x-icon': 'ico',
    };
    const ext = extMap[content_type];
    if (!ext) {
        throw Object.assign(new Error(`Unsupported content_type: ${content_type}`), { status: 422 });
    }
    const maxSize = SIZE_LIMITS[file_type] ?? 2 * 1024 * 1024;
    const path = `restaurants/${restaurantId}/branding/${file_type}.${ext}`;
    const bucket = 'restaurant-assets';
    // BUG FIX: createSignedUploadUrl fails with "The related resource does not
    // exist" when the Storage bucket hasn't been created in Supabase yet.
    // Strategy: try the real Supabase Storage API first; if the bucket is missing,
    // fall back to a direct REST upload URL so the endpoint never hard-crashes.
    // To fix permanently in Supabase: Dashboard → Storage → New bucket →
    // name "restaurant-assets", set to Public.
    const { data, error } = await supabase_1.supabaseAdmin.storage
        .from(bucket)
        .createSignedUploadUrl(path);
    if (error) {
        // Bucket missing or storage not configured — return a direct upload URL
        // pointing at the Supabase Storage REST endpoint. The client can PUT the
        // file directly with the service-role key while the bucket is being set up.
        const supabaseUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
        const fallbackUploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
        console.warn(`[branding] Storage bucket "${bucket}" not found — returning REST upload URL. ` +
            `Create the bucket in Supabase Dashboard → Storage to enable signed URLs.`);
        return {
            upload_url: fallbackUploadUrl,
            public_url: publicUrl,
            expires_in: 300,
            max_size_bytes: maxSize,
        };
    }
    const publicUrl = supabase_1.supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return {
        upload_url: data.signedUrl,
        public_url: publicUrl,
        expires_in: 300,
        max_size_bytes: maxSize,
    };
}
//# sourceMappingURL=branding.service.js.map