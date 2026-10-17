import { z } from 'zod';
export declare const updateBrandingSchema: z.ZodObject<{
    app_name: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    primary_color: z.ZodOptional<z.ZodString>;
    secondary_color: z.ZodOptional<z.ZodString>;
    accent_color: z.ZodOptional<z.ZodString>;
    font_family: z.ZodOptional<z.ZodEnum<["Inter", "Poppins", "Roboto", "Nunito", "Lato", "Playfair Display"]>>;
    logo_url: z.ZodOptional<z.ZodString>;
    banner_url: z.ZodOptional<z.ZodString>;
    favicon_url: z.ZodOptional<z.ZodString>;
    theme_mode: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
}, "strip", z.ZodTypeAny, {
    app_name?: string;
    tagline?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_family?: "Inter" | "Poppins" | "Roboto" | "Nunito" | "Lato" | "Playfair Display";
    logo_url?: string;
    banner_url?: string;
    favicon_url?: string;
    theme_mode?: "light" | "dark" | "system";
}, {
    app_name?: string;
    tagline?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_family?: "Inter" | "Poppins" | "Roboto" | "Nunito" | "Lato" | "Playfair Display";
    logo_url?: string;
    banner_url?: string;
    favicon_url?: string;
    theme_mode?: "light" | "dark" | "system";
}>;
export declare const uploadUrlSchema: z.ZodObject<{
    file_type: z.ZodEnum<["logo", "banner", "favicon"]>;
    content_type: z.ZodEnum<["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/x-icon"]>;
}, "strip", z.ZodTypeAny, {
    file_type?: "logo" | "banner" | "favicon";
    content_type?: "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml" | "image/x-icon";
}, {
    file_type?: "logo" | "banner" | "favicon";
    content_type?: "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml" | "image/x-icon";
}>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
//# sourceMappingURL=branding.schema.d.ts.map