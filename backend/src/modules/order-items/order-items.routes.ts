import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  handleGetOrderItems,
  handleServeItem,
  handleUpdateItemStatus,
} from './order-items.controller';

const router = Router();

router.use(authenticate, injectTenant);

// GET /order-items/order/:orderId — waiter/cashier
router.get(
  '/order/:orderId',
  requireRole('waiter', 'cashier', 'manager', 'owner'),
  handleGetOrderItems
);

// PATCH /order-items/:id/serve — waiter marks individual item as served
router.patch(
  '/:id/serve',
  requireRole('waiter', 'manager', 'owner'),
  handleServeItem
);

// PATCH /order-items/:id/status — internal use (kitchen/system)
router.patch(
  '/:id/status',
  requireRole('chef', 'manager', 'owner', 'waiter'),
  validate({
    body: z.object({
      status: z.enum(['pending', 'preparing', 'ready', 'served', 'cancelled']),
    }),
  }),
  handleUpdateItemStatus
);

export default router;
