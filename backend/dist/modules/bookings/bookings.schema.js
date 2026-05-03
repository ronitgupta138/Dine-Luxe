"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBookingSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    branch_id: zod_1.z.string().uuid(),
    people_count: zod_1.z.number().int().min(1).max(50),
    arrival_time: zod_1.z.string().datetime({ offset: true }),
    table_id: zod_1.z.string().uuid().optional(),
    special_requests: zod_1.z.string().max(500).optional(),
});
exports.cancelBookingSchema = zod_1.z.object({
    reason: zod_1.z.string().max(255).optional(),
});
//# sourceMappingURL=bookings.schema.js.map