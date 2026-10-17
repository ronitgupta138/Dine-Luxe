import { z } from 'zod';
export declare const createTicketSchema: z.ZodObject<{
    body: z.ZodObject<{
        subject: z.ZodString;
        description: z.ZodString;
        category: z.ZodEnum<["order", "payment", "delivery", "account", "other"]>;
        order_id: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        subject?: string;
        description?: string;
        order_id?: string;
        category?: "order" | "delivery" | "other" | "payment" | "account";
        priority?: "high" | "medium" | "low";
    }, {
        subject?: string;
        description?: string;
        order_id?: string;
        category?: "order" | "delivery" | "other" | "payment" | "account";
        priority?: "high" | "medium" | "low";
    }>;
}, "strip", z.ZodTypeAny, {
    body?: {
        subject?: string;
        description?: string;
        order_id?: string;
        category?: "order" | "delivery" | "other" | "payment" | "account";
        priority?: "high" | "medium" | "low";
    };
}, {
    body?: {
        subject?: string;
        description?: string;
        order_id?: string;
        category?: "order" | "delivery" | "other" | "payment" | "account";
        priority?: "high" | "medium" | "low";
    };
}>;
export declare const updateTicketStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<["open", "in_progress", "resolved", "closed", "escalated"]>;
        resolution_note: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string;
    }, {
        status?: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body?: {
        status?: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string;
    };
}, {
    body?: {
        status?: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string;
    };
}>;
export declare const postMessageSchema: z.ZodObject<{
    body: z.ZodObject<{
        message: z.ZodString;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        attachments?: string[];
    }, {
        message?: string;
        attachments?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    body?: {
        message?: string;
        attachments?: string[];
    };
}, {
    body?: {
        message?: string;
        attachments?: string[];
    };
}>;
//# sourceMappingURL=support.schema.d.ts.map