import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const supabaseStorageUrlRegex = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//;

export const updateBrandingSchema = z.object({
  app_name: z.string().min(1).max(60).optional(),
  tagline: z.string().max(120).optional(),

  primary_color: z
    .string()
    .regex(hexColorRegex, 'primary_color must be a valid hex color e.g. #E85D04')
    .optional(),

  secondary_color: z
    .string()
    .regex(hexColorRegex, 'secondary_color must be a valid hex color')
    .optional(),

  accent_color: z
    .string()
    .regex(hexColorRegex, 'accent_color must be a valid hex color')
    .optional(),

  font_family: z
    .enum(['Inter', 'Poppins', 'Roboto', 'Nunito', 'Lato', 'Playfair Display'])
    .optional(),

  logo_url: z
    .string()
    .regex(supabaseStorageUrlRegex, 'logo_url must be a Supabase Storage URL')
    .optional(),

  banner_url: z
    .string()
    .regex(supabaseStorageUrlRegex, 'banner_url must be a Supabase Storage URL')
    .optional(),

  favicon_url: z
    .string()
    .regex(supabaseStorageUrlRegex, 'favicon_url must be a Supabase Storage URL')
    .optional(),

  theme_mode: z.enum(['light', 'dark', 'system']).optional(),
});

export const uploadUrlSchema = z.object({
  file_type: z.enum(['logo', 'banner', 'favicon'], {
    errorMap: () => ({ message: 'file_type must be logo, banner, or favicon' }),
  }),
  content_type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'], {
    errorMap: () => ({ message: 'Only JPEG, PNG, WebP, SVG images are allowed' }),
  }),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
