import { z } from 'zod';
export declare const createTicketSchema: z.ZodObject<{
    body: z.ZodObject<{
        subject: z.ZodString;
        description: z.ZodString;
        category: z.ZodEnum<["order", "payment", "delivery", "account", "other"]>;
        order_id: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        subject: string;
        description: string;
        category: "order" | "delivery" | "other" | "payment" | "account";
        priority: "high" | "medium" | "low";
        order_id?: string | undefined;
    }, {
        subject: string;
        description: string;
        category: "order" | "delivery" | "other" | "payment" | "account";
        order_id?: string | undefined;
        priority?: "high" | "medium" | "low" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        subject: string;
        description: string;
        category: "order" | "delivery" | "other" | "payment" | "account";
        priority: "high" | "medium" | "low";
        order_id?: string | undefined;
    };
}, {
    body: {
        subject: string;
        description: string;
        category: "order" | "delivery" | "other" | "payment" | "account";
        order_id?: string | undefined;
        priority?: "high" | "medium" | "low" | undefined;
    };
}>;
export declare const updateTicketStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<["open", "in_progress", "resolved", "closed", "escalated"]>;
        resolution_note: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string | undefined;
    }, {
        status: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string | undefined;
    };
}, {
    body: {
        status: "closed" | "open" | "resolved" | "in_progress" | "escalated";
        resolution_note?: string | undefined;
    };
}>;
export declare const postMessageSchema: z.ZodObject<{
    body: z.ZodObject<{
        message: z.ZodString;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        attachments?: string[] | undefined;
    }, {
        message: string;
        attachments?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        message: string;
        attachments?: string[] | undefined;
    };
}, {
    body: {
        message: string;
        attachments?: string[] | undefined;
    };
}>;
//# sourceMappingURL=support.schema.d.ts.map