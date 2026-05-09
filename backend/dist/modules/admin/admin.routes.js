"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const admin_controller_1 = require("./admin.controller");
const admin_schema_1 = require("./admin.schema");
const router = (0, express_1.Router)();
// ── Public ───────────────────────────────────────────────────────────────────
// Health check
router.get('/health', admin_controller_1.getHealth);
// Super_admin signup — no token needed.
// Can create multiple super_admin accounts using the seed secret header.
router.post('/signup', (0, validate_middleware_1.validate)(admin_schema_1.createAdminSchema), admin_controller_1.signupSuperAdmin);
// ── super_admin only ─────────────────────────────────────────────────────────
router.post('/create-admin', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('super_admin'), (0, validate_middleware_1.validate)(admin_schema_1.createAdminSchema), admin_controller_1.createAdmin);
// ── admin + super_admin ──────────────────────────────────────────────────────
router.use(auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin', 'super_admin'));
router.get('/dashboard', admin_controller_1.getDashboard);
router.get('/platform-stats', admin_controller_1.getPlatformStats);
router.get('/health/detailed', admin_controller_1.getDetailedHealth);
router.get('/restaurants', admin_controller_1.getRestaurants);
router.patch('/restaurants/:id/status', admin_controller_1.updateRestaurantStatus);
router.get('/customers', admin_controller_1.getCustomers);
router.patch('/customers/:id/status', admin_controller_1.updateCustomerStatus);
router.get('/feedback', admin_controller_1.getFeedback);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map