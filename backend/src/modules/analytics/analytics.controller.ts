import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service';
import { success } from '../../utils/response';

export async function getMenuSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getMenuSuggestions(req.params.branchId);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getDemandForecast(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getDemandForecast(req.params.branchId);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getBundleOpportunities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getBundleOpportunities(req.params.branchId);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getStaffingRecommendation(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getStaffingRecommendation(req.params.branchId);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}
