import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  getInventory,
  createInventory,
  updateInventory,
  deductInventory,
  wasteLog,
  getAlerts,
} from './inventory.controller';
import { createInventorySchema, updateInventorySchema, deductInventorySchema, wasteLogSchema } from './inventory.schema';

const router: import('express').Router = Router();

router.use(authenticate, injectTenant);

// POST /inventory
router.post(
  '/',
  requireRole('manager', 'owner'),
  validate(createInventorySchema),
  createInventory
);

// GET /inventory/branch/:branchId
router.get(
  '/branch/:branchId',
  requireRole('manager', 'owner'),
  getInventory
);

// PATCH /inventory/:id
router.patch(
  '/:id',
  requireRole('manager', 'owner'),
  validate(updateInventorySchema),
  updateInventory
);

// POST /inventory/deduct — internal, called by orders service
router.post(
  '/deduct',
  requireRole('manager', 'owner'),
  validate(deductInventorySchema),
  deductInventory
);

// POST /inventory/waste-log
router.post(
  '/waste-log',
  requireRole('manager', 'owner'),
  validate(wasteLogSchema),
  wasteLog
);

// GET /inventory/branch/:branchId/alerts
router.get(
  '/branch/:branchId/alerts',
  requireRole('manager', 'owner'),
  getAlerts
);

export default router;
