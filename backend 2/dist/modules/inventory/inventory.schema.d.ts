import { z } from 'zod';
export declare const updateInventorySchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        current_quantity: z.ZodOptional<z.ZodNumber>;
        reorder_threshold: z.ZodOptional<z.ZodNumber>;
        unit: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        unit?: string | undefined;
        current_quantity?: number | undefined;
        reorder_threshold?: number | undefined;
    }, {
        unit?: string | undefined;
        current_quantity?: number | undefined;
        reorder_threshold?: number | undefined;
    }>, {
        unit?: string | undefined;
        current_quantity?: number | undefined;
        reorder_threshold?: number | undefined;
    }, {
        unit?: string | undefined;
        current_quantity?: number | undefined;
        reorder_threshold?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        unit?: string | undefined;
        current_quantity?: number | undefined;
        reorder_threshold?: number | undefined;
    };
}, {
    body: {
        unit?: string | undefined;
        current_quantity?: number | undefined;
        reorder_threshold?: number | undefined;
    };
}>;
export declare const deductInventorySchema: z.ZodObject<{
    body: z.ZodObject<{
        branch_id: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            menu_item_id: z.ZodString;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            quantity: number;
            menu_item_id: string;
        }, {
            quantity: number;
            menu_item_id: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        branch_id: string;
        items: {
            quantity: number;
            menu_item_id: string;
        }[];
    }, {
        branch_id: string;
        items: {
            quantity: number;
            menu_item_id: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        branch_id: string;
        items: {
            quantity: number;
            menu_item_id: string;
        }[];
    };
}, {
    body: {
        branch_id: string;
        items: {
            quantity: number;
            menu_item_id: string;
        }[];
    };
}>;
export declare const wasteLogSchema: z.ZodObject<{
    body: z.ZodObject<{
        ingredient_id: z.ZodString;
        quantity: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        quantity: number;
        ingredient_id: string;
    }, {
        reason: string;
        quantity: number;
        ingredient_id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        reason: string;
        quantity: number;
        ingredient_id: string;
    };
}, {
    body: {
        reason: string;
        quantity: number;
        ingredient_id: string;
    };
}>;
//# sourceMappingURL=inventory.schema.d.ts.map