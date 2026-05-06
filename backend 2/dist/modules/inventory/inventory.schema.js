"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasteLogSchema = exports.deductInventorySchema = exports.updateInventorySchema = void 0;
const zod_1 = require("zod");
exports.updateInventorySchema = zod_1.z.object({
    body: zod_1.z.object({
        current_quantity: zod_1.z.number().min(0).optional(),
        reorder_threshold: zod_1.z.number().min(0).optional(),
        unit: zod_1.z.string().optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    }),
});
exports.deductInventorySchema = zod_1.z.object({
    body: zod_1.z.object({
        branch_id: zod_1.z.string().uuid(),
        items: zod_1.z.array(zod_1.z.object({
            menu_item_id: zod_1.z.string().uuid(),
            quantity: zod_1.z.number().positive(),
        })).min(1),
    }),
});
exports.wasteLogSchema = zod_1.z.object({
    body: zod_1.z.object({
        ingredient_id: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().positive(),
        reason: zod_1.z.string().min(1).max(500),
    }),
});
//# sourceMappingURL=inventory.schema.js.map