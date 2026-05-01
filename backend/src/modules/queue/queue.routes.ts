import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as ctrl from './queue.controller';

const router = Router();

// POST /queue/join — customer or host
router.post('/join', authenticate, ctrl.joinQueue);

// GET /queue/branch/:branchId — host/manager
router.get('/branch/:branchId', authenticate, requireRole('host', 'manager', 'owner'), ctrl.getBranchQueue);

// GET /queue/position/:id — customer (their own) or staff
router.get('/position/:id', authenticate, ctrl.getQueuePosition);

// PATCH /queue/:id/arrive — host or customer
router.patch('/:id/arrive', authenticate, ctrl.markArrived);

// PATCH /queue/:id/assign-table — host only
router.patch('/:id/assign-table', authenticate, requireRole('host', 'manager'), ctrl.assignTable);

// PATCH /queue/:id/no-show — host only
router.patch('/:id/no-show', authenticate, requireRole('host', 'manager'), ctrl.markNoShow);

// DELETE /queue/:id — host/manager
router.delete('/:id', authenticate, requireRole('host', 'manager', 'owner'), ctrl.removeFromQueue);

export default router;
