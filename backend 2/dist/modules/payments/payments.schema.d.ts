import { z } from 'zod';
export declare const initiateSchema: z.ZodObject<{
    order_id: z.ZodString;
    payment_method: z.ZodEnum<["upi", "card", "cash", "wallet"]>;
    split_with: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    order_id: string;
    payment_method: "upi" | "card" | "cash" | "wallet";
    split_with?: string[] | undefined;
}, {
    order_id: string;
    payment_method: "upi" | "card" | "cash" | "wallet";
    split_with?: string[] | undefined;
}>;
export declare const verifySchema: z.ZodObject<{
    payment_id: z.ZodString;
    gateway_payment_id: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["success", "failed", "pending"]>;
    gateway_signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "pending" | "success";
    payment_id: string;
    gateway_payment_id?: string | undefined;
    gateway_signature?: string | undefined;
}, {
    status: "failed" | "pending" | "success";
    payment_id: string;
    gateway_payment_id?: string | undefined;
    gateway_signature?: string | undefined;
}>;
export declare const splitSchema: z.ZodObject<{
    order_id: z.ZodString;
    splits: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        amount: z.ZodNumber;
        payment_method: z.ZodEnum<["upi", "card", "cash", "wallet"]>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        label: string;
        payment_method: "upi" | "card" | "cash" | "wallet";
    }, {
        amount: number;
        label: string;
        payment_method: "upi" | "card" | "cash" | "wallet";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    order_id: string;
    splits: {
        amount: number;
        label: string;
        payment_method: "upi" | "card" | "cash" | "wallet";
    }[];
}, {
    order_id: string;
    splits: {
        amount: number;
        label: string;
        payment_method: "upi" | "card" | "cash" | "wallet";
    }[];
}>;
export declare const upiQRSchema: z.ZodObject<{
    order_id: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    order_id: string;
    amount?: number | undefined;
}, {
    order_id: string;
    amount?: number | undefined;
}>;
export declare const webhookSchema: z.ZodObject<{
    event: z.ZodString;
    payment_id: z.ZodString;
    order_id: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
    gateway_signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    payment_id: string;
    event: string;
    amount?: number | undefined;
    order_id?: string | undefined;
    gateway_signature?: string | undefined;
}, {
    status: string;
    payment_id: string;
    event: string;
    amount?: number | undefined;
    order_id?: string | undefined;
    gateway_signature?: string | undefined;
}>;
export type InitiateInput = z.infer<typeof initiateSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type SplitInput = z.infer<typeof splitSchema>;
export type UPIQRInput = z.infer<typeof upiQRSchema>;
//# sourceMappingURL=payments.schema.d.ts.map