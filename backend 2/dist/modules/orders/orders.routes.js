"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const orders_schema_1 = require("./orders.schema");
const orders_controller_1 = require("./orders.controller");
const router = (0, express_1.Router)();
// All order routes require authentication + tenant injection
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant);
// POST /orders — waiter or customer via QR
router.post('/', (0, rbac_middleware_1.requireRole)('waiter', 'customer', 'manager', 'owner', 'cashier'), (0, validate_middleware_1.validate)({ body: orders_schema_1.createOrderSchema }), orders_controller_1.handleCreateOrder);
// GET /orders/:id — any authenticated user
router.get('/:id', orders_controller_1.handleGetOrder);
// GET /orders/table/:tableId — waiter/cashier — active orders for table
router.get('/table/:tableId', (0, rbac_middleware_1.requireRole)('waiter', 'cashier', 'manager', 'owner'), orders_controller_1.handleGetOrdersByTable);
// GET /orders/branch/:branchId/active — manager/cashier
router.get('/branch/:branchId/active', (0, rbac_middleware_1.requireRole)('manager', 'owner', 'cashier'), orders_controller_1.handleGetActiveBranchOrders);
// PATCH /orders/:id/cancel — manager/owner only
router.patch('/:id/cancel', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: orders_schema_1.cancelOrderSchema }), orders_controller_1.handleCancelOrder);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map