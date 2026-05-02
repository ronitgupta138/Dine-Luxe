import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTableSchema, updateStatusSchema, mergeSchema } from './tables.schema';
import * as ctrl from './tables.controller';

const router: import('express').Router = Router();

// GET /tables/branch/:branchId — any authenticated staff (including chef, for KDS context)
// FIX: chef added — they need table info to correlate with orders on the KDS
router.get(
  '/branch/:branchId',
  authenticate,
  requireRole('host', 'manager', 'owner', 'waiter', 'chef', 'cashier'),
  ctrl.getTablesByBranch,
);

// POST /tables — manager or owner only
router.post(
  '/',
  authenticate,
  requireRole('manager', 'owner'),
  validate({ body: createTableSchema }),
  ctrl.createTable,
);

// PATCH /tables/:id/status — host, manager, owner, waiter (NOT cashier)
// FIX: cashier was included but cashiers process payments — they don't manage table
// occupancy state. Removed to follow least-privilege principle.
router.patch(
  '/:id/status',
  authenticate,
  requireRole('host', 'manager', 'owner', 'waiter'),
  validate({ body: updateStatusSchema }),
  ctrl.updateStatus,
);

// POST /tables/merge — manager or owner
// FIX: was PATCH /:id/merge — the :id param was never used (both table IDs come
// from the request body via mergeSchema). Changed to POST /merge which is more
// accurate (creating a new merged entity, not patching an existing table).
// Note: this route must be declared BEFORE /:id routes to avoid param collision.
router.post(
  '/merge',
  authenticate,
  requireRole('manager', 'owner', 'host'),
  validate({ body: mergeSchema }),
  ctrl.mergeTables,
);

// DELETE /tables/:id — manager or owner
router.delete(
  '/:id',
  authenticate,
  requireRole('manager', 'owner'),
  ctrl.deleteTable,
);

export default router;