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
exports.getSales = getSales;
exports.getMenuPerformance = getMenuPerformance;
exports.getKitchenPerformance = getKitchenPerformance;
exports.getCustomerInsights = getCustomerInsights;
exports.getAdminPlatform = getAdminPlatform;
exports.getAdminTrends = getAdminTrends;
exports.exportReport = exportReport;
const reportsService = __importStar(require("./reports.service"));
const response_1 = require("../../utils/response");
async function getSales(req, res, next) {
    try {
        const authReq = req;
        const { branch_id, from, to, granularity = 'daily' } = req.query;
        const restaurant_id = authReq.user?.restaurant_id;
        if (!restaurant_id) {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'Restaurant context is required'));
        }
        const data = await reportsService.getSales({
            branch_id,
            restaurant_id,
            from,
            to,
            granularity,
        });
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getMenuPerformance(req, res, next) {
    try {
        const authReq = req;
        const { branch_id } = req.query;
        const restaurant_id = authReq.user?.restaurant_id;
        if (!restaurant_id) {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'Restaurant context is required'));
        }
        const data = await reportsService.getMenuPerformance(restaurant_id, branch_id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getKitchenPerformance(req, res, next) {
    try {
        const authReq = req;
        const { branch_id, from, to } = req.query;
        const data = await reportsService.getKitchenPerformance(branch_id ?? authReq.user?.branch_id, from, to);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getCustomerInsights(req, res, next) {
    try {
        const authReq = req;
        const restaurant_id = authReq.user?.restaurant_id;
        if (!restaurant_id) {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'Restaurant context is required'));
        }
        const data = await reportsService.getCustomerInsights(restaurant_id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getAdminPlatform(req, res, next) {
    try {
        const data = await reportsService.getAdminPlatformReport();
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getAdminTrends(req, res, next) {
    try {
        const { from, to } = req.query;
        const data = await reportsService.getAdminTrends(from, to);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function exportReport(req, res, next) {
    try {
        const authReq = req;
        // BUG FIX: original used `authReq.user!.restaurant_id` (non-null assertion)
        // but restaurant_id is optional on the JWT type — guard it explicitly.
        const restaurant_id = authReq.user?.restaurant_id;
        if (!restaurant_id) {
            return res
                .status(400)
                .json((0, response_1.error)('VALIDATION_ERROR', 'Restaurant context is required for export'));
        }
        const result = await reportsService.exportReport({
            ...req.body,
            restaurant_id,
            requested_by: authReq.user.id,
        });
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=reports.controller.js.map