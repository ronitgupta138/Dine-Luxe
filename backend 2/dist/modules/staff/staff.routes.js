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
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const staff_schema_1 = require("./staff.schema");
const ctrl = __importStar(require("./staff.controller"));
const router = (0, express_1.Router)();
// All routes: authenticated + tenant injected
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant);
router.get('/branch/:branchId', (0, rbac_middleware_1.requireRole)('manager', 'owner', 'admin'), ctrl.getByBranch);
router.post('/create', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)(staff_schema_1.createStaffSchema), ctrl.create);
router.get('/:id', (0, rbac_middleware_1.requireRole)('manager', 'owner', 'admin'), ctrl.getById);
router.patch('/:id', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)(staff_schema_1.updateStaffSchema), ctrl.update);
router.patch('/:id/toggle-access', (0, rbac_middleware_1.requireRole)('manager', 'owner'), ctrl.toggleAccess);
router.get('/:id/performance', (0, rbac_middleware_1.requireRole)('manager', 'owner', 'admin'), ctrl.getPerformance);
exports.default = router;
//# sourceMappingURL=staff.routes.js.map