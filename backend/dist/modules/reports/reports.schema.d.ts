import { z } from 'zod';
export declare const salesReportQuerySchema: z.ZodEffects<z.ZodObject<{
    branch_id: z.ZodString;
    from: z.ZodEffects<z.ZodString, string, string>;
    to: z.ZodEffects<z.ZodString, string, string>;
    granularity: z.ZodOptional<z.ZodEnum<["hourly", "daily", "weekly", "monthly"]>>;
}, "strip", z.ZodTypeAny, {
    branch_id: string;
    to: string;
    from: string;
    granularity?: "hourly" | "daily" | "weekly" | "monthly" | undefined;
}, {
    branch_id: string;
    to: string;
    from: string;
    granularity?: "hourly" | "daily" | "weekly" | "monthly" | undefined;
}>, {
    branch_id: string;
    to: string;
    from: string;
    granularity?: "hourly" | "daily" | "weekly" | "monthly" | undefined;
}, {
    branch_id: string;
    to: string;
    from: string;
    granularity?: "hourly" | "daily" | "weekly" | "monthly" | undefined;
}>;
export declare const exportReportSchema: z.ZodObject<{
    report_type: z.ZodEffects<z.ZodEnum<["sales", "menu-performance", "kitchen-performance", "customer-insights", "platform", "menu_performance", "kitchen_performance", "customer_insights"]>, string, "platform" | "kitchen-performance" | "sales" | "menu-performance" | "customer-insights" | "menu_performance" | "kitchen_performance" | "customer_insights">;
    branch_id: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    to: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    format: z.ZodDefault<z.ZodEnum<["csv", "pdf"]>>;
}, "strip", z.ZodTypeAny, {
    report_type: string;
    format: "csv" | "pdf";
    branch_id?: string | undefined;
    to?: string | undefined;
    from?: string | undefined;
}, {
    report_type: "platform" | "kitchen-performance" | "sales" | "menu-performance" | "customer-insights" | "menu_performance" | "kitchen_performance" | "customer_insights";
    branch_id?: string | undefined;
    to?: string | undefined;
    from?: string | undefined;
    format?: "csv" | "pdf" | undefined;
}>;
export type ExportReportInput = z.infer<typeof exportReportSchema>;
//# sourceMappingURL=reports.schema.d.ts.map