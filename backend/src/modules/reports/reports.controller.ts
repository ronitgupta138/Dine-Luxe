import { Request, Response, NextFunction } from 'express';
import * as reportsService from './reports.service';
import { success, error } from '../../utils/response';

type AuthenticatedRequest = Request & {
  user: { id: string; branch_id?: string; role: string; restaurant_id?: string };
  restaurantId: string;
  branchId: string;
};

export async function getSales(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { branch_id, from, to, granularity = 'daily' } = req.query as any;
    const restaurant_id = authReq.user?.restaurant_id;
    if (!restaurant_id) {
      return res.status(400).json(error('VALIDATION_ERROR', 'Restaurant context is required'));
    }

    const data = await reportsService.getSales({
      branch_id,
      restaurant_id,
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
    const authReq = req as AuthenticatedRequest;
    const { branch_id } = req.query as any;
    const restaurant_id = authReq.user?.restaurant_id;
    if (!restaurant_id) {
      return res.status(400).json(error('VALIDATION_ERROR', 'Restaurant context is required'));
    }

    const data = await reportsService.getMenuPerformance(restaurant_id, branch_id);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getKitchenPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { branch_id, from, to } = req.query as any;
    const data = await reportsService.getKitchenPerformance(
      branch_id ?? authReq.user?.branch_id,
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
    const authReq = req as AuthenticatedRequest;
    const restaurant_id = authReq.user?.restaurant_id;
    if (!restaurant_id) {
      return res.status(400).json(error('VALIDATION_ERROR', 'Restaurant context is required'));
    }

    const data = await reportsService.getCustomerInsights(restaurant_id);
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
    const authReq = req as AuthenticatedRequest;

    // BUG FIX: original used `authReq.user!.restaurant_id` (non-null assertion)
    // but restaurant_id is optional on the JWT type — guard it explicitly.
    const restaurant_id = authReq.user?.restaurant_id;
    if (!restaurant_id) {
      return res
        .status(400)
        .json(error('VALIDATION_ERROR', 'Restaurant context is required for export'));
    }

    const reportType = String(req.body.report_type);
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const from = req.body.from ?? defaultFrom;
    const to = req.body.to ?? now.toISOString();

    if (['sales', 'kitchen-performance'].includes(reportType) && (!req.body.from || !req.body.to)) {
      return res
        .status(400)
        .json(error('VALIDATION_ERROR', 'from and to are required for this report_type'));
    }

    if (new Date(from).getTime() > new Date(to).getTime()) {
      return res
        .status(400)
        .json(error('VALIDATION_ERROR', 'from must be less than or equal to to'));
    }

    const result = await reportsService.exportReport({
      ...req.body,
      report_type: reportType,
      from,
      to,
      restaurant_id,
      requested_by: authReq.user.id,
    });
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
