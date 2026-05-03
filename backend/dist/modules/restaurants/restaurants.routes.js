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
const restaurants_schema_1 = require("./restaurants.schema");
const ctrl = __importStar(require("./restaurants.controller"));
const router = (0, express_1.Router)();
// ── Public ──────────────────────────────────────────────────────────────────
router.post('/register', (0, validate_middleware_1.validate)(restaurants_schema_1.registerSchema), ctrl.register);
router.get('/nearby', ctrl.getNearby);
router.get('/:id', ctrl.getById);
router.get('/:id/live-status', ctrl.getLiveStatus);
// ── Owner — manage own restaurant ────────────────────────────────────────────
router.patch('/:id', auth_middleware_1.authenticate, tenant_middleware_1.injectTenant, (0, rbac_middleware_1.requireRole)('owner'), (0, validate_middleware_1.validate)(restaurants_schema_1.updateRestaurantSchema), ctrl.update);
// ── Admin only ───────────────────────────────────────────────────────────────
router.get('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin'), ctrl.getAll);
router.patch('/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin'), (0, validate_middleware_1.validate)(restaurants_schema_1.updateStatusSchema), ctrl.updateStatus);
exports.default = router;
//# sourceMappingURL=restaurants.routes.js.map