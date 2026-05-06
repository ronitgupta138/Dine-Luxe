"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rate_limit_middleware_1 = require("../../middleware/rate-limit.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const auth_controller_1 = require("./auth.controller");
const auth_schema_1 = require("./auth.schema");
const router = (0, express_1.Router)();
// All auth routes share the authLimiter
router.use(rate_limit_middleware_1.authLimiter);
router.post('/signup', (0, validate_middleware_1.validate)(auth_schema_1.signupSchema), auth_controller_1.signupController);
router.post('/verify-otp', (0, validate_middleware_1.validate)(auth_schema_1.otpSchema), auth_controller_1.verifyOtpController);
router.post('/login', (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), auth_controller_1.loginController);
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.logoutController);
router.post('/refresh', (0, validate_middleware_1.validate)(auth_schema_1.refreshTokenSchema), auth_controller_1.refreshController);
router.post('/forgot-password', (0, validate_middleware_1.validate)(auth_schema_1.forgotPasswordSchema), auth_controller_1.forgotPasswordController);
router.post('/reset-password', (0, validate_middleware_1.validate)(auth_schema_1.resetPasswordSchema), auth_controller_1.resetPasswordController);
router.get('/check-email', auth_controller_1.checkEmailController);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map