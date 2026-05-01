import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createStaffSchema, updateStaffSchema } from './staff.schema';
import * as ctrl from './staff.controller';

const router = Router();

// All routes: authenticated + tenant injected
router.use(authenticate, injectTenant);

router.get('/branch/:branchId', requireRole('manager', 'owner', 'admin'), ctrl.getByBranch);
router.post('/create', requireRole('manager', 'owner'), validate(createStaffSchema), ctrl.create);

router.get('/:id', requireRole('manager', 'owner', 'admin'), ctrl.getById);
router.patch('/:id', requireRole('manager', 'owner'), validate(updateStaffSchema), ctrl.update);
router.patch('/:id/toggle-access', requireRole('manager', 'owner'), ctrl.toggleAccess);
router.get('/:id/performance', requireRole('manager', 'owner', 'admin'), ctrl.getPerformance);

export default router;
