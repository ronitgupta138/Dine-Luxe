import { z } from 'zod';

// ─── Register Schema (multi-step onboarding) ────────────────────────────────
export const registerSchema = z.object({
  // Owner details
  owner: z.object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    email: z.string().email('Invalid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
    password: z.string().min(8, 'Min 8 characters'),
  }),

  // Restaurant core details
  restaurant: z.object({
    name: z.string().min(2).max(100),
    cuisine_types: z.array(z.string()).min(1, 'Select at least one cuisine'),
    description: z.string().max(500).optional(),
    gst_number: z
      .string()
      .regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Invalid GST number'
      )
      .optional(),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    website: z.string().url().optional(),
  }),

  // First branch
  branch: z.object({
    name: z.string().min(2).max(100),
    address_line1: z.string().min(5).max(200),
    address_line2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    seating_capacity: z.number().int().min(1).max(500),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Update Schema ───────────────────────────────────────────────────────────
export const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  cuisine_types: z.array(z.string()).optional(),
  description: z.string().max(500).optional(),
  gst_number: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  website: z.string().url().optional(),
});

export const updateStatusSchema = z.object({
  // BUG FIX: DB enum RestaurantStatus has 'inactive' not 'closed'.
  status: z.enum(['pending', 'active', 'suspended', 'inactive']),
  reason: z.string().max(500).optional(),
});

export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
