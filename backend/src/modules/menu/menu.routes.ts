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

const router = Router();

// ─── Public Routes (no auth) ──────────────────────────────────────────────────

// GET /menu/branch/:branchId — public, cached
router.get('/branch/:branchId', handleGetPublicMenu);

// GET /menu/items/:id — public
router.get('/items/:id', handleGetItem);

// ─── Protected Routes ─────────────────────────────────────────────────────────

router.use(authenticate, injectTenant);

// GET /menu/branch/:branchId/categories — owner/manager
router.get(
  '/branch/:branchId/categories',
  requireRole('manager', 'owner'),
  handleGetCategories
);

// Category CRUD
router.post(
  '/categories',
  requireRole('manager', 'owner'),
  validate({ body: createCategorySchema }),
  handleCreateCategory
);

router.patch(
  '/categories/reorder',
  requireRole('manager', 'owner'),
  validate({ body: reorderCategoriesSchema }),
  handleReorderCategories
);

router.patch(
  '/categories/:id',
  requireRole('manager', 'owner'),
  validate({ body: updateCategorySchema }),
  handleUpdateCategory
);

router.delete(
  '/categories/:id',
  requireRole('manager', 'owner'),
  handleDeleteCategory
);

// Item CRUD
router.post(
  '/items',
  requireRole('manager', 'owner'),
  validate({ body: createItemSchema }),
  handleCreateItem
);

router.patch(
  '/items/bulk-price-update',
  requireRole('manager', 'owner'),
  validate({ body: bulkUpdateSchema }),
  handleBulkPriceUpdate
);

router.patch(
  '/items/:id/status',
  requireRole('manager', 'owner'),
  validate({ body: updateItemStatusSchema }),
  handleUpdateItemStatus
);

router.patch(
  '/items/:id',
  requireRole('manager', 'owner'),
  validate({ body: updateItemSchema }),
  handleUpdateItem
);

router.delete(
  '/items/:id',
  requireRole('manager', 'owner'),
  handleDeleteItem
);

export default router;
