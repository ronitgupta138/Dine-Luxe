import { z } from 'zod';

export const createOrderSchema = z.object({
  table_id: z.string().uuid(),
  order_type: z.enum(['dine_in', 'takeaway', 'delivery']),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        notes: z.string().max(500).optional(),
        addons: z
          .array(
            z.object({
              addon_id: z.string().uuid(),
              quantity: z.number().int().positive().default(1),
            })
          )
          .optional()
          .default([]),
      })
    )
    .min(1, 'Order must have at least one item'),
  special_instructions: z.string().max(1000).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
