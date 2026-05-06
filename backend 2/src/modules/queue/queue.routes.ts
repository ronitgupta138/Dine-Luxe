import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as ctrl from './queue.controller';

const router: import('express').Router = Router();

// POST /queue/join
// FIX: unauthenticated walk-ins need to join too; auth is optional here.
// If a JWT is present it will be used to attach user_id, otherwise null.
router.post('/join', ctrl.joinQueue);

// GET /queue/branch/:branchId — host/manager view the full queue
router.get(
  '/branch/:branchId',
  authenticate,
  requireRole('host', 'manager', 'owner'),
  ctrl.getBranchQueue,
);

// GET /queue/position/:id — customer polling their own position OR staff
router.get('/position/:id', authenticate, ctrl.getQueuePosition);

// PATCH /queue/:id/arrive — customer self-check-in OR staff marking
// FIX: waiter role added — waiters also escort guests and need to mark arrival
router.patch(
  '/:id/arrive',
  authenticate,
  requireRole('host', 'manager', 'owner', 'waiter', 'customer'),
  ctrl.markArrived,
);

// PATCH /queue/:id/assign-table — host / manager
router.patch(
  '/:id/assign-table',
  authenticate,
  requireRole('host', 'manager', 'owner'),
  ctrl.assignTable,
);

// PATCH /queue/:id/no-show — host / manager
router.patch(
  '/:id/no-show',
  authenticate,
  requireRole('host', 'manager', 'owner'),
  ctrl.markNoShow,
);

// DELETE /queue/:id — soft-delete (sets status=removed); host/manager/owner
// FIX: route kept as DELETE for REST semantics, but service now does a soft delete
router.delete(
  '/:id',
  authenticate,
  requireRole('host', 'manager', 'owner'),
  ctrl.removeFromQueue,
);

export default router;