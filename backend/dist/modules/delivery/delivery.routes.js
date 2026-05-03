"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const delivery_controller_1 = require("./delivery.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// POST /delivery/orders/:orderId/assign — internal/manager
router.post('/orders/:orderId/assign', tenant_middleware_1.injectTenant, (0, rbac_middleware_1.requireRole)('manager', 'owner'), delivery_controller_1.handleAssignDelivery);
// GET /delivery/partner/active — delivery partner's active delivery
router.get('/partner/active', (0, rbac_middleware_1.requireRole)('delivery_partner'), delivery_controller_1.handleGetActiveDelivery);
// GET /delivery/partner/earnings — delivery partner earnings
router.get('/partner/earnings', (0, rbac_middleware_1.requireRole)('delivery_partner'), delivery_controller_1.handleGetEarnings);
// POST /delivery/location — GPS update (throttled server-side)
router.post('/location', (0, rbac_middleware_1.requireRole)('delivery_partner'), (0, validate_middleware_1.validate)({
    body: zod_1.z.object({
        lat: zod_1.z.number().min(-90).max(90),
        lon: zod_1.z.number().min(-180).max(180),
        delivery_id: zod_1.z.string().uuid().optional(),
    }),
}), delivery_controller_1.handleUpdateLocation);
// GET /delivery/:id — delivery partner views their delivery
router.get('/:id', (0, rbac_middleware_1.requireRole)('delivery_partner', 'manager', 'owner'), delivery_controller_1.handleGetDelivery);
// PATCH /delivery/:id/status — delivery partner updates status
router.patch('/:id/status', (0, rbac_middleware_1.requireRole)('delivery_partner'), (0, validate_middleware_1.validate)({
    body: zod_1.z.object({
        status: zod_1.z.enum(['accepted', 'rejected', 'picked_up', 'delivered', 'failed']),
    }),
}), delivery_controller_1.handleUpdateDeliveryStatus);
exports.default = router;
//# sourceMappingURL=delivery.routes.js.map