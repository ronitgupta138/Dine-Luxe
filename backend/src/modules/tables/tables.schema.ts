import { z } from 'zod';

export const TableStatus = z.enum(['free', 'reserved', 'occupied', 'cleaning', 'maintenance']);
export type TableStatusType = z.infer<typeof TableStatus>;

export const TableShape = z.enum(['round', 'square', 'rectangle', 'booth']);

export const createTableSchema = z.object({
  branch_id: z.string().uuid(),
  label: z.string().min(1).max(10),
  capacity: z.number().int().min(1).max(20),
  floor_number: z.number().int().min(0).default(0),
  shape: TableShape.default('square'),
  zone: z.string().max(50).default('indoor'),
  photo_url: z.string().url().optional(),
  x_pos: z.number().int().optional(),
  y_pos: z.number().int().optional(),
});

export const updateStatusSchema = z.object({
  new_status: TableStatus,
  reason: z.string().max(255).optional(),
});

export const mergeSchema = z.object({
  table_id_1: z.string().uuid(),
  table_id_2: z.string().uuid(),
}).refine(d => d.table_id_1 !== d.table_id_2, {
  message: 'table_id_1 and table_id_2 must be different tables',
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type MergeInput = z.infer<typeof mergeSchema>;

// Valid state machine transitions
export const VALID_TRANSITIONS: Record<TableStatusType, TableStatusType[]> = {
  free:        ['reserved', 'maintenance'],
  reserved:    ['occupied', 'free', 'maintenance'],
  occupied:    ['cleaning', 'maintenance'],
  cleaning:    ['free', 'maintenance'],
  maintenance: ['free'],
};
