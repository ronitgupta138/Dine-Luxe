import { z } from 'zod';

// ─── Availability Window ──────────────────────────────────────────────────────

export const availabilityWindowSchema = z.object({
  days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).min(1),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
});

// ─── Addon schema (shared) ────────────────────────────────────────────────────

const addonSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().nonnegative(),
  is_required: z.boolean().default(false),
  max_quantity: z.number().int().positive().default(1),
});

// ─── Categories ───────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  display_order: z.number().int().nonnegative().optional(),
  image_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const reorderCategoriesSchema = z.object({
  ordered_ids: z.array(z.string().uuid()).min(1),
});

// ─── Items ────────────────────────────────────────────────────────────────────

export const createItemSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  compare_price: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  is_veg: z.boolean().default(true),
  is_vegan: z.boolean().default(false),
  contains_alcohol: z.boolean().default(false),
  allergens: z.array(z.string()).optional().default([]),
  calories: z.number().int().nonnegative().optional(),
  display_order: z.number().int().nonnegative().optional(),
  status: z.enum(['available', 'sold_out', 'hidden']).default('available'),
  availability_windows: z.array(availabilityWindowSchema).optional().default([]),
  addons: z.array(addonSchema).optional().default([]),
});

// FIX: the original used .partial().omit({ category_id: true }).extend({ category_id: ... })
// which is redundant — omit removes the field then extend adds it back as required (non-optional).
// The correct approach is a full .partial() so ALL fields including category_id are optional on update.
// Defaults (.default(...)) are removed on partial fields so they don't overwrite intentional omissions.
export const updateItemSchema = z.object({
  category_id: z.string().uuid().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  compare_price: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  is_veg: z.boolean().optional(),
  is_vegan: z.boolean().optional(),
  contains_alcohol: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.number().int().nonnegative().optional(),
  display_order: z.number().int().nonnegative().optional(),
  status: z.enum(['available', 'sold_out', 'hidden']).optional(),
  availability_windows: z.array(availabilityWindowSchema).optional(),
  addons: z.array(addonSchema).optional(),
});

export const updateItemStatusSchema = z.object({
  status: z.enum(['available', 'sold_out', 'hidden']),
});

// ─── Bulk Price Update ────────────────────────────────────────────────────────

export const bulkUpdateSchema = z.object({
  item_ids: z.array(z.string().uuid()).min(1),
  adjustment_type: z.enum(['percent', 'fixed']),
  value: z.number(), // positive = increase, negative = decrease
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;