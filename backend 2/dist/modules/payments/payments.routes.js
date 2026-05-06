"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const payments_schema_1 = require("./payments.schema");
const payments_controller_1 = require("./payments.controller");
const router = (0, express_1.Router)();
// ─── Public Webhook (no auth — gateway calls this) ────────────────────────────
// NOTE: Must use express.raw() middleware on this route for signature verification
// TODO: Add gateway signature verification middleware before handler
router.post('/webhook', (0, validate_middleware_1.validate)({ body: payments_schema_1.webhookSchema }), payments_controller_1.handleGatewayWebhookController);
// ─── Protected Payment Routes ─────────────────────────────────────────────────
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant);
// POST /payments/initiate — cashier or customer
router.post('/initiate', (0, rbac_middleware_1.requireRole)('cashier', 'customer', 'manager', 'owner'), (0, validate_middleware_1.validate)({ body: payments_schema_1.initiateSchema }), payments_controller_1.handleInitiatePayment);
// POST /payments/verify — webhook + manual verification
router.post('/verify', (0, rbac_middleware_1.requireRole)('cashier', 'manager', 'owner'), (0, validate_middleware_1.validate)({ body: payments_schema_1.verifySchema }), payments_controller_1.handleVerifyPayment);
// POST /payments/upi/generate-qr — cashier or customer
router.post('/upi/generate-qr', (0, rbac_middleware_1.requireRole)('cashier', 'customer', 'manager', 'owner'), (0, validate_middleware_1.validate)({ body: payments_schema_1.upiQRSchema }), payments_controller_1.handleGenerateUPIQR);
// GET /payments/upi/status/:ref — cashier or customer — poll for status
router.get('/upi/status/:ref', (0, rbac_middleware_1.requireRole)('cashier', 'customer', 'manager', 'owner'), payments_controller_1.handlePollUPIStatus);
// POST /payments/split — cashier — split bill
router.post('/split', (0, rbac_middleware_1.requireRole)('cashier', 'manager', 'owner'), (0, validate_middleware_1.validate)({ body: payments_schema_1.splitSchema }), payments_controller_1.handleSplitBill);
// GET /payments/receipt/:orderId — customer, cashier
router.get('/receipt/:orderId', (0, rbac_middleware_1.requireRole)('customer', 'cashier', 'manager', 'owner', 'waiter'), payments_controller_1.handleGetReceipt);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map