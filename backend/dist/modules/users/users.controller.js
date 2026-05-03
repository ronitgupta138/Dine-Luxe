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
exports.getMe = getMe;
exports.updateMe = updateMe;
exports.getUserById = getUserById;
exports.checkEmail = checkEmail;
const usersService = __importStar(require("./users.service"));
const response_1 = require("../../utils/response");
// GET /users/me
async function getMe(req, res, next) {
    try {
        const authReq = req;
        const profile = await usersService.getMe(authReq.user.id);
        res.json((0, response_1.success)(profile, 'Profile fetched'));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /users/me
async function updateMe(req, res, next) {
    try {
        const authReq = req;
        const updated = await usersService.updateMe(authReq.user.id, req.body);
        res.json((0, response_1.success)(updated, 'Profile updated'));
    }
    catch (err) {
        next(err);
    }
}
// GET /users/:id  (manager/owner/admin)
async function getUserById(req, res, next) {
    try {
        const authReq = req;
        // BUG FIX: restaurantId came from req.restaurantId (set by injectTenant),
        // but the routes file does NOT apply injectTenant for /:id — the route only
        // uses authenticate + requireRole. Fall back to user.restaurant_id from JWT.
        const restaurantId = authReq.restaurantId || authReq.user?.restaurant_id;
        if (!restaurantId) {
            return res
                .status(400)
                .json((0, response_1.error)('VALIDATION_ERROR', 'Restaurant context is required'));
        }
        const user = await usersService.getUserById(req.params.id, restaurantId);
        res.json((0, response_1.success)(user, 'User fetched'));
    }
    catch (err) {
        next(err);
    }
}
// GET /users/check-email?email=
async function checkEmail(req, res, next) {
    try {
        const email = req.query.email;
        // BUG FIX: original returned a plain string error (not the ErrorResponse
        // shape) — use the error() helper for a consistent API response shape.
        if (!email || !email.trim()) {
            return res
                .status(400)
                .json((0, response_1.error)('VALIDATION_ERROR', 'email query parameter is required'));
        }
        const result = await usersService.checkEmail(email);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=users.controller.js.map