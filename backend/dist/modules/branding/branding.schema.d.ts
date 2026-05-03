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
    app_name?: string | undefined;
    tagline?: string | undefined;
    primary_color?: string | undefined;
    secondary_color?: string | undefined;
    accent_color?: string | undefined;
    font_family?: "Inter" | "Poppins" | "Roboto" | "Nunito" | "Lato" | "Playfair Display" | undefined;
    logo_url?: string | undefined;
    banner_url?: string | undefined;
    favicon_url?: string | undefined;
    theme_mode?: "light" | "dark" | "system" | undefined;
}, {
    app_name?: string | undefined;
    tagline?: string | undefined;
    primary_color?: string | undefined;
    secondary_color?: string | undefined;
    accent_color?: string | undefined;
    font_family?: "Inter" | "Poppins" | "Roboto" | "Nunito" | "Lato" | "Playfair Display" | undefined;
    logo_url?: string | undefined;
    banner_url?: string | undefined;
    favicon_url?: string | undefined;
    theme_mode?: "light" | "dark" | "system" | undefined;
}>;
export declare const uploadUrlSchema: z.ZodObject<{
    file_type: z.ZodEnum<["logo", "banner", "favicon"]>;
    content_type: z.ZodEnum<["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/x-icon"]>;
}, "strip", z.ZodTypeAny, {
    file_type: "logo" | "banner" | "favicon";
    content_type: "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml" | "image/x-icon";
}, {
    file_type: "logo" | "banner" | "favicon";
    content_type: "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml" | "image/x-icon";
}>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
//# sourceMappingURL=branding.schema.d.ts.map