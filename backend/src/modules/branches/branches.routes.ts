import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createBranchSchema,
  updateBranchSchema,
  updateBranchStatusSchema,
} from './branches.schema';
import * as ctrl from './branches.controller';

const router: import('express').Router = Router();

// All branch routes require auth + tenant injection
router.use(authenticate, injectTenant);

router.get('/', requireRole('owner', 'admin'), ctrl.getAll);
router.post('/', requireRole('owner'), validate(createBranchSchema), ctrl.create);

router.get('/:id', requireRole('owner', 'manager', 'admin'), ctrl.getById);
router.patch('/:id', requireRole('owner', 'manager'), validate(updateBranchSchema), ctrl.update);
router.patch(
  '/:id/status',
  requireRole('owner'),
  validate(updateBranchStatusSchema),
  ctrl.toggleStatus
);
router.get(
  '/:id/live-stats',
  requireRole('owner', 'manager', 'admin'),
  ctrl.getLiveStats
);

export default router;
