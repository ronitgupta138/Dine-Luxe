"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffSchema = exports.createStaffSchema = void 0;
const zod_1 = require("zod");
exports.createStaffSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(2).max(50),
    last_name: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email('Invalid email'),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    dob: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD')
        .refine((dob) => {
        const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000);
        return age >= 18;
    }, 'Staff must be at least 18 years old'),
    gender: zod_1.z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
    role: zod_1.z.enum(['manager', 'host', 'waiter', 'chef', 'cashier']),
    branch_id: zod_1.z.string().uuid('Invalid branch ID'),
});
exports.updateStaffSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(2).max(50).optional(),
    last_name: zod_1.z.string().min(2).max(50).optional(),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
    role: zod_1.z.enum(['manager', 'host', 'waiter', 'chef', 'cashier']).optional(),
    branch_id: zod_1.z.string().uuid().optional(),
    avatar_url: zod_1.z.string().url().optional(),
});
//# sourceMappingURL=staff.schema.js.map