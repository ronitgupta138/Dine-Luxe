import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import * as tablesService from './tables.service';

// ─── Helper ───────────────────────────────────────────────────────────────────

function handleKnownError(err: any, res: Response, next: NextFunction) {
  const code = err.statusCode ?? err.status;
  if (code && code >= 400 && code < 500) {
    return res.status(code).json(error(err.message));
  }
  next(err);
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function getTablesByBranch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tablesService.getTablesByBranch(req.params.branchId);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function createTable(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tablesService.createTable(req.body);
    res.status(201).json(success(data));
  } catch (err: any) { handleKnownError(err, res, next); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tablesService.updateTableStatus(req.params.id, req.body, req.user!.id);
    res.json(success(data));
  } catch (err: any) {
    // FIX: original only caught 422; 404 (table not found) also needs explicit response
    handleKnownError(err, res, next);
  }
}

export async function mergeTables(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tablesService.mergeTables(req.body, req.user!.id);
    res.json(success(data));
  } catch (err: any) {
    // FIX: was missing error handling entirely — merge failures silently 500'd
    handleKnownError(err, res, next);
  }
}

export async function deleteTable(req: Request, res: Response, next: NextFunction) {
  try {
    // FIX: original called deleteTable which returned void — result was discarded.
    // Service now returns { deleted: true }; pass it through.
    const result = await tablesService.deleteTable(req.params.id);
    res.json(success(result));
  } catch (err: any) { handleKnownError(err, res, next); }
}