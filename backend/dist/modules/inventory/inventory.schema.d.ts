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
    branch_id?: string;
    name?: string;
    unit?: string;
    quantity?: number;
    cost_per_unit?: number;
    min_threshold?: number;
    category?: string;
    supplier?: string;
}, {
    branch_id?: string;
    name?: string;
    unit?: string;
    quantity?: number;
    cost_per_unit?: number;
    min_threshold?: number;
    category?: string;
    supplier?: string;
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
    unit?: string;
    quantity?: number;
    current_quantity?: number;
    reorder_threshold?: number;
    cost_per_unit?: number;
    min_threshold?: number;
    notes?: string;
}, {
    unit?: string;
    quantity?: number;
    current_quantity?: number;
    reorder_threshold?: number;
    cost_per_unit?: number;
    min_threshold?: number;
    notes?: string;
}>, {
    unit?: string;
    quantity?: number;
    current_quantity?: number;
    reorder_threshold?: number;
    cost_per_unit?: number;
    min_threshold?: number;
    notes?: string;
}, {
    unit?: string;
    quantity?: number;
    current_quantity?: number;
    reorder_threshold?: number;
    cost_per_unit?: number;
    min_threshold?: number;
    notes?: string;
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
        quantity?: number;
        inventory_item_id?: string;
        menu_item_id?: string;
        inventory_id?: string;
    }, {
        quantity?: number;
        inventory_item_id?: string;
        menu_item_id?: string;
        inventory_id?: string;
    }>, {
        quantity?: number;
        inventory_item_id?: string;
        menu_item_id?: string;
        inventory_id?: string;
    }, {
        quantity?: number;
        inventory_item_id?: string;
        menu_item_id?: string;
        inventory_id?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    branch_id?: string;
    items?: {
        quantity?: number;
        inventory_item_id?: string;
        menu_item_id?: string;
        inventory_id?: string;
    }[];
    reason?: string;
}, {
    branch_id?: string;
    items?: {
        quantity?: number;
        inventory_item_id?: string;
        menu_item_id?: string;
        inventory_id?: string;
    }[];
    reason?: string;
}>;
export declare const wasteLogSchema: z.ZodEffects<z.ZodObject<{
    inventory_id: z.ZodOptional<z.ZodString>;
    inventory_item_id: z.ZodOptional<z.ZodString>;
    ingredient_id: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    reason: z.ZodString;
    logged_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    quantity?: number;
    inventory_item_id?: string;
    logged_by?: string;
    inventory_id?: string;
    ingredient_id?: string;
}, {
    reason?: string;
    quantity?: number;
    inventory_item_id?: string;
    logged_by?: string;
    inventory_id?: string;
    ingredient_id?: string;
}>, {
    reason?: string;
    quantity?: number;
    inventory_item_id?: string;
    logged_by?: string;
    inventory_id?: string;
    ingredient_id?: string;
}, {
    reason?: string;
    quantity?: number;
    inventory_item_id?: string;
    logged_by?: string;
    inventory_id?: string;
    ingredient_id?: string;
}>;
//# sourceMappingURL=inventory.schema.d.ts.map