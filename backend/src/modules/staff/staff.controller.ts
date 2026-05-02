import { Request, Response, NextFunction } from 'express';
import * as staffService from './staff.service';
import { success } from '../../utils/response';

type AuthenticatedRequest = Request & {
  user: { id: string; branch_id?: string; role: string; restaurant_id?: string };
  restaurantId: string;
  branchId: string;
};

// GET /staff/branch/:branchId
export async function getByBranch(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const staff = await staffService.getByBranch(req.params.branchId, authReq.restaurantId!);
    res.json(success(staff));
  } catch (err) { next(err); }
}

// POST /staff/create
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const staff = await staffService.create(
      req.body,
      authReq.restaurantId!,
      authReq.user!.id,
      authReq.user!.branch_id ?? '',
      authReq.user!.role,
      req.ip ?? 'unknown'
    );
    res.status(201).json(success(staff, 'Staff account created'));
  } catch (err) { next(err); }
}

// GET /staff/:id
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const staff = await staffService.getById(req.params.id, authReq.restaurantId!);
    res.json(success(staff));
  } catch (err) { next(err); }
}

// PATCH /staff/:id
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const staff = await staffService.update(req.params.id, authReq.restaurantId!, req.body);
    res.json(success(staff, 'Staff updated'));
  } catch (err) { next(err); }
}

// PATCH /staff/:id/toggle-access
export async function toggleAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const staff = await staffService.toggleAccess(
      req.params.id,
      authReq.restaurantId!,
      authReq.user!.id,
      req.ip ?? 'unknown'
    );
    res.json(success(staff, `Access ${staff.is_active ? 'enabled' : 'disabled'}`));
  } catch (err) { next(err); }
}

// GET /staff/:id/performance
export async function getPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const perf = await staffService.getPerformance(req.params.id, authReq.restaurantId!);
    res.json(success(perf));
  } catch (err) { next(err); }
}
