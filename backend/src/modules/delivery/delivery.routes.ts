import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  handleAssignDelivery,
  handleGetDelivery,
  handleUpdateDeliveryStatus,
  handleUpdateLocation,
  handleGetActiveDelivery,
  handleGetEarnings,
} from './delivery.controller';

const router: import('express').Router = Router();

router.use(authenticate);

// POST /delivery/orders/:orderId/assign — internal/manager
router.post(
  '/orders/:orderId/assign',
  injectTenant,
  requireRole('manager', 'owner'),
  handleAssignDelivery
);

// GET /delivery/partner/active — delivery partner's active delivery
router.get(
  '/partner/active',
  requireRole('delivery_partner'),
  handleGetActiveDelivery
);

// GET /delivery/partner/earnings — delivery partner earnings
router.get(
  '/partner/earnings',
  requireRole('delivery_partner'),
  handleGetEarnings
);

// POST /delivery/location — GPS update (throttled server-side)
router.post(
  '/location',
  requireRole('delivery_partner'),
  validate({
    body: z.object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
      delivery_id: z.string().uuid().optional(),
    }),
  }),
  handleUpdateLocation
);

// GET /delivery/:id — delivery partner views their delivery
router.get('/:id', requireRole('delivery_partner', 'manager', 'owner'), handleGetDelivery);

// PATCH /delivery/:id/status — delivery partner updates status
router.patch(
  '/:id/status',
  requireRole('delivery_partner'),
  validate({
    body: z.object({
      status: z.enum(['accepted', 'rejected', 'picked_up', 'delivered', 'failed']),
    }),
  }),
  handleUpdateDeliveryStatus
);

export default router;
