import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  initiateSchema,
  verifySchema,
  splitSchema,
  upiQRSchema,
  webhookSchema,
} from './payments.schema';
import {
  handleInitiatePayment,
  handleVerifyPayment,
  handleGenerateUPIQR,
  handlePollUPIStatus,
  handleSplitBill,
  handleGetReceipt,
  handleGatewayWebhookController,
} from './payments.controller';

const router: import('express').Router = Router();

// ─── Public Webhook (no auth — gateway calls this) ────────────────────────────
// NOTE: Must use express.raw() middleware on this route for signature verification
// TODO: Add gateway signature verification middleware before handler
router.post('/webhook', validate({ body: webhookSchema }), handleGatewayWebhookController);

// ─── Protected Payment Routes ─────────────────────────────────────────────────

router.use(authenticate, injectTenant);

// POST /payments/initiate — cashier or customer
router.post(
  '/initiate',
  requireRole('cashier', 'customer', 'manager', 'owner'),
  validate({ body: initiateSchema }),
  handleInitiatePayment
);

// POST /payments/verify — webhook + manual verification
router.post(
  '/verify',
  requireRole('cashier', 'manager', 'owner'),
  validate({ body: verifySchema }),
  handleVerifyPayment
);

// POST /payments/upi/generate-qr — cashier or customer
router.post(
  '/upi/generate-qr',
  requireRole('cashier', 'customer', 'manager', 'owner'),
  validate({ body: upiQRSchema }),
  handleGenerateUPIQR
);

// GET /payments/upi/status/:ref — cashier or customer — poll for status
router.get(
  '/upi/status/:ref',
  requireRole('cashier', 'customer', 'manager', 'owner'),
  handlePollUPIStatus
);

// POST /payments/split — cashier — split bill
router.post(
  '/split',
  requireRole('cashier', 'manager', 'owner'),
  validate({ body: splitSchema }),
  handleSplitBill
);

// GET /payments/receipt/:orderId — customer, cashier
router.get(
  '/receipt/:orderId',
  requireRole('customer', 'cashier', 'manager', 'owner', 'waiter'),
  handleGetReceipt
);

export default router;
