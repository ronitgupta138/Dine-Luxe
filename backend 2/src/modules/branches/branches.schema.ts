import { z } from 'zod';

// ─── Single Day Hours ─────────────────────────────────────────────────────────
const dayHoursSchema = z.union([
  z.object({
    closed: z.literal(true),
  }),
  z.object({
    closed: z.literal(false),
    open: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM'),
    close: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM'),
  }),
]);

// ─── Operating Hours (all 7 days required) ───────────────────────────────────
export const operatingHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

// ─── Create Branch ────────────────────────────────────────────────────────────
export const createBranchSchema = z.object({
  name: z.string().min(2).max(100),
  address_line1: z.string().min(5).max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  seating_capacity: z.number().int().min(1).max(1000),
  manager_id: z.string().uuid().optional(),
  operating_hours: operatingHoursSchema.optional(),
});

// ─── Update Branch ────────────────────────────────────────────────────────────
export const updateBranchSchema = createBranchSchema.partial();

export const updateBranchStatusSchema = z.object({
  status: z.enum(['active', 'closed', 'temporarily_closed']),
  reason: z.string().max(300).optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type UpdateBranchStatusInput = z.infer<typeof updateBranchStatusSchema>;
export type OperatingHours = z.infer<typeof operatingHoursSchema>;
