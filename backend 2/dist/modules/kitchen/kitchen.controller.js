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
exports.getTickets = getTickets;
exports.updateOrderStatus = updateOrderStatus;
exports.getOverdueOrders = getOverdueOrders;
const response_1 = require("../../utils/response");
const kitchenService = __importStar(require("./kitchen.service"));
async function getTickets(req, res, next) {
    try {
        // FIX: validate branchId param is present before hitting DB
        if (!req.params.branchId)
            return res.status(400).json((0, response_1.error)('branchId is required'));
        const data = await kitchenService.getKitchenTickets(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function updateOrderStatus(req, res, next) {
    try {
        const { status } = req.body;
        if (!status)
            return res.status(400).json((0, response_1.error)('status is required'));
        const data = await kitchenService.updateKitchenStatus(req.params.id, status);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        // FIX: original only handled 422; 404 (order not found) and 409 also need
        // explicit HTTP responses — generalise to all 4xx known errors
        const code = err.statusCode ?? err.status;
        if (code && code >= 400 && code < 500) {
            return res.status(code).json((0, response_1.error)(err.message, undefined));
        }
        next(err);
    }
}
async function getOverdueOrders(req, res, next) {
    try {
        if (!req.params.branchId)
            return res.status(400).json((0, response_1.error)('branchId is required'));
        const data = await kitchenService.getOverdueOrders(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=kitchen.controller.js.map