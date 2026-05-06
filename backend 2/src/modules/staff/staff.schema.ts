import { z } from 'zod';

export const createStaffSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD')
    .refine((dob) => {
      const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= 18;
    }, 'Staff must be at least 18 years old'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  role: z.enum(['manager', 'host', 'waiter', 'chef', 'cashier']),
  branch_id: z.string().uuid('Invalid branch ID'),
});

export const updateStaffSchema = z.object({
  first_name: z.string().min(2).max(50).optional(),
  last_name: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  role: z.enum(['manager', 'host', 'waiter', 'chef', 'cashier']).optional(),
  branch_id: z.string().uuid().optional(),
  avatar_url: z.string().url().optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
