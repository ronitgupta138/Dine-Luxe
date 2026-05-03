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
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const ctrl = __importStar(require("./kitchen.controller"));
const router = (0, express_1.Router)();
// GET /kitchen/branch/:branchId/tickets
// Active KDS orders — chef needs this to cook; manager/owner need it for oversight
// FIX: was chef-only; manager and owner added so they can monitor the KDS remotely
router.get('/branch/:branchId/tickets', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('chef', 'manager', 'owner'), ctrl.getTickets);
// PATCH /kitchen/orders/:id/status
// Chef-ONLY forward transitions (confirmed → preparing → ready)
router.patch('/orders/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('chef'), ctrl.updateOrderStatus);
// GET /kitchen/branch/:branchId/overdue
// FIX: chef added — they need to see overdue orders to know what to prioritise
// Manager/owner already had access for their oversight role
router.get('/branch/:branchId/overdue', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('chef', 'manager', 'owner'), ctrl.getOverdueOrders);
exports.default = router;
//# sourceMappingURL=kitchen.routes.js.map