"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.updateRestaurantSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ─── Register Schema (multi-step onboarding) ────────────────────────────────
exports.registerSchema = zod_1.z.object({
    // Owner details
    owner: zod_1.z.object({
        first_name: zod_1.z.string().min(2).max(50),
        last_name: zod_1.z.string().min(2).max(50),
        email: zod_1.z.string().email('Invalid email'),
        phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
        dob: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
        password: zod_1.z.string().min(8, 'Min 8 characters'),
    }),
    // Restaurant core details
    restaurant: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100),
        cuisine_types: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one cuisine'),
        description: zod_1.z.string().max(500).optional(),
        gst_number: zod_1.z
            .string()
            .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number')
            .optional(),
        contact_email: zod_1.z.string().email().optional(),
        contact_phone: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
        website: zod_1.z.string().url().optional(),
    }),
    // First branch
    branch: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100),
        address_line1: zod_1.z.string().min(5).max(200),
        address_line2: zod_1.z.string().max(200).optional(),
        city: zod_1.z.string().min(2).max(100),
        state: zod_1.z.string().min(2).max(100),
        pincode: zod_1.z.string().regex(/^\d{6}$/, 'Invalid pincode'),
        phone: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
        seating_capacity: zod_1.z.number().int().min(1).max(500),
    }),
});
// ─── Update Schema ───────────────────────────────────────────────────────────
exports.updateRestaurantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    cuisine_types: zod_1.z.array(zod_1.z.string()).optional(),
    description: zod_1.z.string().max(500).optional(),
    gst_number: zod_1.z.string().optional(),
    contact_email: zod_1.z.string().email().optional(),
    contact_phone: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
    website: zod_1.z.string().url().optional(),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'active', 'suspended', 'closed']),
    reason: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=restaurants.schema.js.map