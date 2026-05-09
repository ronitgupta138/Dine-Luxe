import { z } from 'zod';
export declare const createAdminSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string | undefined;
}, {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string | undefined;
}>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
//# sourceMappingURL=admin.schema.d.ts.map