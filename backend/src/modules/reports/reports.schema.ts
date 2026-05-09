import { z } from 'zod';

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateInput(value: string): boolean {
  if (dateOnlyRegex.test(value)) return true;
  return !Number.isNaN(Date.parse(value));
}

function normalizeReportType(value: string): string {
  return value.replace(/_/g, '-');
}

export const salesReportQuerySchema = z
  .object({
    branch_id: z.string().uuid('branch_id must be a valid UUID'),
    from: z.string().refine(isValidDateInput, 'from must be a valid date or datetime'),
    to: z.string().refine(isValidDateInput, 'to must be a valid date or datetime'),
    granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  })
  .refine(
    ({ from, to }) => new Date(from).getTime() <= new Date(to).getTime(),
    {
      message: 'from must be less than or equal to to',
      path: ['from'],
    },
  );

// BUG FIX: The original schema wrapped fields inside a `body` key:
//   z.object({ body: z.object({ ... }) })
// but validate() in validate.middleware.ts calls schema.safeParse(req.body),
// meaning it parses the body directly — not a wrapper object.
// Removing the `body` wrapper so validation works correctly.
export const exportReportSchema = z.object({
  report_type: z
    .enum([
      'sales',
      'menu-performance',
      'kitchen-performance',
      'customer-insights',
      'platform',
      'menu_performance',
      'kitchen_performance',
      'customer_insights',
    ])
    .transform(normalizeReportType),
  branch_id: z.string().uuid().optional(),
  from: z
    .string()
    .refine(isValidDateInput, 'from must be a valid date or datetime')
    .optional(),
  to: z
    .string()
    .refine(isValidDateInput, 'to must be a valid date or datetime')
    .optional(),
  format: z.enum(['csv', 'pdf']).default('csv'),
});

export type ExportReportInput = z.infer<typeof exportReportSchema>;
