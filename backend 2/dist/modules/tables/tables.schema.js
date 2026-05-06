"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_TRANSITIONS = exports.mergeSchema = exports.updateStatusSchema = exports.createTableSchema = exports.TableShape = exports.TableStatus = void 0;
const zod_1 = require("zod");
exports.TableStatus = zod_1.z.enum(['free', 'reserved', 'occupied', 'cleaning', 'maintenance']);
exports.TableShape = zod_1.z.enum(['round', 'square', 'rectangle', 'booth']);
exports.createTableSchema = zod_1.z.object({
    branch_id: zod_1.z.string().uuid(),
    label: zod_1.z.string().min(1).max(10),
    capacity: zod_1.z.number().int().min(1).max(20),
    floor_number: zod_1.z.number().int().min(0).default(0),
    shape: exports.TableShape.default('square'),
    zone: zod_1.z.string().max(50).default('indoor'),
    photo_url: zod_1.z.string().url().optional(),
    x_pos: zod_1.z.number().int().optional(),
    y_pos: zod_1.z.number().int().optional(),
});
exports.updateStatusSchema = zod_1.z.object({
    new_status: exports.TableStatus,
    reason: zod_1.z.string().max(255).optional(),
});
exports.mergeSchema = zod_1.z
    .object({
    table_id_1: zod_1.z.string().uuid(),
    table_id_2: zod_1.z.string().uuid(),
})
    .refine((d) => d.table_id_1 !== d.table_id_2, {
    message: 'table_id_1 and table_id_2 must be different tables',
});
// Valid state machine transitions
// FIX: added 'occupied' → 'free' for emergency clear (walk-out / error correction by manager)
//      The original had occupied → cleaning but no way to skip cleaning for quick turnover.
//      Manager override via 'reason' field handles edge cases.
exports.VALID_TRANSITIONS = {
    free: ['reserved', 'occupied', 'maintenance'],
    // FIX: added 'free' to reserved transitions — a reservation can be cancelled before the guest arrives
    reserved: ['occupied', 'free', 'maintenance'],
    // FIX: added 'free' to occupied — manager override for data correction / quick reset
    occupied: ['cleaning', 'free', 'maintenance'],
    cleaning: ['free', 'maintenance'],
    maintenance: ['free'],
};
//# sourceMappingURL=tables.schema.js.map