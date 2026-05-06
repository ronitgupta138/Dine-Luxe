import { z } from 'zod';

export const createBookingSchema = z.object({
  branch_id: z.string().uuid(),
  people_count: z.number().int().min(1).max(50),
  arrival_time: z.string().datetime({ offset: true }),
  table_id: z.string().uuid().optional(),
  special_requests: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(255).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
