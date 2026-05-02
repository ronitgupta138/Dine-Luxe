import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  getSales,
  getMenuPerformance,
  getKitchenPerformance,
  getCustomerInsights,
  getAdminPlatform,
  getAdminTrends,
  exportReport,
} from './reports.controller';
import { exportReportSchema } from './reports.schema';

const router: import('express').Router = Router();

router.use(authenticate, injectTenant);

router.get('/sales', requireRole('owner', 'manager'), getSales);
router.get('/menu-performance', requireRole('owner', 'manager'), getMenuPerformance);
router.get('/kitchen-performance', requireRole('owner', 'manager'), getKitchenPerformance);
router.get('/customer-insights', requireRole('owner'), getCustomerInsights);
router.get('/admin/platform', requireRole('admin'), getAdminPlatform);
router.get('/admin/trends', requireRole('admin'), getAdminTrends);
router.post('/export', requireRole('owner', 'admin'), validate(exportReportSchema), exportReport);

export default router;
