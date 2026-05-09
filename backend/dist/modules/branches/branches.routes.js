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
const branches_schema_1 = require("./branches.schema");
const ctrl = __importStar(require("./branches.controller"));
const router = (0, express_1.Router)();
// All branch routes require auth + tenant injection
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant);
router.get('/', (0, rbac_middleware_1.requireRole)('owner', 'admin'), ctrl.getAll);
router.post('/', (0, rbac_middleware_1.requireRole)('owner'), (0, validate_middleware_1.validate)(branches_schema_1.createBranchSchema), ctrl.create);
// BUG FIX: specific sub-routes MUST come before /:id — otherwise Express matches
// GET /live-stats and PATCH /status as /:id = "live-stats" / "status", which
// Postgres then rejects with "invalid input syntax for type uuid".
router.get('/:id/live-stats', (0, rbac_middleware_1.requireRole)('owner', 'manager', 'admin'), ctrl.getLiveStats);
router.patch('/:id/status', (0, rbac_middleware_1.requireRole)('owner'), (0, validate_middleware_1.validate)(branches_schema_1.updateBranchStatusSchema), ctrl.toggleStatus);
// Generic /:id routes come last
router.get('/:id', (0, rbac_middleware_1.requireRole)('owner', 'manager', 'admin'), ctrl.getById);
router.patch('/:id', (0, rbac_middleware_1.requireRole)('owner', 'manager'), (0, validate_middleware_1.validate)(branches_schema_1.updateBranchSchema), ctrl.update);
exports.default = router;
//# sourceMappingURL=branches.routes.js.map