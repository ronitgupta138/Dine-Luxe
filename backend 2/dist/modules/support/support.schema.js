"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postMessageSchema = exports.updateTicketStatusSchema = exports.createTicketSchema = void 0;
const zod_1 = require("zod");
exports.createTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().min(5).max(200),
        description: zod_1.z.string().min(10).max(2000),
        category: zod_1.z.enum(['order', 'payment', 'delivery', 'account', 'other']),
        order_id: zod_1.z.string().uuid().optional(),
        priority: zod_1.z.enum(['low', 'medium', 'high']).default('medium'),
    }),
});
exports.updateTicketStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['open', 'in_progress', 'resolved', 'closed', 'escalated']),
        resolution_note: zod_1.z.string().max(1000).optional(),
    }),
});
exports.postMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(1).max(2000),
        attachments: zod_1.z.array(zod_1.z.string().url()).max(5).optional(),
    }),
});
//# sourceMappingURL=support.schema.js.map