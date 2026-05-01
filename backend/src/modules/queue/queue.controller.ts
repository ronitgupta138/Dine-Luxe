import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';
import * as queueService from './queue.service';

export async function joinQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.joinQueue({ ...req.body, user_id: req.user?.id });
    res.status(201).json(success(data));
  } catch (err) { next(err); }
}

export async function getBranchQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, total, page, limit } = await queueService.getBranchQueue(req.params.branchId, req.query as any);
    res.json(success(data, buildPaginationMeta(total, page, limit)));
  } catch (err) { next(err); }
}

export async function getQueuePosition(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.getQueuePosition(req.params.id);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function markArrived(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.markQueueArrived(req.params.id);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function assignTable(req: Request, res: Response, next: NextFunction) {
  try {
    const { table_id } = req.body;
    if (!table_id) return res.status(400).json(error('table_id is required'));
    const data = await queueService.assignTable(req.params.id, table_id, req.user!.id);
    res.json(success(data));
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json(error(err.message));
    next(err);
  }
}

export async function markNoShow(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.markQueueNoShow(req.params.id);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function removeFromQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.removeFromQueue(req.params.id);
    res.json(success(data));
  } catch (err) { next(err); }
}
