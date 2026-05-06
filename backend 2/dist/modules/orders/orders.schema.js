"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    table_id: zod_1.z.string().uuid(),
    order_type: zod_1.z.enum(['dine_in', 'takeaway', 'delivery']),
    items: zod_1.z
        .array(zod_1.z.object({
        menu_item_id: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
        notes: zod_1.z.string().max(500).optional(),
        addons: zod_1.z
            .array(zod_1.z.object({
            addon_id: zod_1.z.string().uuid(),
            quantity: zod_1.z.number().int().positive().default(1),
        }))
            .optional()
            .default([]),
    }))
        .min(1, 'Order must have at least one item'),
    special_instructions: zod_1.z.string().max(1000).optional(),
});
exports.cancelOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1).max(500).optional(),
});
//# sourceMappingURL=orders.schema.js.map