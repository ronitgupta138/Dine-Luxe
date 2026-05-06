import { z } from 'zod';

export const updateInventorySchema = z.object({
  body: z.object({
    current_quantity: z.number().min(0).optional(),
    reorder_threshold: z.number().min(0).optional(),
    unit: z.string().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

export const deductInventorySchema = z.object({
  body: z.object({
    branch_id: z.string().uuid(),
    items: z.array(
      z.object({
        menu_item_id: z.string().uuid(),
        quantity: z.number().positive(),
      })
    ).min(1),
  }),
});

export const wasteLogSchema = z.object({
  body: z.object({
    ingredient_id: z.string().uuid(),
    quantity: z.number().positive(),
    reason: z.string().min(1).max(500),
  }),
});
