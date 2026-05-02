import { Request, Response, NextFunction } from 'express';
import * as inventoryService from './inventory.service';
import { success } from '../../utils/response';

type AuthenticatedRequest = Request & {
  user: { id: string; branch_id?: string; role: string; restaurant_id?: string };
  restaurantId: string;
  branchId: string;
};

export async function getInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { branchId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await inventoryService.getInventoryByBranch(branchId, page, limit);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function updateInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await inventoryService.updateInventoryItem(
      req.params.id,
      req.body,
      authReq.user!.id
    );
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function deductInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { branch_id, items } = req.body;
    await inventoryService.deduct(branch_id, items);
    res.json(success({ message: 'Inventory deducted successfully' }));
  } catch (err) {
    next(err);
  }
}

export async function wasteLog(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { inventory_item_id, quantity, reason } = req.body;
    const data = await inventoryService.logWaste(
      inventory_item_id,
      quantity,
      reason,
      authReq.user!.id,
      authReq.user!.branch_id ?? ''
    );
    res.status(201).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const { branchId } = req.params;
    const data = await inventoryService.getAlerts(branchId);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}
