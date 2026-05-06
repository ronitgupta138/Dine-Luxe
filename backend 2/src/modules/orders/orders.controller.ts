import { Request, Response, NextFunction } from 'express';
import { success } from '../../utils/response';
import {
  createOrder,
  getOrderById,
  getOrdersByTable,
  getActiveBranchOrders,
  cancelOrder,
} from './orders.service';

export async function handleCreateOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await createOrder(
      req.body,
      req.restaurantId!,
      req.branchId!,
      req.user!.id
    );
    res.status(201).json(success(order, 'Order created successfully'));
  } catch (err) {
    next(err);
  }
}

export async function handleGetOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await getOrderById(req.params.id, req.branchId!);
    res.json(success(order));
  } catch (err) {
    next(err);
  }
}

export async function handleGetOrdersByTable(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await getOrdersByTable(req.params.tableId, req.branchId!);
    res.json(success(orders));
  } catch (err) {
    next(err);
  }
}

export async function handleGetActiveBranchOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await getActiveBranchOrders(req.params.branchId);
    res.json(success(orders));
  } catch (err) {
    next(err);
  }
}

export async function handleCancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await cancelOrder(req.params.id, req.branchId!, req.body.reason);
    res.json(success(order, 'Order cancelled'));
  } catch (err) {
    next(err);
  }
}
