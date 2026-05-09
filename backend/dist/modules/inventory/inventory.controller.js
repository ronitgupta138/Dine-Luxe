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
exports.getInventory = getInventory;
exports.createInventory = createInventory;
exports.updateInventory = updateInventory;
exports.deductInventory = deductInventory;
exports.wasteLog = wasteLog;
exports.getAlerts = getAlerts;
const inventoryService = __importStar(require("./inventory.service"));
const response_1 = require("../../utils/response");
async function getInventory(req, res, next) {
    try {
        const { branchId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await inventoryService.getInventoryByBranch(branchId, page, limit);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function createInventory(req, res, next) {
    try {
        const authReq = req;
        const data = await inventoryService.createInventoryItem(req.body, authReq.user.id);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function updateInventory(req, res, next) {
    try {
        const authReq = req;
        const data = await inventoryService.updateInventoryItem(req.params.id, req.body, authReq.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function deductInventory(req, res, next) {
    try {
        const authReq = req;
        const { branch_id, items } = req.body;
        const data = await inventoryService.deduct(branch_id, items, authReq.user.id);
        res.json((0, response_1.success)(data, 'Inventory deducted successfully'));
    }
    catch (err) {
        next(err);
    }
}
async function wasteLog(req, res, next) {
    try {
        const authReq = req;
        const { inventory_id, inventory_item_id, ingredient_id, quantity, reason } = req.body;
        const data = await inventoryService.logWaste(inventory_id ?? inventory_item_id ?? ingredient_id, quantity, reason, authReq.user.id);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getAlerts(req, res, next) {
    try {
        const { branchId } = req.params;
        const data = await inventoryService.getAlerts(branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=inventory.controller.js.map