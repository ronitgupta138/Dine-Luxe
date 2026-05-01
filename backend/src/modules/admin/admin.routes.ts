import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import {
  getDashboard,
  getPlatformStats,
  getHealth,
  getDetailedHealth,
  getRestaurants,
  updateRestaurantStatus,
  getCustomers,
  updateCustomerStatus,
  getFeedback,
} from './admin.controller';

const router = Router();

// Public health check
router.get('/health', getHealth);

// All other routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', getDashboard);
router.get('/platform-stats', getPlatformStats);
router.get('/health/detailed', getDetailedHealth);
router.get('/restaurants', getRestaurants);
router.patch('/restaurants/:id/status', updateRestaurantStatus);
router.get('/customers', getCustomers);
router.patch('/customers/:id/status', updateCustomerStatus);
router.get('/feedback', getFeedback);

export default router;
