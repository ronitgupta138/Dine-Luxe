"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReportSchema = exports.salesReportQuerySchema = void 0;
const zod_1 = require("zod");
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
function isValidDateInput(value) {
    if (dateOnlyRegex.test(value))
        return true;
    return !Number.isNaN(Date.parse(value));
}
function normalizeReportType(value) {
    return value.replace(/_/g, '-');
}
exports.salesReportQuerySchema = zod_1.z
    .object({
    branch_id: zod_1.z.string().uuid('branch_id must be a valid UUID'),
    from: zod_1.z.string().refine(isValidDateInput, 'from must be a valid date or datetime'),
    to: zod_1.z.string().refine(isValidDateInput, 'to must be a valid date or datetime'),
    granularity: zod_1.z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
})
    .refine(({ from, to }) => new Date(from).getTime() <= new Date(to).getTime(), {
    message: 'from must be less than or equal to to',
    path: ['from'],
});
// BUG FIX: The original schema wrapped fields inside a `body` key:
//   z.object({ body: z.object({ ... }) })
// but validate() in validate.middleware.ts calls schema.safeParse(req.body),
// meaning it parses the body directly — not a wrapper object.
// Removing the `body` wrapper so validation works correctly.
exports.exportReportSchema = zod_1.z.object({
    report_type: zod_1.z
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
    branch_id: zod_1.z.string().uuid().optional(),
    from: zod_1.z
        .string()
        .refine(isValidDateInput, 'from must be a valid date or datetime')
        .optional(),
    to: zod_1.z
        .string()
        .refine(isValidDateInput, 'to must be a valid date or datetime')
        .optional(),
    format: zod_1.z.enum(['csv', 'pdf']).default('csv'),
});
//# sourceMappingURL=reports.schema.js.map