import { z } from 'zod';
export declare const exportReportSchema: z.ZodObject<{
    report_type: z.ZodEnum<["sales", "menu-performance", "kitchen-performance", "customer-insights", "platform"]>;
    branch_id: z.ZodOptional<z.ZodString>;
    from: z.ZodString;
    to: z.ZodString;
    format: z.ZodDefault<z.ZodEnum<["csv", "pdf"]>>;
}, "strip", z.ZodTypeAny, {
    to: string;
    from: string;
    report_type: "platform" | "kitchen-performance" | "sales" | "menu-performance" | "customer-insights";
    format: "csv" | "pdf";
    branch_id?: string | undefined;
}, {
    to: string;
    from: string;
    report_type: "platform" | "kitchen-performance" | "sales" | "menu-performance" | "customer-insights";
    branch_id?: string | undefined;
    format?: "csv" | "pdf" | undefined;
}>;
export type ExportReportInput = z.infer<typeof exportReportSchema>;
//# sourceMappingURL=reports.schema.d.ts.map