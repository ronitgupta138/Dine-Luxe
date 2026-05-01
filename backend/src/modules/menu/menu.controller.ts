import { Request, Response, NextFunction } from 'express';
import { success } from '../../utils/response';
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
    const cats = await getBranchCategories(req.params.branchId);
    res.json(success(cats));
  } catch (err) {
    next(err);
  }
}

export async function handleCreateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await createCategory(req.branchId!, req.restaurantId!, req.body);
    res.status(201).json(success(cat, 'Category created'));
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await updateCategory(req.params.id, req.branchId!, req.body);
    res.json(success(cat, 'Category updated'));
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteCategory(req.params.id, req.branchId!);
    res.json(success(result, 'Category deleted'));
  } catch (err) {
    next(err);
  }
}

export async function handleReorderCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reorderCategories(req.branchId!, req.body.ordered_ids);
    res.json(success(result, 'Categories reordered'));
  } catch (err) {
    next(err);
  }
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function handleCreateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await createMenuItem(req.branchId!, req.restaurantId!, req.body);
    res.status(201).json(success(item, 'Menu item created'));
  } catch (err) {
    next(err);
  }
}

export async function handleGetItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await getMenuItemById(req.params.id);
    res.json(success(item));
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await updateMenuItem(req.params.id, req.branchId!, req.body);
    res.json(success(item, 'Menu item updated'));
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteMenuItem(req.params.id, req.branchId!);
    res.json(success(result, 'Menu item deleted'));
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateItemStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await updateMenuItemStatus(req.params.id, req.branchId!, req.body.status);
    res.json(success(item, 'Item status updated'));
  } catch (err) {
    next(err);
  }
}

export async function handleBulkPriceUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bulkPriceUpdate(req.branchId!, req.body);
    res.json(success(result, 'Prices updated'));
  } catch (err) {
    next(err);
  }
}
