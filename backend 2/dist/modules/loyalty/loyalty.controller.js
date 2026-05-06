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
exports.getBalance = getBalance;
exports.earnPoints = earnPoints;
exports.redeemPoints = redeemPoints;
exports.getHistory = getHistory;
const loyaltyService = __importStar(require("./loyalty.service"));
const response_1 = require("../../utils/response");
// ─── GET /loyalty/balance — own balance only ───────────────────────────────────
async function getBalance(req, res, next) {
    try {
        // Security: always use the authenticated user's own ID, never a URL param
        const data = await loyaltyService.getBalance(req.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
// ─── POST /loyalty/earn ────────────────────────────────────────────────────────
async function earnPoints(req, res, next) {
    try {
        const { order_id, amount_paid, restaurant_id } = req.body;
        if (!order_id || typeof order_id !== 'string') {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'order_id is required'));
        }
        if (typeof amount_paid !== 'number' || amount_paid <= 0) {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'amount_paid must be a positive number'));
        }
        if (!restaurant_id || typeof restaurant_id !== 'string') {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'restaurant_id is required'));
        }
        const data = await loyaltyService.earn(req.user.id, order_id, amount_paid, restaurant_id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
// ─── POST /loyalty/redeem ──────────────────────────────────────────────────────
async function redeemPoints(req, res, next) {
    try {
        const { order_id, points_to_redeem, restaurant_id } = req.body;
        if (!order_id || typeof order_id !== 'string') {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'order_id is required'));
        }
        if (typeof points_to_redeem !== 'number') {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'points_to_redeem must be a number'));
        }
        if (!restaurant_id || typeof restaurant_id !== 'string') {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'restaurant_id is required'));
        }
        const data = await loyaltyService.redeem(req.user.id, order_id, points_to_redeem, restaurant_id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        if (err.statusCode)
            return res.status(err.statusCode).json((0, response_1.error)(err.message));
        next(err);
    }
}
// ─── GET /loyalty/history — own history only ──────────────────────────────────
async function getHistory(req, res, next) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        // Security: always use authenticated user's own ID
        const result = await loyaltyService.getHistory(req.user.id, page, limit);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=loyalty.controller.js.map