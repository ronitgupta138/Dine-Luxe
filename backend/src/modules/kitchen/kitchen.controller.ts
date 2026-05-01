import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import * as kitchenService from './kitchen.service';

export async function getTickets(req: Request, res: Response, next: NextFunction) {
  try {
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
    if (err.statusCode === 422) return res.status(422).json(error(err.message, err.meta));
    next(err);
  }
}

export async function getOverdueOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await kitchenService.getOverdueOrders(req.params.branchId);
    res.json(success(data));
  } catch (err) { next(err); }
}
