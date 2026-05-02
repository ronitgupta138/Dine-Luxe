import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  createItemSchema,
  updateItemSchema,
  updateItemStatusSchema,
  bulkUpdateSchema,
} from './menu.schema';
import {
  handleGetPublicMenu,
  handleGetCategories,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleReorderCategories,
  handleCreateItem,
  handleGetItem,
  handleUpdateItem,
  handleDeleteItem,
  handleUpdateItemStatus,
  handleBulkPriceUpdate,
} from './menu.controller';

const router: import('express').Router = Router();

// ─── Public Routes (no auth) ──────────────────────────────────────────────────

// GET /menu/branch/:branchId — public, cached full menu
router.get('/branch/:branchId', handleGetPublicMenu);

// GET /menu/items/:id — public single item lookup
// FIX: must be declared BEFORE the protected router.use() block so it stays public
router.get('/items/:id', handleGetItem);

// ─── Protected Routes ─────────────────────────────────────────────────────────

router.use(authenticate, injectTenant);

// GET /menu/branch/:branchId/categories — manager/owner (admin category view)
router.get(
  '/branch/:branchId/categories',
  requireRole('manager', 'owner'),
  handleGetCategories,
);

// ── Category CRUD ────────────────────────────────────────────────────────────

router.post(
  '/categories',
  requireRole('manager', 'owner'),
  validate({ body: createCategorySchema }),
  handleCreateCategory,
);

// FIX: /categories/reorder MUST come before /categories/:id so Express doesn't
// treat 'reorder' as a category :id param — static segments beat params.
router.patch(
  '/categories/reorder',
  requireRole('manager', 'owner'),
  validate({ body: reorderCategoriesSchema }),
  handleReorderCategories,
);

router.patch(
  '/categories/:id',
  requireRole('manager', 'owner'),
  validate({ body: updateCategorySchema }),
  handleUpdateCategory,
);

router.delete(
  '/categories/:id',
  requireRole('manager', 'owner'),
  handleDeleteCategory,
);

// ── Item CRUD ────────────────────────────────────────────────────────────────

router.post(
  '/items',
  requireRole('manager', 'owner'),
  validate({ body: createItemSchema }),
  handleCreateItem,
);

// FIX: /items/bulk-price-update MUST come before /items/:id for the same reason
// as the categories/reorder fix above — 'bulk-price-update' would otherwise be
// parsed as item :id, leading to a confusing 404 / wrong handler.
router.patch(
  '/items/bulk-price-update',
  requireRole('manager', 'owner'),
  validate({ body: bulkUpdateSchema }),
  handleBulkPriceUpdate,
);

router.patch(
  '/items/:id/status',
  requireRole('manager', 'owner'),
  validate({ body: updateItemStatusSchema }),
  handleUpdateItemStatus,
);

router.patch(
  '/items/:id',
  requireRole('manager', 'owner'),
  validate({ body: updateItemSchema }),
  handleUpdateItem,
);

router.delete(
  '/items/:id',
  requireRole('manager', 'owner'),
  handleDeleteItem,
);

export default router;