import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './users.schema';
import * as ctrl from './users.controller';

const router = Router();

// Public
router.get('/check-email', ctrl.checkEmail);

// Authenticated
router.get('/me', authenticate, ctrl.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), ctrl.updateMe);

// Manager / Owner / Admin only
router.get('/:id', authenticate, requireRole('manager', 'owner', 'admin'), ctrl.getUserById);

export default router;
