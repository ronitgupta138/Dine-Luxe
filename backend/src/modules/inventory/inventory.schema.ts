import { z } from 'zod';

export const createInventorySchema = z.object({
  branch_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  unit: z.string().min(1).max(20),
  quantity: z.number().min(0),
  min_threshold: z.number().min(0),
  cost_per_unit: z.number().min(0).optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().min(0).optional(),
  min_threshold: z.number().min(0).optional(),
  cost_per_unit: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  current_quantity: z.number().min(0).optional(),
  reorder_threshold: z.number().min(0).optional(),
  unit: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const deductInventorySchema = z.object({
  branch_id: z.string().uuid().optional(),
  reason: z.string().min(1).max(500).optional(),
  items: z.array(
    z.object({
      inventory_id: z.string().uuid().optional(),
      inventory_item_id: z.string().uuid().optional(),
      menu_item_id: z.string().uuid().optional(),
      quantity: z.number().positive(),
    }).refine(item => item.inventory_id || item.inventory_item_id || item.menu_item_id, {
      message: 'inventory_id, inventory_item_id, or menu_item_id is required',
    })
  ).min(1),
});

export const wasteLogSchema = z.object({
  inventory_id: z.string().uuid().optional(),
  inventory_item_id: z.string().uuid().optional(),
  ingredient_id: z.string().uuid().optional(),
  quantity: z.number().positive(),
  reason: z.string().min(1).max(50),
  logged_by: z.string().uuid().optional(),
}).refine(data => data.inventory_id || data.inventory_item_id || data.ingredient_id, {
  message: 'inventory_id is required',
});
