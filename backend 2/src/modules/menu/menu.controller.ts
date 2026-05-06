import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import {
  getPublicMenu,
  getBranchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemStatus,
  bulkPriceUpdate,
} from './menu.service';

// ─── Helper: forward known HTTP errors to the appropriate HTTP status ─────────

function handleKnownError(err: any, res: Response, next: NextFunction) {
  const code = err.statusCode ?? err.status;
  if (code && code >= 400 && code < 500) {
    return res.status(code).json(error(err.message));
  }
  next(err);
}

// ─── Public Menu ──────────────────────────────────────────────────────────────

export async function handleGetPublicMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const menu = await getPublicMenu(req.params.branchId);
    res.json(success(menu));
  } catch (err) {
    next(err);
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function handleGetCategories(req: Request, res: Response, next: NextFunction) {
  try {
    // FIX: use req.params.branchId (route param) when present, fall back to tenant branchId
    const branchId = req.params.branchId ?? req.branchId;
    if (!branchId) return res.status(400).json(error('branchId is required'));
    const cats = await getBranchCategories(branchId);
    res.json(success(cats));
  } catch (err) {
    next(err);
  }
}

export async function handleCreateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    // FIX: guard missing tenant context explicitly for a better error message
    if (!req.branchId || !req.restaurantId) {
      return res.status(403).json(error('Missing tenant context'));
    }
    const cat = await createCategory(req.branchId, req.restaurantId, req.body);
    res.status(201).json(success(cat, 'Category created'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleUpdateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.branchId) return res.status(403).json(error('Missing tenant context'));
    const cat = await updateCategory(req.params.id, req.branchId, req.body);
    res.json(success(cat, 'Category updated'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleDeleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.branchId) return res.status(403).json(error('Missing tenant context'));
    const result = await deleteCategory(req.params.id, req.branchId);
    res.json(success(result, 'Category deleted'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleReorderCategories(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.branchId) return res.status(403).json(error('Missing tenant context'));
    // FIX: guard against missing ordered_ids in body before calling service
    if (!req.body.ordered_ids || !Array.isArray(req.body.ordered_ids)) {
      return res.status(400).json(error('ordered_ids must be an array'));
    }
    const result = await reorderCategories(req.branchId, req.body.ordered_ids);
    res.json(success(result, 'Categories reordered'));
  } catch (err) {
    next(err);
  }
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function handleCreateItem(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.branchId || !req.restaurantId) {
      return res.status(403).json(error('Missing tenant context'));
    }
    const item = await createMenuItem(req.branchId, req.restaurantId, req.body);
    res.status(201).json(success(item, 'Menu item created'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleGetItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await getMenuItemById(req.params.id);
    res.json(success(item));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleUpdateItem(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.branchId) return res.status(403).json(error('Missing tenant context'));
    const item = await updateMenuItem(req.params.id, req.branchId, req.body);
    res.json(success(item, 'Menu item updated'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleDeleteItem(req: Request, res: Response, next: NextFunction) {
  // FIX: original was missing error handling — any DB error would crash the process
  try {
    if (!req.branchId) return res.status(403).json(error('Missing tenant context'));
    const result = await deleteMenuItem(req.params.id, req.branchId);
    res.json(success(result, 'Menu item deleted'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleUpdateItemStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.branchId) return res.status(403).json(error('Missing tenant context'));
    // FIX: validate status field present before service call (schema validates values,
    // but if validate middleware is skipped the controller should still guard)
    if (!req.body.status) return res.status(400).json(error('status is required'));
    const item = await updateMenuItemStatus(req.params.id, req.branchId, req.body.status);
    res.json(success(item, 'Item status updated'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}

export async function handleBulkPriceUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.branchId) return res.status(403).json(error('Missing tenant context'));
    // FIX: guard missing item_ids before service call
    if (!req.body.item_ids || req.body.item_ids.length === 0) {
      return res.status(400).json(error('item_ids must be a non-empty array'));
    }
    const result = await bulkPriceUpdate(req.branchId, req.body);
    res.json(success(result, 'Prices updated'));
  } catch (err: any) {
    handleKnownError(err, res, next);
  }
}