import { Request, Response, NextFunction } from 'express';
import * as supportService from './support.service';
import { success } from '../../utils/response';

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await supportService.createTicket(req.user!.id, req.body);
    res.status(201).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await supportService.getTickets(
      req.user!.id,
      req.user!.role,
      page,
      limit
    );
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getTicketById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await supportService.getTicketById(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function updateTicketStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, resolution_note } = req.body;
    const data = await supportService.updateTicketStatus(
      req.params.id,
      req.user!.id,
      status,
      resolution_note
    );
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function postMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, attachments } = req.body;
    const data = await supportService.postMessage(
      req.params.id,
      req.user!.id,
      req.user!.role,
      message,
      attachments
    );
    res.status(201).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await supportService.getMessages(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}
