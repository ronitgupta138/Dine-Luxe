import { Request, Response, NextFunction } from 'express';
import * as branchesService from './branches.service';
import { success } from '../../utils/response';

type AuthenticatedRequest = Request & {
  user: { id: string; branch_id?: string; role: string; restaurant_id?: string };
  restaurantId: string;
  branchId: string;
};

// GET /branches
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const branches = await branchesService.getAll(authReq.restaurantId!);
    res.json(success(branches));
  } catch (err) { next(err); }
}

// POST /branches
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const branch = await branchesService.create(
      authReq.restaurantId!, req.body, authReq.user!.id, req.ip ?? 'unknown'
    );
    res.status(201).json(success(branch, 'Branch created'));
  } catch (err) { next(err); }
}

// GET /branches/:id
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const branch = await branchesService.getById(req.params.id, authReq.restaurantId!);
    res.json(success(branch));
  } catch (err) { next(err); }
}

// PATCH /branches/:id
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const branch = await branchesService.update(req.params.id, authReq.restaurantId!, req.body);
    res.json(success(branch, 'Branch updated'));
  } catch (err) { next(err); }
}

// PATCH /branches/:id/status
export async function toggleStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const branch = await branchesService.toggleStatus(
      req.params.id, authReq.restaurantId!, req.body, authReq.user!.id, req.ip ?? 'unknown'
    );
    res.json(success(branch, 'Branch status updated'));
  } catch (err) { next(err); }
}

// GET /branches/:id/live-stats
export async function getLiveStats(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const stats = await branchesService.getLiveStats(req.params.id, authReq.restaurantId!);
    res.json(success(stats));
  } catch (err) { next(err); }
}
