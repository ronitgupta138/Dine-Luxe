import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as ctrl from './kitchen.controller';

const router: import('express').Router = Router();

// GET /kitchen/branch/:branchId/tickets
// Active KDS orders — chef needs this to cook; manager/owner need it for oversight
// FIX: was chef-only; manager and owner added so they can monitor the KDS remotely
router.get(
  '/branch/:branchId/tickets',
  authenticate,
  requireRole('chef', 'manager', 'owner'),
  ctrl.getTickets,
);

// PATCH /kitchen/orders/:id/status
// Chef-ONLY forward transitions (confirmed → preparing → ready)
router.patch(
  '/orders/:id/status',
  authenticate,
  requireRole('chef'),
  ctrl.updateOrderStatus,
);

// GET /kitchen/branch/:branchId/overdue
// FIX: chef added — they need to see overdue orders to know what to prioritise
// Manager/owner already had access for their oversight role
router.get(
  '/branch/:branchId/overdue',
  authenticate,
  requireRole('chef', 'manager', 'owner'),
  ctrl.getOverdueOrders,
);

export default router;