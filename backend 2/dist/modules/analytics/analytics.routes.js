"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const analytics_controller_1 = require("./analytics.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant, (0, rbac_middleware_1.requireRole)('owner', 'manager'));
router.get('/menu-suggestions/:branchId', analytics_controller_1.getMenuSuggestions);
router.get('/demand-forecast/:branchId', analytics_controller_1.getDemandForecast);
router.get('/bundle-opportunities/:branchId', analytics_controller_1.getBundleOpportunities);
router.get('/staffing-recommendation/:branchId', analytics_controller_1.getStaffingRecommendation);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map