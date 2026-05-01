import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrderSchema, cancelOrderSchema } from './orders.schema';
import {
  handleCreateOrder,
  handleGetOrder,
  handleGetOrdersByTable,
  handleGetActiveBranchOrders,
  handleCancelOrder,
} from './orders.controller';

const router = Router();

// All order routes require authentication + tenant injection
router.use(authenticate, injectTenant);

// POST /orders — waiter or customer via QR
router.post(
  '/',
  requireRole('waiter', 'customer', 'manager', 'owner', 'cashier'),
  validate({ body: createOrderSchema }),
  handleCreateOrder
);

// GET /orders/:id — any authenticated user
router.get('/:id', handleGetOrder);

// GET /orders/table/:tableId — waiter/cashier — active orders for table
router.get(
  '/table/:tableId',
  requireRole('waiter', 'cashier', 'manager', 'owner'),
  handleGetOrdersByTable
);

// GET /orders/branch/:branchId/active — manager/cashier
router.get(
  '/branch/:branchId/active',
  requireRole('manager', 'owner', 'cashier'),
  handleGetActiveBranchOrders
);

// PATCH /orders/:id/cancel — manager/owner only
router.patch(
  '/:id/cancel',
  requireRole('manager', 'owner'),
  validate({ body: cancelOrderSchema }),
  handleCancelOrder
);

export default router;
