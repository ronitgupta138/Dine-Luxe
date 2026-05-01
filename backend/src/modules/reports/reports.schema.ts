import { z } from 'zod';

export const exportReportSchema = z.object({
  body: z.object({
    report_type: z.enum(['sales', 'menu-performance', 'kitchen-performance', 'customer-insights', 'platform']),
    branch_id: z.string().uuid().optional(),
    from: z.string().datetime(),
    to: z.string().datetime(),
    format: z.enum(['csv', 'pdf']).default('csv'),
  }),
});
