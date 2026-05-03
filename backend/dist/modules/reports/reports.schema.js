"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReportSchema = void 0;
const zod_1 = require("zod");
// BUG FIX: The original schema wrapped fields inside a `body` key:
//   z.object({ body: z.object({ ... }) })
// but validate() in validate.middleware.ts calls schema.safeParse(req.body),
// meaning it parses the body directly — not a wrapper object.
// Removing the `body` wrapper so validation works correctly.
exports.exportReportSchema = zod_1.z.object({
    report_type: zod_1.z.enum([
        'sales',
        'menu-performance',
        'kitchen-performance',
        'customer-insights',
        'platform',
    ]),
    branch_id: zod_1.z.string().uuid().optional(),
    from: zod_1.z.string().datetime(),
    to: zod_1.z.string().datetime(),
    format: zod_1.z.enum(['csv', 'pdf']).default('csv'),
});
//# sourceMappingURL=reports.schema.js.map