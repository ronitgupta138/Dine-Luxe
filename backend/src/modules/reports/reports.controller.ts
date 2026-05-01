import { Request, Response, NextFunction } from 'express';
import * as reportsService from './reports.service';
import { success } from '../../utils/response';

export async function getSales(req: Request, res: Response, next: NextFunction) {
  try {
    const { branch_id, from, to, granularity = 'daily' } = req.query as any;
    const data = await reportsService.getSales({
      branch_id,
      restaurant_id: req.restaurant!.restaurant_id,
      from,
      to,
      granularity,
    });
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getMenuPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const { branch_id } = req.query as any;
    const data = await reportsService.getMenuPerformance(req.restaurant!.restaurant_id, branch_id);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getKitchenPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const { branch_id, from, to } = req.query as any;
    const data = await reportsService.getKitchenPerformance(
      branch_id ?? req.restaurant!.branch_id,
      from,
      to
    );
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getCustomerInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getCustomerInsights(req.restaurant!.restaurant_id);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getAdminPlatform(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getAdminPlatformReport();
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getAdminTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as any;
    const data = await reportsService.getAdminTrends(from, to);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportsService.exportReport({
      ...req.body,
      restaurant_id: req.restaurant!.restaurant_id,
      requested_by: req.user!.id,
    });
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
