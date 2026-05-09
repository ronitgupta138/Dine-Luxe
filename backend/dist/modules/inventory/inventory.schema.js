"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasteLogSchema = exports.deductInventorySchema = exports.updateInventorySchema = exports.createInventorySchema = void 0;
const zod_1 = require("zod");
exports.createInventorySchema = zod_1.z.object({
    branch_id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(200),
    unit: zod_1.z.string().min(1).max(20),
    quantity: zod_1.z.number().min(0),
    min_threshold: zod_1.z.number().min(0),
    cost_per_unit: zod_1.z.number().min(0).optional(),
    category: zod_1.z.string().optional(),
    supplier: zod_1.z.string().optional(),
});
exports.updateInventorySchema = zod_1.z.object({
    quantity: zod_1.z.number().min(0).optional(),
    min_threshold: zod_1.z.number().min(0).optional(),
    cost_per_unit: zod_1.z.number().min(0).optional(),
    notes: zod_1.z.string().max(500).optional(),
    current_quantity: zod_1.z.number().min(0).optional(),
    reorder_threshold: zod_1.z.number().min(0).optional(),
    unit: zod_1.z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
exports.deductInventorySchema = zod_1.z.object({
    branch_id: zod_1.z.string().uuid().optional(),
    reason: zod_1.z.string().min(1).max(500).optional(),
    items: zod_1.z.array(zod_1.z.object({
        inventory_id: zod_1.z.string().uuid().optional(),
        inventory_item_id: zod_1.z.string().uuid().optional(),
        menu_item_id: zod_1.z.string().uuid().optional(),
        quantity: zod_1.z.number().positive(),
    }).refine(item => item.inventory_id || item.inventory_item_id || item.menu_item_id, {
        message: 'inventory_id, inventory_item_id, or menu_item_id is required',
    })).min(1),
});
exports.wasteLogSchema = zod_1.z.object({
    inventory_id: zod_1.z.string().uuid().optional(),
    inventory_item_id: zod_1.z.string().uuid().optional(),
    ingredient_id: zod_1.z.string().uuid().optional(),
    quantity: zod_1.z.number().positive(),
    reason: zod_1.z.string().min(1).max(50),
    logged_by: zod_1.z.string().uuid().optional(),
}).refine(data => data.inventory_id || data.inventory_item_id || data.ingredient_id, {
    message: 'inventory_id is required',
});
//# sourceMappingURL=inventory.schema.js.map