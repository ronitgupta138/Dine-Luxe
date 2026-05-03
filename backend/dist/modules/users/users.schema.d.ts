import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dob: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other", "prefer_not_to_say"]>>;
    avatar_url: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        line1: z.ZodOptional<z.ZodString>;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        pincode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        city?: string | undefined;
        state?: string | undefined;
        pincode?: string | undefined;
        line1?: string | undefined;
        line2?: string | undefined;
    }, {
        city?: string | undefined;
        state?: string | undefined;
        pincode?: string | undefined;
        line1?: string | undefined;
        line2?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    address?: {
        city?: string | undefined;
        state?: string | undefined;
        pincode?: string | undefined;
        line1?: string | undefined;
        line2?: string | undefined;
    } | undefined;
    dob?: string | undefined;
    gender?: "male" | "female" | "other" | "prefer_not_to_say" | undefined;
    avatar_url?: string | undefined;
}, {
    phone?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    address?: {
        city?: string | undefined;
        state?: string | undefined;
        pincode?: string | undefined;
        line1?: string | undefined;
        line2?: string | undefined;
    } | undefined;
    dob?: string | undefined;
    gender?: "male" | "female" | "other" | "prefer_not_to_say" | undefined;
    avatar_url?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
//# sourceMappingURL=users.schema.d.ts.map