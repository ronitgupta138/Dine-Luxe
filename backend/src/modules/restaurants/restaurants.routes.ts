import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, updateRestaurantSchema, updateStatusSchema } from './restaurants.schema';
import * as ctrl from './restaurants.controller';

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.post('/register', validate(registerSchema), ctrl.register);
router.get('/nearby', ctrl.getNearby);
router.get('/:id', ctrl.getById);
router.get('/:id/live-status', ctrl.getLiveStatus);

// ── Owner — manage own restaurant ────────────────────────────────────────────
router.patch(
  '/:id',
  authenticate,
  injectTenant,
  requireRole('owner'),
  validate(updateRestaurantSchema),
  ctrl.update
);

// ── Admin only ───────────────────────────────────────────────────────────────
router.get('/', authenticate, requireRole('admin'), ctrl.getAll);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  validate(updateStatusSchema),
  ctrl.updateStatus
);

export default router;
