import { z } from 'zod';
export declare const createInventorySchema: z.ZodObject<{
    branch_id: z.ZodString;
    name: z.ZodString;
    unit: z.ZodString;
    quantity: z.ZodNumber;
    min_threshold: z.ZodNumber;
    cost_per_unit: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
    supplier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    branch_id: string;
    name: string;
    unit: string;
    quantity: number;
    min_threshold: number;
    cost_per_unit?: number | undefined;
    category?: string | undefined;
    supplier?: string | undefined;
}, {
    branch_id: string;
    name: string;
    unit: string;
    quantity: number;
    min_threshold: number;
    cost_per_unit?: number | undefined;
    category?: string | undefined;
    supplier?: string | undefined;
}>;
export declare const updateInventorySchema: z.ZodEffects<z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    min_threshold: z.ZodOptional<z.ZodNumber>;
    cost_per_unit: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    current_quantity: z.ZodOptional<z.ZodNumber>;
    reorder_threshold: z.ZodOptional<z.ZodNumber>;
    unit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    unit?: string | undefined;
    quantity?: number | undefined;
    current_quantity?: number | undefined;
    reorder_threshold?: number | undefined;
    cost_per_unit?: number | undefined;
    min_threshold?: number | undefined;
    notes?: string | undefined;
}, {
    unit?: string | undefined;
    quantity?: number | undefined;
    current_quantity?: number | undefined;
    reorder_threshold?: number | undefined;
    cost_per_unit?: number | undefined;
    min_threshold?: number | undefined;
    notes?: string | undefined;
}>, {
    unit?: string | undefined;
    quantity?: number | undefined;
    current_quantity?: number | undefined;
    reorder_threshold?: number | undefined;
    cost_per_unit?: number | undefined;
    min_threshold?: number | undefined;
    notes?: string | undefined;
}, {
    unit?: string | undefined;
    quantity?: number | undefined;
    current_quantity?: number | undefined;
    reorder_threshold?: number | undefined;
    cost_per_unit?: number | undefined;
    min_threshold?: number | undefined;
    notes?: string | undefined;
}>;
export declare const deductInventorySchema: z.ZodObject<{
    branch_id: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodEffects<z.ZodObject<{
        inventory_id: z.ZodOptional<z.ZodString>;
        inventory_item_id: z.ZodOptional<z.ZodString>;
        menu_item_id: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        inventory_item_id?: string | undefined;
        menu_item_id?: string | undefined;
        inventory_id?: string | undefined;
    }, {
        quantity: number;
        inventory_item_id?: string | undefined;
        menu_item_id?: string | undefined;
        inventory_id?: string | undefined;
    }>, {
        quantity: number;
        inventory_item_id?: string | undefined;
        menu_item_id?: string | undefined;
        inventory_id?: string | undefined;
    }, {
        quantity: number;
        inventory_item_id?: string | undefined;
        menu_item_id?: string | undefined;
        inventory_id?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        inventory_item_id?: string | undefined;
        menu_item_id?: string | undefined;
        inventory_id?: string | undefined;
    }[];
    branch_id?: string | undefined;
    reason?: string | undefined;
}, {
    items: {
        quantity: number;
        inventory_item_id?: string | undefined;
        menu_item_id?: string | undefined;
        inventory_id?: string | undefined;
    }[];
    branch_id?: string | undefined;
    reason?: string | undefined;
}>;
export declare const wasteLogSchema: z.ZodEffects<z.ZodObject<{
    inventory_id: z.ZodOptional<z.ZodString>;
    inventory_item_id: z.ZodOptional<z.ZodString>;
    ingredient_id: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    reason: z.ZodString;
    logged_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    quantity: number;
    inventory_item_id?: string | undefined;
    logged_by?: string | undefined;
    inventory_id?: string | undefined;
    ingredient_id?: string | undefined;
}, {
    reason: string;
    quantity: number;
    inventory_item_id?: string | undefined;
    logged_by?: string | undefined;
    inventory_id?: string | undefined;
    ingredient_id?: string | undefined;
}>, {
    reason: string;
    quantity: number;
    inventory_item_id?: string | undefined;
    logged_by?: string | undefined;
    inventory_id?: string | undefined;
    ingredient_id?: string | undefined;
}, {
    reason: string;
    quantity: number;
    inventory_item_id?: string | undefined;
    logged_by?: string | undefined;
    inventory_id?: string | undefined;
    ingredient_id?: string | undefined;
}>;
//# sourceMappingURL=inventory.schema.d.ts.map