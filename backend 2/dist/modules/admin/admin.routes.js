"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const admin_controller_1 = require("./admin.controller");
const router = (0, express_1.Router)();
// Public health check
router.get('/health', admin_controller_1.getHealth);
// All other routes require authentication + admin role
router.use(auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin'));
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