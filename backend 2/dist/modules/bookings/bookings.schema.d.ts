import { z } from 'zod';
export declare const createBookingSchema: z.ZodObject<{
    branch_id: z.ZodString;
    people_count: z.ZodNumber;
    arrival_time: z.ZodString;
    table_id: z.ZodOptional<z.ZodString>;
    special_requests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    branch_id: string;
    people_count: number;
    arrival_time: string;
    table_id?: string | undefined;
    special_requests?: string | undefined;
}, {
    branch_id: string;
    people_count: number;
    arrival_time: string;
    table_id?: string | undefined;
    special_requests?: string | undefined;
}>;
export declare const cancelBookingSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
//# sourceMappingURL=bookings.schema.d.ts.map