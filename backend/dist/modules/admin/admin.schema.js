"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminSchema = void 0;
const zod_1 = require("zod");
const auth_schema_1 = require("../auth/auth.schema");
exports.createAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: auth_schema_1.passwordSchema,
    first_name: zod_1.z.string().min(2, 'First name is required').max(50),
    last_name: zod_1.z.string().min(2, 'Last name is required').max(50),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
});
//# sourceMappingURL=admin.schema.js.map