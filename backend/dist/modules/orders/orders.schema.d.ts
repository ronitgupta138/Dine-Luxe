import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    table_id: z.ZodString;
    order_type: z.ZodEnum<["dine_in", "takeaway", "delivery"]>;
    items: z.ZodArray<z.ZodObject<{
        menu_item_id: z.ZodString;
        quantity: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        addons: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            addon_id: z.ZodString;
            quantity: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            quantity?: number;
            addon_id?: string;
        }, {
            quantity?: number;
            addon_id?: string;
        }>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        quantity?: number;
        notes?: string;
        menu_item_id?: string;
        addons?: {
            quantity?: number;
            addon_id?: string;
        }[];
    }, {
        quantity?: number;
        notes?: string;
        menu_item_id?: string;
        addons?: {
            quantity?: number;
            addon_id?: string;
        }[];
    }>, "many">;
    special_instructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items?: {
        quantity?: number;
        notes?: string;
        menu_item_id?: string;
        addons?: {
            quantity?: number;
            addon_id?: string;
        }[];
    }[];
    table_id?: string;
    order_type?: "delivery" | "dine_in" | "takeaway";
    special_instructions?: string;
}, {
    items?: {
        quantity?: number;
        notes?: string;
        menu_item_id?: string;
        addons?: {
            quantity?: number;
            addon_id?: string;
        }[];
    }[];
    table_id?: string;
    order_type?: "delivery" | "dine_in" | "takeaway";
    special_instructions?: string;
}>;
export declare const cancelOrderSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string;
}, {
    reason?: string;
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
//# sourceMappingURL=orders.schema.d.ts.map