"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranchStatusSchema = exports.updateBranchSchema = exports.createBranchSchema = exports.operatingHoursSchema = void 0;
const zod_1 = require("zod");
// ─── Single Day Hours ─────────────────────────────────────────────────────────
const dayHoursSchema = zod_1.z.union([
    zod_1.z.object({
        closed: zod_1.z.literal(true),
    }),
    zod_1.z.object({
        closed: zod_1.z.literal(false),
        open: zod_1.z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM'),
        close: zod_1.z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM'),
    }),
]);
// ─── Operating Hours (all 7 days required) ───────────────────────────────────
exports.operatingHoursSchema = zod_1.z.object({
    monday: dayHoursSchema,
    tuesday: dayHoursSchema,
    wednesday: dayHoursSchema,
    thursday: dayHoursSchema,
    friday: dayHoursSchema,
    saturday: dayHoursSchema,
    sunday: dayHoursSchema,
});
// ─── Create Branch ────────────────────────────────────────────────────────────
exports.createBranchSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    address_line1: zod_1.z.string().min(5).max(200),
    address_line2: zod_1.z.string().max(200).optional(),
    city: zod_1.z.string().min(2).max(100),
    state: zod_1.z.string().min(2).max(100),
    pincode: zod_1.z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
    seating_capacity: zod_1.z.number().int().min(1).max(1000),
    manager_id: zod_1.z.string().uuid().optional(),
    operating_hours: exports.operatingHoursSchema.optional(),
});
// ─── Update Branch ────────────────────────────────────────────────────────────
exports.updateBranchSchema = exports.createBranchSchema.partial();
exports.updateBranchStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'closed', 'temporarily_closed']),
    reason: zod_1.z.string().max(300).optional(),
});
//# sourceMappingURL=branches.schema.js.map