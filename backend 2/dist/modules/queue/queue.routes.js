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
const ctrl = __importStar(require("./queue.controller"));
const router = (0, express_1.Router)();
// POST /queue/join
// FIX: unauthenticated walk-ins need to join too; auth is optional here.
// If a JWT is present it will be used to attach user_id, otherwise null.
router.post('/join', ctrl.joinQueue);
// GET /queue/branch/:branchId — host/manager view the full queue
router.get('/branch/:branchId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner'), ctrl.getBranchQueue);
// GET /queue/position/:id — customer polling their own position OR staff
router.get('/position/:id', auth_middleware_1.authenticate, ctrl.getQueuePosition);
// PATCH /queue/:id/arrive — customer self-check-in OR staff marking
// FIX: waiter role added — waiters also escort guests and need to mark arrival
router.patch('/:id/arrive', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner', 'waiter', 'customer'), ctrl.markArrived);
// PATCH /queue/:id/assign-table — host / manager
router.patch('/:id/assign-table', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner'), ctrl.assignTable);
// PATCH /queue/:id/no-show — host / manager
router.patch('/:id/no-show', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner'), ctrl.markNoShow);
// DELETE /queue/:id — soft-delete (sets status=removed); host/manager/owner
// FIX: route kept as DELETE for REST semantics, but service now does a soft delete
router.delete('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner'), ctrl.removeFromQueue);
exports.default = router;
//# sourceMappingURL=queue.routes.js.map