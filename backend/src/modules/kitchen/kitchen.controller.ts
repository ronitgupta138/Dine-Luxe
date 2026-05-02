import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import * as kitchenService from './kitchen.service';

export async function getTickets(req: Request, res: Response, next: NextFunction) {
  try {
    // FIX: validate branchId param is present before hitting DB
    if (!req.params.branchId) return res.status(400).json(error('branchId is required'));
    const data = await kitchenService.getKitchenTickets(req.params.branchId);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json(error('status is required'));
    const data = await kitchenService.updateKitchenStatus(req.params.id, status);
    res.json(success(data));
  } catch (err: any) {
    // FIX: original only handled 422; 404 (order not found) and 409 also need
    // explicit HTTP responses — generalise to all 4xx known errors
    const code = err.statusCode ?? err.status;
    if (code && code >= 400 && code < 500) {
      return res.status(code).json(error(err.message, undefined));
    }
    next(err);
  }
}

export async function getOverdueOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.params.branchId) return res.status(400).json(error('branchId is required'));
    const data = await kitchenService.getOverdueOrders(req.params.branchId);
    res.json(success(data));
  } catch (err) { next(err); }
}