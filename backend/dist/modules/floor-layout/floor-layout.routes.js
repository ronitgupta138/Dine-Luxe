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
const ctrl = __importStar(require("./floor-layout.controller"));
const router = (0, express_1.Router)();
// GET /floor-layout/branch/:branchId — owner/manager — get current layout (active or draft)
router.get('/branch/:branchId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('manager', 'owner'), ctrl.getLayout);
// POST /floor-layout/branch/:branchId — save draft
router.post('/branch/:branchId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('manager', 'owner'), ctrl.saveDraft);
// POST /floor-layout/branch/:branchId/publish — make draft live
router.post('/branch/:branchId/publish', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('manager', 'owner'), ctrl.publishLayout);
// GET /floor-layout/branch/:branchId/live — all staff — live layout + table statuses
router.get('/branch/:branchId/live', auth_middleware_1.authenticate, ctrl.getLiveLayout);
exports.default = router;
//# sourceMappingURL=floor-layout.routes.js.map