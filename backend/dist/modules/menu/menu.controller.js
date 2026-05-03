"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetPublicMenu = handleGetPublicMenu;
exports.handleGetCategories = handleGetCategories;
exports.handleCreateCategory = handleCreateCategory;
exports.handleUpdateCategory = handleUpdateCategory;
exports.handleDeleteCategory = handleDeleteCategory;
exports.handleReorderCategories = handleReorderCategories;
exports.handleCreateItem = handleCreateItem;
exports.handleGetItem = handleGetItem;
exports.handleUpdateItem = handleUpdateItem;
exports.handleDeleteItem = handleDeleteItem;
exports.handleUpdateItemStatus = handleUpdateItemStatus;
exports.handleBulkPriceUpdate = handleBulkPriceUpdate;
const response_1 = require("../../utils/response");
const menu_service_1 = require("./menu.service");
// ─── Helper: forward known HTTP errors to the appropriate HTTP status ─────────
function handleKnownError(err, res, next) {
    const code = err.statusCode ?? err.status;
    if (code && code >= 400 && code < 500) {
        return res.status(code).json((0, response_1.error)(err.message));
    }
    next(err);
}
// ─── Public Menu ──────────────────────────────────────────────────────────────
async function handleGetPublicMenu(req, res, next) {
    try {
        const menu = await (0, menu_service_1.getPublicMenu)(req.params.branchId);
        res.json((0, response_1.success)(menu));
    }
    catch (err) {
        next(err);
    }
}
// ─── Categories ───────────────────────────────────────────────────────────────
async function handleGetCategories(req, res, next) {
    try {
        // FIX: use req.params.branchId (route param) when present, fall back to tenant branchId
        const branchId = req.params.branchId ?? req.branchId;
        if (!branchId)
            return res.status(400).json((0, response_1.error)('branchId is required'));
        const cats = await (0, menu_service_1.getBranchCategories)(branchId);
        res.json((0, response_1.success)(cats));
    }
    catch (err) {
        next(err);
    }
}
async function handleCreateCategory(req, res, next) {
    try {
        // FIX: guard missing tenant context explicitly for a better error message
        if (!req.branchId || !req.restaurantId) {
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        }
        const cat = await (0, menu_service_1.createCategory)(req.branchId, req.restaurantId, req.body);
        res.status(201).json((0, response_1.success)(cat, 'Category created'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleUpdateCategory(req, res, next) {
    try {
        if (!req.branchId)
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        const cat = await (0, menu_service_1.updateCategory)(req.params.id, req.branchId, req.body);
        res.json((0, response_1.success)(cat, 'Category updated'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleDeleteCategory(req, res, next) {
    try {
        if (!req.branchId)
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        const result = await (0, menu_service_1.deleteCategory)(req.params.id, req.branchId);
        res.json((0, response_1.success)(result, 'Category deleted'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleReorderCategories(req, res, next) {
    try {
        if (!req.branchId)
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        // FIX: guard against missing ordered_ids in body before calling service
        if (!req.body.ordered_ids || !Array.isArray(req.body.ordered_ids)) {
            return res.status(400).json((0, response_1.error)('ordered_ids must be an array'));
        }
        const result = await (0, menu_service_1.reorderCategories)(req.branchId, req.body.ordered_ids);
        res.json((0, response_1.success)(result, 'Categories reordered'));
    }
    catch (err) {
        next(err);
    }
}
// ─── Items ────────────────────────────────────────────────────────────────────
async function handleCreateItem(req, res, next) {
    try {
        if (!req.branchId || !req.restaurantId) {
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        }
        const item = await (0, menu_service_1.createMenuItem)(req.branchId, req.restaurantId, req.body);
        res.status(201).json((0, response_1.success)(item, 'Menu item created'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleGetItem(req, res, next) {
    try {
        const item = await (0, menu_service_1.getMenuItemById)(req.params.id);
        res.json((0, response_1.success)(item));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleUpdateItem(req, res, next) {
    try {
        if (!req.branchId)
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        const item = await (0, menu_service_1.updateMenuItem)(req.params.id, req.branchId, req.body);
        res.json((0, response_1.success)(item, 'Menu item updated'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleDeleteItem(req, res, next) {
    // FIX: original was missing error handling — any DB error would crash the process
    try {
        if (!req.branchId)
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        const result = await (0, menu_service_1.deleteMenuItem)(req.params.id, req.branchId);
        res.json((0, response_1.success)(result, 'Menu item deleted'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleUpdateItemStatus(req, res, next) {
    try {
        if (!req.branchId)
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        // FIX: validate status field present before service call (schema validates values,
        // but if validate middleware is skipped the controller should still guard)
        if (!req.body.status)
            return res.status(400).json((0, response_1.error)('status is required'));
        const item = await (0, menu_service_1.updateMenuItemStatus)(req.params.id, req.branchId, req.body.status);
        res.json((0, response_1.success)(item, 'Item status updated'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function handleBulkPriceUpdate(req, res, next) {
    try {
        if (!req.branchId)
            return res.status(403).json((0, response_1.error)('Missing tenant context'));
        // FIX: guard missing item_ids before service call
        if (!req.body.item_ids || req.body.item_ids.length === 0) {
            return res.status(400).json((0, response_1.error)('item_ids must be a non-empty array'));
        }
        const result = await (0, menu_service_1.bulkPriceUpdate)(req.branchId, req.body);
        res.json((0, response_1.success)(result, 'Prices updated'));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
//# sourceMappingURL=menu.controller.js.map