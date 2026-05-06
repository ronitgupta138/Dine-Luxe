import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { success } from '../../utils/response';

// POST /admin/signup  (public — protected by X-Seed-Secret and allows multiple super_admin users)
export async function signupSuperAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createSuperAdmin(req.body);
    res.status(201).json(
      success(data, 'Super admin created. Log in at POST /api/v1/auth/login with your credentials.'),
    );
  } catch (err) {
    next(err);
  }
}

// POST /admin/create-admin  (super_admin JWT required)
export async function createAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createAdmin(req.body);
    res.status(201).json(success(data, 'Admin account created successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDashboard();
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function getPlatformStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getPlatformStats();
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function getHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getHealth();
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function getDetailedHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDetailedHealth();
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function getRestaurants(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const result = await adminService.getRestaurants(page, limit, status);
    res.json(success(result));
  } catch (err) { next(err); }
}

export async function updateRestaurantStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateRestaurantStatus(req.params.id, req.body.status);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function getCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const result = await adminService.getCustomers(page, limit, status);
    res.json(success(result));
  } catch (err) { next(err); }
}

export async function updateCustomerStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateCustomerStatus(req.params.id, req.body.status);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function getFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await adminService.getFeedback(page, limit);
    res.json(success(result));
  } catch (err) { next(err); }
}
