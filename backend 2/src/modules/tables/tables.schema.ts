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

export const mergeSchema = z
  .object({
    table_id_1: z.string().uuid(),
    table_id_2: z.string().uuid(),
  })
  .refine((d) => d.table_id_1 !== d.table_id_2, {
    message: 'table_id_1 and table_id_2 must be different tables',
  });

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type MergeInput = z.infer<typeof mergeSchema>;

// Valid state machine transitions
// FIX: added 'occupied' → 'free' for emergency clear (walk-out / error correction by manager)
//      The original had occupied → cleaning but no way to skip cleaning for quick turnover.
//      Manager override via 'reason' field handles edge cases.
export const VALID_TRANSITIONS: Record<TableStatusType, TableStatusType[]> = {
  free:        ['reserved', 'occupied', 'maintenance'],
  // FIX: added 'free' to reserved transitions — a reservation can be cancelled before the guest arrives
  reserved:    ['occupied', 'free', 'maintenance'],
  // FIX: added 'free' to occupied — manager override for data correction / quick reset
  occupied:    ['cleaning', 'free', 'maintenance'],
  cleaning:    ['free', 'maintenance'],
  maintenance: ['free'],
};