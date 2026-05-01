import { Request, Response, NextFunction } from 'express';
import { success } from '../../utils/response';
import { getOrderItems, serveItem, updateItemStatus } from './order-items.service';

export async function handleGetOrderItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await getOrderItems(req.params.orderId, req.branchId!);
    res.json(success(items));
  } catch (err) {
    next(err);
  }
}

export async function handleServeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await serveItem(req.params.id, req.branchId!);
    res.json(success(result, 'Item marked as served'));
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateItemStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await updateItemStatus(req.params.id, req.branchId!, req.body.status);
    res.json(success(result, 'Item status updated'));
  } catch (err) {
    next(err);
  }
}
