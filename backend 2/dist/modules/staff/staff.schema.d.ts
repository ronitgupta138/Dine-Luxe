import { z } from 'zod';
export declare const createStaffSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    dob: z.ZodEffects<z.ZodString, string, string>;
    gender: z.ZodEnum<["male", "female", "other", "prefer_not_to_say"]>;
    role: z.ZodEnum<["manager", "host", "waiter", "chef", "cashier"]>;
    branch_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "host" | "manager" | "waiter" | "chef" | "cashier";
    branch_id: string;
    phone: string;
    first_name: string;
    last_name: string;
    dob: string;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
}, {
    email: string;
    role: "host" | "manager" | "waiter" | "chef" | "cashier";
    branch_id: string;
    phone: string;
    first_name: string;
    last_name: string;
    dob: string;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
}>;
export declare const updateStaffSchema: z.ZodObject<{
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["manager", "host", "waiter", "chef", "cashier"]>>;
    branch_id: z.ZodOptional<z.ZodString>;
    avatar_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role?: "host" | "manager" | "waiter" | "chef" | "cashier" | undefined;
    branch_id?: string | undefined;
    phone?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    avatar_url?: string | undefined;
}, {
    role?: "host" | "manager" | "waiter" | "chef" | "cashier" | undefined;
    branch_id?: string | undefined;
    phone?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    avatar_url?: string | undefined;
}>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
//# sourceMappingURL=staff.schema.d.ts.map