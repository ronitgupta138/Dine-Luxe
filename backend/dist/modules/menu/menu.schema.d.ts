import { z } from 'zod';
export declare const availabilityWindowSchema: z.ZodObject<{
    days: z.ZodArray<z.ZodEnum<["mon", "tue", "wed", "thu", "fri", "sat", "sun"]>, "many">;
    start_time: z.ZodString;
    end_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
    start_time?: string;
    end_time?: string;
}, {
    days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
    start_time?: string;
    end_time?: string;
}>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    display_order: z.ZodOptional<z.ZodNumber>;
    image_url: z.ZodOptional<z.ZodString>;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    is_active?: boolean;
    description?: string;
    display_order?: number;
    image_url?: string;
}, {
    name?: string;
    is_active?: boolean;
    description?: string;
    display_order?: number;
    image_url?: string;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    display_order: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    image_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    is_active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    is_active?: boolean;
    description?: string;
    display_order?: number;
    image_url?: string;
}, {
    name?: string;
    is_active?: boolean;
    description?: string;
    display_order?: number;
    image_url?: string;
}>;
export declare const reorderCategoriesSchema: z.ZodObject<{
    ordered_ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ordered_ids?: string[];
}, {
    ordered_ids?: string[];
}>;
export declare const createItemSchema: z.ZodObject<{
    category_id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    compare_price: z.ZodOptional<z.ZodNumber>;
    image_url: z.ZodOptional<z.ZodString>;
    is_veg: z.ZodDefault<z.ZodBoolean>;
    is_vegan: z.ZodDefault<z.ZodBoolean>;
    contains_alcohol: z.ZodDefault<z.ZodBoolean>;
    allergens: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    calories: z.ZodOptional<z.ZodNumber>;
    display_order: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["available", "sold_out", "hidden"]>>;
    availability_windows: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        days: z.ZodArray<z.ZodEnum<["mon", "tue", "wed", "thu", "fri", "sat", "sun"]>, "many">;
        start_time: z.ZodString;
        end_time: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }, {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }>, "many">>>;
    addons: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        is_required: z.ZodDefault<z.ZodBoolean>;
        max_quantity: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }, {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    status?: "available" | "sold_out" | "hidden";
    name?: string;
    description?: string;
    price?: number;
    display_order?: number;
    image_url?: string;
    category_id?: string;
    compare_price?: number;
    is_veg?: boolean;
    is_vegan?: boolean;
    contains_alcohol?: boolean;
    allergens?: string[];
    calories?: number;
    availability_windows?: {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }[];
    addons?: {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }[];
}, {
    status?: "available" | "sold_out" | "hidden";
    name?: string;
    description?: string;
    price?: number;
    display_order?: number;
    image_url?: string;
    category_id?: string;
    compare_price?: number;
    is_veg?: boolean;
    is_vegan?: boolean;
    contains_alcohol?: boolean;
    allergens?: string[];
    calories?: number;
    availability_windows?: {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }[];
    addons?: {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }[];
}>;
export declare const updateItemSchema: z.ZodObject<{
    category_id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    compare_price: z.ZodOptional<z.ZodNumber>;
    image_url: z.ZodOptional<z.ZodString>;
    is_veg: z.ZodOptional<z.ZodBoolean>;
    is_vegan: z.ZodOptional<z.ZodBoolean>;
    contains_alcohol: z.ZodOptional<z.ZodBoolean>;
    allergens: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    calories: z.ZodOptional<z.ZodNumber>;
    display_order: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["available", "sold_out", "hidden"]>>;
    availability_windows: z.ZodOptional<z.ZodArray<z.ZodObject<{
        days: z.ZodArray<z.ZodEnum<["mon", "tue", "wed", "thu", "fri", "sat", "sun"]>, "many">;
        start_time: z.ZodString;
        end_time: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }, {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }>, "many">>;
    addons: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        is_required: z.ZodDefault<z.ZodBoolean>;
        max_quantity: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }, {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "available" | "sold_out" | "hidden";
    name?: string;
    description?: string;
    price?: number;
    display_order?: number;
    image_url?: string;
    category_id?: string;
    compare_price?: number;
    is_veg?: boolean;
    is_vegan?: boolean;
    contains_alcohol?: boolean;
    allergens?: string[];
    calories?: number;
    availability_windows?: {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }[];
    addons?: {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }[];
}, {
    status?: "available" | "sold_out" | "hidden";
    name?: string;
    description?: string;
    price?: number;
    display_order?: number;
    image_url?: string;
    category_id?: string;
    compare_price?: number;
    is_veg?: boolean;
    is_vegan?: boolean;
    contains_alcohol?: boolean;
    allergens?: string[];
    calories?: number;
    availability_windows?: {
        days?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
        start_time?: string;
        end_time?: string;
    }[];
    addons?: {
        name?: string;
        price?: number;
        is_required?: boolean;
        max_quantity?: number;
    }[];
}>;
export declare const updateItemStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["available", "sold_out", "hidden"]>;
}, "strip", z.ZodTypeAny, {
    status?: "available" | "sold_out" | "hidden";
}, {
    status?: "available" | "sold_out" | "hidden";
}>;
export declare const bulkUpdateSchema: z.ZodObject<{
    item_ids: z.ZodArray<z.ZodString, "many">;
    adjustment_type: z.ZodEnum<["percent", "fixed"]>;
    value: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value?: number;
    item_ids?: string[];
    adjustment_type?: "fixed" | "percent";
}, {
    value?: number;
    item_ids?: string[];
    adjustment_type?: "fixed" | "percent";
}>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
//# sourceMappingURL=menu.schema.d.ts.map