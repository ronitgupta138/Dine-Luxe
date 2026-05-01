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
    res.status(201).json(success(data));
  } catch (err) { next(err); }
}

export async function publishLayout(req: Request, res: Response, next: NextFunction) {
  try {
    const { layout_version } = req.body;
    if (typeof layout_version !== 'number') {
      return res.status(400).json(error('layout_version (number) is required for optimistic locking'));
    }
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
