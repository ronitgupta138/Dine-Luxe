import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import {
  getMenuSuggestions,
  getDemandForecast,
  getBundleOpportunities,
  getStaffingRecommendation,
} from './analytics.controller';

const router: import('express').Router = Router();

router.use(authenticate, injectTenant, requireRole('owner', 'manager'));

router.get('/menu-suggestions/:branchId', getMenuSuggestions);
router.get('/demand-forecast/:branchId', getDemandForecast);
router.get('/bundle-opportunities/:branchId', getBundleOpportunities);
router.get('/staffing-recommendation/:branchId', getStaffingRecommendation);

export default router;
