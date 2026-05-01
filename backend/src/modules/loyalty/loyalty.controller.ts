import { Request, Response, NextFunction } from 'express';
import * as loyaltyService from './loyalty.service';
import { success } from '../../utils/response';

// TODO: Phase 2 — Implement loyalty points system

export async function getBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await loyaltyService.getBalance(req.params.userId);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function earnPoints(req: Request, res: Response, next: NextFunction) {
  try {
    const { order_id, amount_paid } = req.body;
    const data = await loyaltyService.earn(req.user!.id, order_id, amount_paid);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function redeemPoints(req: Request, res: Response, next: NextFunction) {
  try {
    const { order_id, points_to_redeem } = req.body;
    const data = await loyaltyService.redeem(req.user!.id, order_id, points_to_redeem);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await loyaltyService.getHistory(req.params.userId, page, limit);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
