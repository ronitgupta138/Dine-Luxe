"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    first_name: zod_1.z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50)
        .optional(),
    last_name: zod_1.z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50)
        .optional(),
    phone: zod_1.z
        .string()
        .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
        .optional(),
    dob: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD')
        .optional(),
    gender: zod_1.z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    avatar_url: zod_1.z.string().url('Invalid avatar URL').optional(),
    address: zod_1.z
        .object({
        line1: zod_1.z.string().max(100).optional(),
        line2: zod_1.z.string().max(100).optional(),
        city: zod_1.z.string().max(50).optional(),
        state: zod_1.z.string().max(50).optional(),
        pincode: zod_1.z
            .string()
            .regex(/^\d{6}$/, 'Pincode must be 6 digits')
            .optional(),
    })
        .optional(),
});
//# sourceMappingURL=users.schema.js.map