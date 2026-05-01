import { Request, Response, NextFunction } from 'express';
import * as branchesService from './branches.service';
import { success } from '../../utils/response';

// GET /branches
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const branches = await branchesService.getAll(req.restaurantId);
    res.json(success(branches));
  } catch (err) { next(err); }
}

// POST /branches
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const branch = await branchesService.create(
      req.restaurantId, req.body, req.user.id, req.ip ?? 'unknown'
    );
    res.status(201).json(success(branch, 'Branch created'));
  } catch (err) { next(err); }
}

// GET /branches/:id
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const branch = await branchesService.getById(req.params.id, req.restaurantId);
    res.json(success(branch));
  } catch (err) { next(err); }
}

// PATCH /branches/:id
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const branch = await branchesService.update(req.params.id, req.restaurantId, req.body);
    res.json(success(branch, 'Branch updated'));
  } catch (err) { next(err); }
}

// PATCH /branches/:id/status
export async function toggleStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const branch = await branchesService.toggleStatus(
      req.params.id, req.restaurantId, req.body, req.user.id, req.ip ?? 'unknown'
    );
    res.json(success(branch, 'Branch status updated'));
  } catch (err) { next(err); }
}

// GET /branches/:id/live-stats
export async function getLiveStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await branchesService.getLiveStats(req.params.id, req.restaurantId);
    res.json(success(stats));
  } catch (err) { next(err); }
}
