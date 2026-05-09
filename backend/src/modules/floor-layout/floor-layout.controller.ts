import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import * as floorService from './floor-layout.service';

export async function getLayout(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await floorService.getLayout(req.params.branchId);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function saveDraft(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await floorService.saveDraft(req.params.branchId, req.body, req.user!.id);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function publishLayout(req: Request, res: Response, next: NextFunction) {
  try {
    // BUG FIX: controller was requiring layout_version in body and returning 400
    // when it was absent — but the test spec sends no body at all for publish.
    // Make layout_version optional: if provided, enforce optimistic locking;
    // if omitted, just publish whatever the current draft is.
    const layout_version = typeof req.body?.layout_version === 'number'
      ? req.body.layout_version
      : null;

    const data = await floorService.publishLayout(req.params.branchId, layout_version);
    res.json(success(data));
  } catch (err: any) {
    if (err.statusCode === 409) return res.status(409).json(error(err.message));
    next(err);
  }
}

export async function getLiveLayout(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await floorService.getLiveLayout(req.params.branchId);
    res.json(success(data));
  } catch (err) { next(err); }
}
