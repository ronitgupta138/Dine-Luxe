import { Request, Response, NextFunction } from 'express';
import * as reviewsService from './reviews.service';
import { success } from '../../utils/response';

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reviewsService.create(req.user!.id, req.body);
    res.status(201).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getByRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const minRating = req.query.min_rating ? Number(req.query.min_rating) : undefined;
    const maxRating = req.query.max_rating ? Number(req.query.max_rating) : undefined;
    const result = await reviewsService.getByRestaurant(req.params.id, page, limit, minRating, maxRating);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getByBranch(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await reviewsService.getByBranch(req.params.id, page, limit);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getByOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reviewsService.getByOrder(req.params.orderId, req.user!.id);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewsService.deleteReview(req.params.id);
    res.json(success({ message: 'Review deleted' }));
  } catch (err) {
    next(err);
  }
}
