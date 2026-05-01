import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';
import * as bookingsService from './bookings.service';

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.createBooking(req.body, req.user!.id);
    res.status(201).json(success(data));
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json(error(err.message));
    next(err);
  }
}

export async function getBookingById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.getBookingById(req.params.id, req.user!.id, req.user!.role);
    res.json(success(data));
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json(error(err.message));
    next(err);
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, total, page, limit } = await bookingsService.getMyBookings(req.user!.id, req.query as any);
    res.json(success(data, buildPaginationMeta(total, page, limit)));
  } catch (err) { next(err); }
}

export async function getBranchBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, total, page, limit } = await bookingsService.getBranchBookings(req.params.branchId, req.query as any);
    res.json(success(data, buildPaginationMeta(total, page, limit)));
  } catch (err) { next(err); }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.cancelBooking(req.params.id, req.body, req.user!.id, req.user!.role);
    res.json(success(data));
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json(error(err.message));
    next(err);
  }
}

export async function markArrived(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.markArrived(req.params.id);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function markSeated(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.markSeated(req.params.id);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function markNoShow(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.markNoShow(req.params.id);
    res.json(success(data));
  } catch (err) { next(err); }
}
