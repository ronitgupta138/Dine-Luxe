"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookSchema = exports.upiQRSchema = exports.splitSchema = exports.verifySchema = exports.initiateSchema = void 0;
const zod_1 = require("zod");
exports.initiateSchema = zod_1.z.object({
    order_id: zod_1.z.string().uuid(),
    payment_method: zod_1.z.enum(['upi', 'card', 'cash', 'wallet']),
    split_with: zod_1.z.array(zod_1.z.string().uuid()).optional(), // user IDs for split bill
});
exports.verifySchema = zod_1.z.object({
    payment_id: zod_1.z.string().uuid(),
    gateway_payment_id: zod_1.z.string().optional(),
    status: zod_1.z.enum(['success', 'failed', 'pending']),
    gateway_signature: zod_1.z.string().optional(),
});
exports.splitSchema = zod_1.z.object({
    order_id: zod_1.z.string().uuid(),
    splits: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.string().min(1).max(100), // e.g. "Person 1"
        amount: zod_1.z.number().positive(),
        payment_method: zod_1.z.enum(['upi', 'card', 'cash', 'wallet']),
    })).min(2),
});
exports.upiQRSchema = zod_1.z.object({
    order_id: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive().optional(), // override for partial/split
});
exports.webhookSchema = zod_1.z.object({
    event: zod_1.z.string(),
    payment_id: zod_1.z.string(),
    order_id: zod_1.z.string().optional(),
    status: zod_1.z.string(),
    amount: zod_1.z.number().optional(),
    gateway_signature: zod_1.z.string().optional(),
});
//# sourceMappingURL=payments.schema.js.map