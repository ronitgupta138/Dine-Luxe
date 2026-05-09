import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTableSchema, updateStatusSchema, mergeSchema } from './tables.schema';
import * as ctrl from './tables.controller';

const router: import('express').Router = Router();

// GET /tables/branch/:branchId — any authenticated staff
router.get(
  '/branch/:branchId',
  authenticate,
  requireRole('host', 'manager', 'owner', 'waiter', 'chef', 'cashier'),
  ctrl.getTablesByBranch,
);

// POST /tables/merge — must be BEFORE /:id routes to prevent param collision
// BUG FIX: validate({ body: mergeSchema }) was passing a plain object not a
// ZodSchema — validate middleware calls schema.safeParse() which doesn't exist
// on a plain object. Fixed to pass schema directly: validate(mergeSchema).
router.post(
  '/merge',
  authenticate,
  requireRole('manager', 'owner', 'host'),
  validate(mergeSchema),
  ctrl.mergeTables,
);

// POST /tables — manager or owner only
// BUG FIX: same validate wrapping issue fixed here too.
router.post(
  '/',
  authenticate,
  requireRole('manager', 'owner'),
  validate(createTableSchema),
  ctrl.createTable,
);

// PATCH /tables/:id/status
// BUG FIX: same validate wrapping issue fixed here too.
router.patch(
  '/:id/status',
  authenticate,
  requireRole('host', 'manager', 'owner', 'waiter'),
  validate(updateStatusSchema),
  ctrl.updateStatus,
);

// DELETE /tables/:id — manager or owner
router.delete(
  '/:id',
  authenticate,
  requireRole('manager', 'owner'),
  ctrl.deleteTable,
);

export default router;