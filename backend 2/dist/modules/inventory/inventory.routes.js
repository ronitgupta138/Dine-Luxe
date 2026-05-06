"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const inventory_controller_1 = require("./inventory.controller");
const inventory_schema_1 = require("./inventory.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant);
// GET /inventory/branch/:branchId
router.get('/branch/:branchId', (0, rbac_middleware_1.requireRole)('manager', 'owner'), inventory_controller_1.getInventory);
// PATCH /inventory/:id
router.patch('/:id', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)(inventory_schema_1.updateInventorySchema), inventory_controller_1.updateInventory);
// POST /inventory/deduct — internal, called by orders service
router.post('/deduct', (0, validate_middleware_1.validate)(inventory_schema_1.deductInventorySchema), inventory_controller_1.deductInventory);
// POST /inventory/waste-log
router.post('/waste-log', (0, rbac_middleware_1.requireRole)('manager', 'staff'), (0, validate_middleware_1.validate)(inventory_schema_1.wasteLogSchema), inventory_controller_1.wasteLog);
// GET /inventory/branch/:branchId/alerts
router.get('/branch/:branchId/alerts', (0, rbac_middleware_1.requireRole)('manager', 'owner'), inventory_controller_1.getAlerts);
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map