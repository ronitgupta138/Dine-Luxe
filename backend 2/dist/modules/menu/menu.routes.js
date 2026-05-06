"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const tenant_middleware_1 = require("../../middleware/tenant.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const menu_schema_1 = require("./menu.schema");
const menu_controller_1 = require("./menu.controller");
const router = (0, express_1.Router)();
// ─── Public Routes (no auth) ──────────────────────────────────────────────────
// GET /menu/branch/:branchId — public, cached full menu
router.get('/branch/:branchId', menu_controller_1.handleGetPublicMenu);
// GET /menu/items/:id — public single item lookup
// FIX: must be declared BEFORE the protected router.use() block so it stays public
router.get('/items/:id', menu_controller_1.handleGetItem);
// ─── Protected Routes ─────────────────────────────────────────────────────────
router.use(auth_middleware_1.authenticate, tenant_middleware_1.injectTenant);
// GET /menu/branch/:branchId/categories — manager/owner (admin category view)
router.get('/branch/:branchId/categories', (0, rbac_middleware_1.requireRole)('manager', 'owner'), menu_controller_1.handleGetCategories);
// ── Category CRUD ────────────────────────────────────────────────────────────
router.post('/categories', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: menu_schema_1.createCategorySchema }), menu_controller_1.handleCreateCategory);
// FIX: /categories/reorder MUST come before /categories/:id so Express doesn't
// treat 'reorder' as a category :id param — static segments beat params.
router.patch('/categories/reorder', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: menu_schema_1.reorderCategoriesSchema }), menu_controller_1.handleReorderCategories);
router.patch('/categories/:id', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: menu_schema_1.updateCategorySchema }), menu_controller_1.handleUpdateCategory);
router.delete('/categories/:id', (0, rbac_middleware_1.requireRole)('manager', 'owner'), menu_controller_1.handleDeleteCategory);
// ── Item CRUD ────────────────────────────────────────────────────────────────
router.post('/items', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: menu_schema_1.createItemSchema }), menu_controller_1.handleCreateItem);
// FIX: /items/bulk-price-update MUST come before /items/:id for the same reason
// as the categories/reorder fix above — 'bulk-price-update' would otherwise be
// parsed as item :id, leading to a confusing 404 / wrong handler.
router.patch('/items/bulk-price-update', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: menu_schema_1.bulkUpdateSchema }), menu_controller_1.handleBulkPriceUpdate);
router.patch('/items/:id/status', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: menu_schema_1.updateItemStatusSchema }), menu_controller_1.handleUpdateItemStatus);
router.patch('/items/:id', (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)({ body: menu_schema_1.updateItemSchema }), menu_controller_1.handleUpdateItem);
router.delete('/items/:id', (0, rbac_middleware_1.requireRole)('manager', 'owner'), menu_controller_1.handleDeleteItem);
exports.default = router;
//# sourceMappingURL=menu.routes.js.map