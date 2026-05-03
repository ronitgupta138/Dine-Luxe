"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const order_items_controller_1 = require("./order-items.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant);
// GET /order-items/order/:orderId — waiter/cashier
router.get('/order/:orderId', (0, rbac_middleware_1.requireRole)('waiter', 'cashier', 'manager', 'owner'), order_items_controller_1.handleGetOrderItems);
// PATCH /order-items/:id/serve — waiter marks individual item as served
router.patch('/:id/serve', (0, rbac_middleware_1.requireRole)('waiter', 'manager', 'owner'), order_items_controller_1.handleServeItem);
// PATCH /order-items/:id/status — internal use (kitchen/system)
router.patch('/:id/status', (0, rbac_middleware_1.requireRole)('chef', 'manager', 'owner', 'waiter'), (0, validate_middleware_1.validate)({
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'preparing', 'ready', 'served', 'cancelled']),
    }),
}), order_items_controller_1.handleUpdateItemStatus);
exports.default = router;
//# sourceMappingURL=order-items.routes.js.map