import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './users.schema';
import * as ctrl from './users.controller';

const router: import('express').Router = Router();

// Public
router.get('/check-email', ctrl.checkEmail);

// Authenticated
router.get('/me', authenticate, ctrl.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), ctrl.updateMe);

// Manager / Owner / Admin only
// BUG FIX: injectTenant added so restaurantId is always on req and the
// getUserById controller doesn't need a fragile JWT fallback.
router.get('/:id', authenticate, injectTenant, requireRole('manager', 'owner', 'admin'), ctrl.getUserById);

export default router;
