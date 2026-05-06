import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
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
  createAdmin,
  signupSuperAdmin,
} from './admin.controller';
import { createAdminSchema } from './admin.schema';

const router: import('express').Router = Router();

// ── Public ───────────────────────────────────────────────────────────────────

// Health check
router.get('/health', getHealth);

// One-time super_admin signup — no token needed.
// Automatically returns 409 once a super_admin already exists.
router.post('/signup', validate(createAdminSchema), signupSuperAdmin);

// ── super_admin only ─────────────────────────────────────────────────────────
router.post(
  '/create-admin',
  authenticate,
  requireRole('super_admin'),
  validate(createAdminSchema),
  createAdmin,
);

// ── admin + super_admin ──────────────────────────────────────────────────────
router.use(authenticate, requireRole('admin', 'super_admin'));

router.get('/dashboard', getDashboard);
router.get('/platform-stats', getPlatformStats);
router.get('/health/detailed', getDetailedHealth);
router.get('/restaurants', getRestaurants);
router.patch('/restaurants/:id/status', updateRestaurantStatus);
router.get('/customers', getCustomers);
router.patch('/customers/:id/status', updateCustomerStatus);
router.get('/feedback', getFeedback);

export default router;
