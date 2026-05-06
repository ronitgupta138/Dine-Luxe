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
    // BUG FIX: was bare Indian 10-digit regex ^[6-9]\d{9}$ but signup stores
    // phone in E.164 format (+919876543210). Accept both so PATCH /users/me
    // doesn't reject a number the user legitimately provided at signup.
    .regex(
      /^(\+[1-9]\d{7,14}|[6-9]\d{9})$/,
      'Phone must be a 10-digit Indian number or E.164 format (e.g. +919876543210)'
    )
    .optional(),

  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD')
    .optional(),

  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),

  avatar_url: z.string().url('Invalid avatar URL').optional(),

  address: z
    .object({
      line1:   z.string().max(100).optional(),
      line2:   z.string().max(100).optional(),
      city:    z.string().max(50).optional(),
      state:   z.string().max(50).optional(),
      pincode: z
        .string()
        .regex(/^\d{6}$/, 'Pincode must be 6 digits')
        .optional(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
