import { z } from 'zod';
import { passwordSchema } from '../auth/auth.schema';

export const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  first_name: z.string().min(2, 'First name is required').max(50),
  last_name: z.string().min(2, 'Last name is required').max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
