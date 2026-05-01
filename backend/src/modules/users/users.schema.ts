import { z } from 'zod';

export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50)
    .optional(),

  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50)
    .optional(),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .optional(),

  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD')
    .optional(),

  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),

  avatar_url: z.string().url('Invalid avatar URL').optional(),

  address: z
    .object({
      line1: z.string().max(100).optional(),
      line2: z.string().max(100).optional(),
      city: z.string().max(50).optional(),
      state: z.string().max(50).optional(),
      pincode: z
        .string()
        .regex(/^\d{6}$/, 'Pincode must be 6 digits')
        .optional(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
