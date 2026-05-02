import { Request, Response, NextFunction } from 'express';
import * as loyaltyService from './loyalty.service';
import { success, error } from '../../utils/response';

// ─── GET /loyalty/balance — own balance only ───────────────────────────────────

export async function getBalance(req: Request, res: Response, next: NextFunction) {
  try {
    // Security: always use the authenticated user's own ID, never a URL param
    const data = await loyaltyService.getBalance(req.user!.id);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

// ─── POST /loyalty/earn ────────────────────────────────────────────────────────

export async function earnPoints(req: Request, res: Response, next: NextFunction) {
  try {
    const { order_id, amount_paid, restaurant_id } = req.body;

    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json(error('VALIDATION_ERROR', 'order_id is required'));
    }
    if (typeof amount_paid !== 'number' || amount_paid <= 0) {
      return res.status(400).json(error('VALIDATION_ERROR', 'amount_paid must be a positive number'));
    }
    if (!restaurant_id || typeof restaurant_id !== 'string') {
      return res.status(400).json(error('VALIDATION_ERROR', 'restaurant_id is required'));
    }

    const data = await loyaltyService.earn(req.user!.id, order_id, amount_paid, restaurant_id);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

// ─── POST /loyalty/redeem ──────────────────────────────────────────────────────

export async function redeemPoints(req: Request, res: Response, next: NextFunction) {
  try {
    const { order_id, points_to_redeem, restaurant_id } = req.body;

    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json(error('VALIDATION_ERROR', 'order_id is required'));
    }
    if (typeof points_to_redeem !== 'number') {
      return res.status(400).json(error('VALIDATION_ERROR', 'points_to_redeem must be a number'));
    }
    if (!restaurant_id || typeof restaurant_id !== 'string') {
      return res.status(400).json(error('VALIDATION_ERROR', 'restaurant_id is required'));
    }

    const data = await loyaltyService.redeem(req.user!.id, order_id, points_to_redeem, restaurant_id);
    res.json(success(data));
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json(error(err.message));
    next(err);
  }
}

// ─── GET /loyalty/history — own history only ──────────────────────────────────

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    // Security: always use authenticated user's own ID
    const result = await loyaltyService.getHistory(req.user!.id, page, limit);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
