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
        city?: string;
        state?: string;
        pincode?: string;
        line1?: string;
        line2?: string;
    }, {
        city?: string;
        state?: string;
        pincode?: string;
        line1?: string;
        line2?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    phone?: string;
    first_name?: string;
    last_name?: string;
    address?: {
        city?: string;
        state?: string;
        pincode?: string;
        line1?: string;
        line2?: string;
    };
    dob?: string;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    avatar_url?: string;
}, {
    phone?: string;
    first_name?: string;
    last_name?: string;
    address?: {
        city?: string;
        state?: string;
        pincode?: string;
        line1?: string;
        line2?: string;
    };
    dob?: string;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    avatar_url?: string;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
//# sourceMappingURL=users.schema.d.ts.map