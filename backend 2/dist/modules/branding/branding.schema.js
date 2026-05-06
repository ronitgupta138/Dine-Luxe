"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUrlSchema = exports.updateBrandingSchema = void 0;
const zod_1 = require("zod");
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const supabaseStorageUrlRegex = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//;
exports.updateBrandingSchema = zod_1.z.object({
    app_name: zod_1.z.string().min(1).max(60).optional(),
    tagline: zod_1.z.string().max(120).optional(),
    primary_color: zod_1.z
        .string()
        .regex(hexColorRegex, 'primary_color must be a valid hex color e.g. #E85D04')
        .optional(),
    secondary_color: zod_1.z
        .string()
        .regex(hexColorRegex, 'secondary_color must be a valid hex color')
        .optional(),
    accent_color: zod_1.z
        .string()
        .regex(hexColorRegex, 'accent_color must be a valid hex color')
        .optional(),
    font_family: zod_1.z
        .enum(['Inter', 'Poppins', 'Roboto', 'Nunito', 'Lato', 'Playfair Display'])
        .optional(),
    logo_url: zod_1.z
        .string()
        .regex(supabaseStorageUrlRegex, 'logo_url must be a Supabase Storage URL')
        .optional(),
    banner_url: zod_1.z
        .string()
        .regex(supabaseStorageUrlRegex, 'banner_url must be a Supabase Storage URL')
        .optional(),
    favicon_url: zod_1.z
        .string()
        .regex(supabaseStorageUrlRegex, 'favicon_url must be a Supabase Storage URL')
        .optional(),
    theme_mode: zod_1.z.enum(['light', 'dark', 'system']).optional(),
});
exports.uploadUrlSchema = zod_1.z.object({
    file_type: zod_1.z.enum(['logo', 'banner', 'favicon'], {
        errorMap: () => ({ message: 'file_type must be logo, banner, or favicon' }),
    }),
    // BUG FIX: Added 'image/x-icon' to match service-side extMap so favicon .ico
    // uploads are fully supported end-to-end (schema → service → storage path).
    content_type: zod_1.z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon'], {
        errorMap: () => ({
            message: 'Only JPEG, PNG, WebP, SVG, or ICO images are allowed',
        }),
    }),
});
//# sourceMappingURL=branding.schema.js.map