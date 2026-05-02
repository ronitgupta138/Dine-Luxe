import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTableSchema, updateStatusSchema, mergeSchema } from './tables.schema';
import * as ctrl from './tables.controller';

const router: import('express').Router = Router();

// GET /tables/branch/:branchId — all authenticated staff
router.get('/branch/:branchId', authenticate, ctrl.getTablesByBranch);

// POST /tables — manager or owner only
router.post('/', authenticate, requireRole('manager', 'owner'), validate({ body: createTableSchema }), ctrl.createTable);

// PATCH /tables/:id/status — host, manager, waiter
router.patch('/:id/status', authenticate, requireRole('host', 'manager', 'owner', 'waiter', 'cashier'), validate({ body: updateStatusSchema }), ctrl.updateStatus);

// PATCH /tables/:id/merge — manager only
router.patch('/:id/merge', authenticate, requireRole('manager', 'owner'), validate({ body: mergeSchema }), ctrl.mergeTables);

// DELETE /tables/:id — manager or owner
router.delete('/:id', authenticate, requireRole('manager', 'owner'), ctrl.deleteTable);

export default router;
