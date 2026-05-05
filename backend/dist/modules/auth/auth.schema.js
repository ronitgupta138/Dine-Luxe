"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.forgotPasswordSchema = exports.resetPasswordSchema = exports.otpSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
/** E.164 phone format: +[country code][number] */
const phoneSchema = zod_1.z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (e.g. +919876543210)');
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    // BUG FIX: phone was required — made optional, collectable later via PATCH /users/me
    phone: phoneSchema.optional(),
    password: passwordSchema,
    // BUG FIX: accept either firstName+lastName OR a plain name field
    firstName: zod_1.z.string().min(1, 'First name is required').max(50).optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50).optional(),
    name: zod_1.z.string().min(1, 'Name is required').max(100).optional(),
}).refine((data) => data.firstName || data.name, { message: 'Either "name" or "firstName" is required', path: ['firstName'] });
exports.loginSchema = zod_1.z.object({
    // BUG FIX: was only `emailOrUsername` — no client sends that field name.
    // Now accepts `email` (standard) OR `emailOrUsername` (legacy/staff clients).
    email: zod_1.z.string().min(1, 'Email or username is required').optional(),
    emailOrUsername: zod_1.z.string().min(1, 'Email or username is required').optional(),
    password: zod_1.z.string().min(1, 'Password is required'),
}).refine((data) => data.email || data.emailOrUsername, { message: 'Email or username is required', path: ['email'] });
exports.otpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
    newPassword: passwordSchema,
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
//# sourceMappingURL=auth.schema.js.map