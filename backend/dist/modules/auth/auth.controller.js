"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupController = signupController;
exports.verifyOtpController = verifyOtpController;
exports.loginController = loginController;
exports.logoutController = logoutController;
exports.refreshController = refreshController;
exports.forgotPasswordController = forgotPasswordController;
exports.resetPasswordController = resetPasswordController;
exports.checkEmailController = checkEmailController;
const authService = __importStar(require("./auth.service"));
const response_1 = require("../../utils/response");
async function signupController(req, res, next) {
    try {
        const result = await authService.signup(req.body);
        res.status(202).json((0, response_1.success)(result, 'OTP sent. Please verify your email.'));
    }
    catch (err) {
        next(err);
    }
}
async function verifyOtpController(req, res, next) {
    try {
        const result = await authService.verifyOtp(req.body);
        res.status(201).json((0, response_1.success)(result, 'Account verified and created successfully.'));
    }
    catch (err) {
        next(err);
    }
}
async function loginController(req, res, next) {
    try {
        const result = await authService.login(req.body);
        res.status(200).json((0, response_1.success)(result, 'Login successful.'));
    }
    catch (err) {
        next(err);
    }
}
async function logoutController(req, res, next) {
    try {
        const userId = req.user?.id;
        await authService.logout(userId ?? '');
        res.status(200).json((0, response_1.success)(null, 'Logged out successfully.'));
    }
    catch (err) {
        next(err);
    }
}
async function refreshController(req, res, next) {
    try {
        const result = await authService.refreshToken(req.body);
        res.status(200).json((0, response_1.success)(result, 'Token refreshed.'));
    }
    catch (err) {
        next(err);
    }
}
async function forgotPasswordController(req, res, next) {
    try {
        const result = await authService.forgotPassword(req.body);
        res.status(200).json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function resetPasswordController(req, res, next) {
    try {
        const result = await authService.resetPassword(req.body);
        res.status(200).json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function checkEmailController(req, res, next) {
    try {
        // BUG FIX: normalise email before querying so "User@Email.Com" and
        // "user@email.com" are treated as the same address.
        const raw = req.query['email'];
        const email = (raw ?? '').toLowerCase().trim();
        if (!email) {
            res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'email query parameter is required'));
            return;
        }
        const { data, error: dbError } = await Promise.resolve().then(() => __importStar(require('../../config/supabase'))).then(({ supabaseAdmin }) => supabaseAdmin.from('users').select('id').eq('email', email).maybeSingle());
        if (dbError)
            throw dbError;
        res.status(200).json((0, response_1.success)({ available: !data }, data ? 'Email is taken.' : 'Email is available.'));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map