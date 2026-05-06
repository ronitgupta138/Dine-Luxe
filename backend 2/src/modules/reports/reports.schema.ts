import { z } from 'zod';

// BUG FIX: The original schema wrapped fields inside a `body` key:
//   z.object({ body: z.object({ ... }) })
// but validate() in validate.middleware.ts calls schema.safeParse(req.body),
// meaning it parses the body directly — not a wrapper object.
// Removing the `body` wrapper so validation works correctly.
export const exportReportSchema = z.object({
  report_type: z.enum([
    'sales',
    'menu-performance',
    'kitchen-performance',
    'customer-insights',
    'platform',
  ]),
  branch_id: z.string().uuid().optional(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  format: z.enum(['csv', 'pdf']).default('csv'),
});

export type ExportReportInput = z.infer<typeof exportReportSchema>;
