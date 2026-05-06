import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';
import * as queueService from './queue.service';

// ─── Helper: forward known HTTP errors, pass unknown ones to global handler ───

function handleKnownError(err: any, res: Response, next: NextFunction) {
  const code = err.statusCode ?? err.status;
  if (code && code >= 400 && code < 500) {
    return res.status(code).json(error(err.message));
  }
  next(err);
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function joinQueue(req: Request, res: Response, next: NextFunction) {
  try {
    // FIX: validate required fields before hitting the service
    const { branch_id, people_count } = req.body;
    if (!branch_id) return res.status(400).json(error('branch_id is required'));
    if (!people_count) return res.status(400).json(error('people_count is required'));

    const data = await queueService.joinQueue({ ...req.body, user_id: req.user?.id });
    res.status(201).json(success(data));
  } catch (err: any) { handleKnownError(err, res, next); }
}

export async function getBranchQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, total, page, limit } = await queueService.getBranchQueue(
      req.params.branchId,
      req.query as Record<string, string>,
    );
    res.json(success(data, buildPaginationMeta(total, page, limit)));
  } catch (err) { next(err); }
}

export async function getQueuePosition(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.getQueuePosition(req.params.id);
    res.json(success(data));
  } catch (err: any) { handleKnownError(err, res, next); }
}

export async function markArrived(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.markQueueArrived(req.params.id);
    res.json(success(data));
  } catch (err: any) { handleKnownError(err, res, next); }
}

export async function assignTable(req: Request, res: Response, next: NextFunction) {
  try {
    const { table_id } = req.body;
    if (!table_id) return res.status(400).json(error('table_id is required'));
    const data = await queueService.assignTable(req.params.id, table_id, req.user!.id);
    res.json(success(data));
  } catch (err: any) { handleKnownError(err, res, next); }
}

export async function markNoShow(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.markQueueNoShow(req.params.id);
    // FIX: was returning success(data) but service previously returned {removed:true}
    // Service now returns the updated row — wrap correctly
    res.json(success(data));
  } catch (err: any) { handleKnownError(err, res, next); }
}

export async function removeFromQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await queueService.removeFromQueue(req.params.id);
    res.json(success(data));
  } catch (err: any) { handleKnownError(err, res, next); }
}