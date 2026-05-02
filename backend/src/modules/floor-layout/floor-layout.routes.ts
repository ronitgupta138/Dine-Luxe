import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as ctrl from './floor-layout.controller';

const router: import('express').Router = Router();

// GET /floor-layout/branch/:branchId — owner/manager — get current layout (active or draft)
router.get('/branch/:branchId', authenticate, requireRole('manager', 'owner'), ctrl.getLayout);

// POST /floor-layout/branch/:branchId — save draft
router.post('/branch/:branchId', authenticate, requireRole('manager', 'owner'), ctrl.saveDraft);

// POST /floor-layout/branch/:branchId/publish — make draft live
router.post('/branch/:branchId/publish', authenticate, requireRole('manager', 'owner'), ctrl.publishLayout);

// GET /floor-layout/branch/:branchId/live — all staff — live layout + table statuses
router.get('/branch/:branchId/live', authenticate, ctrl.getLiveLayout);

export default router;
