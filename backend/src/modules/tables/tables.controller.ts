import { Request, Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import * as tablesService from './tables.service';

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
  } catch (err) { next(err); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tablesService.updateTableStatus(req.params.id, req.body, req.user!.id);
    res.json(success(data));
  } catch (err: any) {
    if (err.statusCode === 422) {
      return res.status(422).json(error(err.message, err.meta));
    }
    next(err);
  }
}

export async function mergeTables(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await tablesService.mergeTables(req.body, req.user!.id);
    res.json(success(data));
  } catch (err) { next(err); }
}

export async function deleteTable(req: Request, res: Response, next: NextFunction) {
  try {
    await tablesService.deleteTable(req.params.id);
    res.json(success({ deleted: true }));
  } catch (err) { next(err); }
}
