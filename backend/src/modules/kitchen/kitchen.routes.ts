import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as ctrl from './kitchen.controller';

const router: import('express').Router = Router();

// GET /kitchen/branch/:branchId/tickets — chef: active KDS orders
router.get('/branch/:branchId/tickets', authenticate, requireRole('chef'), ctrl.getTickets);

// PATCH /kitchen/orders/:id/status — chef ONLY — forward transitions
router.patch('/orders/:id/status', authenticate, requireRole('chef'), ctrl.updateOrderStatus);

// GET /kitchen/branch/:branchId/overdue — manager: overdue orders
router.get('/branch/:branchId/overdue', authenticate, requireRole('manager', 'owner'), ctrl.getOverdueOrders);

export default router;
