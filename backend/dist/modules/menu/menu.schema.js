"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateSchema = exports.updateItemStatusSchema = exports.updateItemSchema = exports.createItemSchema = exports.reorderCategoriesSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.availabilityWindowSchema = void 0;
const zod_1 = require("zod");
// ─── Availability Window ──────────────────────────────────────────────────────
exports.availabilityWindowSchema = zod_1.z.object({
    days: zod_1.z.array(zod_1.z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).min(1),
    start_time: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
    end_time: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
});
// ─── Addon schema (shared) ────────────────────────────────────────────────────
const addonSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    price: zod_1.z.number().nonnegative(),
    is_required: zod_1.z.boolean().default(false),
    max_quantity: zod_1.z.number().int().positive().default(1),
});
// ─── Categories ───────────────────────────────────────────────────────────────
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    display_order: zod_1.z.number().int().nonnegative().optional(),
    image_url: zod_1.z.string().url().optional(),
    is_active: zod_1.z.boolean().default(true),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
exports.reorderCategoriesSchema = zod_1.z.object({
    ordered_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
});
// ─── Items ────────────────────────────────────────────────────────────────────
exports.createItemSchema = zod_1.z.object({
    category_id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.number().positive(),
    compare_price: zod_1.z.number().positive().optional(),
    image_url: zod_1.z.string().url().optional(),
    is_veg: zod_1.z.boolean().default(true),
    is_vegan: zod_1.z.boolean().default(false),
    contains_alcohol: zod_1.z.boolean().default(false),
    allergens: zod_1.z.array(zod_1.z.string()).optional().default([]),
    calories: zod_1.z.number().int().nonnegative().optional(),
    display_order: zod_1.z.number().int().nonnegative().optional(),
    status: zod_1.z.enum(['available', 'sold_out', 'hidden']).default('available'),
    availability_windows: zod_1.z.array(exports.availabilityWindowSchema).optional().default([]),
    addons: zod_1.z.array(addonSchema).optional().default([]),
});
// FIX: the original used .partial().omit({ category_id: true }).extend({ category_id: ... })
// which is redundant — omit removes the field then extend adds it back as required (non-optional).
// The correct approach is a full .partial() so ALL fields including category_id are optional on update.
// Defaults (.default(...)) are removed on partial fields so they don't overwrite intentional omissions.
exports.updateItemSchema = zod_1.z.object({
    category_id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.number().positive().optional(),
    compare_price: zod_1.z.number().positive().optional(),
    image_url: zod_1.z.string().url().optional(),
    is_veg: zod_1.z.boolean().optional(),
    is_vegan: zod_1.z.boolean().optional(),
    contains_alcohol: zod_1.z.boolean().optional(),
    allergens: zod_1.z.array(zod_1.z.string()).optional(),
    calories: zod_1.z.number().int().nonnegative().optional(),
    display_order: zod_1.z.number().int().nonnegative().optional(),
    status: zod_1.z.enum(['available', 'sold_out', 'hidden']).optional(),
    availability_windows: zod_1.z.array(exports.availabilityWindowSchema).optional(),
    addons: zod_1.z.array(addonSchema).optional(),
});
exports.updateItemStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['available', 'sold_out', 'hidden']),
});
// ─── Bulk Price Update ────────────────────────────────────────────────────────
exports.bulkUpdateSchema = zod_1.z.object({
    item_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    adjustment_type: zod_1.z.enum(['percent', 'fixed']),
    value: zod_1.z.number(), // positive = increase, negative = decrease
});
//# sourceMappingURL=menu.schema.js.map