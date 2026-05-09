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
import { exportReportSchema, salesReportQuerySchema } from './reports.schema';

const router: import('express').Router = Router();

router.use(authenticate);

router.get('/sales', injectTenant, requireRole('owner', 'manager'), validate({ query: salesReportQuerySchema }), getSales);
router.get('/menu-performance', injectTenant, requireRole('owner', 'manager'), getMenuPerformance);
router.get('/kitchen-performance', injectTenant, requireRole('owner', 'manager'), getKitchenPerformance);
router.get('/customer-insights', injectTenant, requireRole('owner'), getCustomerInsights);
router.get('/admin/platform', requireRole('admin', 'super_admin'), getAdminPlatform);
router.get('/admin/trends', requireRole('admin', 'super_admin'), getAdminTrends);
router.post('/export', injectTenant, requireRole('owner', 'admin'), validate(exportReportSchema), exportReport);

export default router;
