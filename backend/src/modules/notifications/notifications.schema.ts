import { z } from 'zod';

export const registerDeviceSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    platform: z.enum(['ios', 'android', 'web']).optional(),
  }),
});
